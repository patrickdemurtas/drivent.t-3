import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import httpStatus from 'http-status';
import { cleanDb, generateValidToken } from '../helpers';
import { createBookingTest } from '../factories/booking-factory';
import {
  createHotelTest,
  createPayment,
  createEnrollmentWithAddress,
  createRoomWithCapacityTest,
  createRoomsTest,
  createTicket,
  createTicketType,
  createTicketTypeIncludingHotelTest,
  createTicketTypeRemoteTest,
  createUser,
  createTickeTypetWithNoHotelTest,
} from '../factories';

import app, { init } from '@/app';

beforeAll(async () => await init());

beforeEach(async () => await cleanDb());

const apiTest = supertest(app);

describe('GET /booking', () => {
  describe('case: the token is invalid or does not exist', () => {
    it('response: status 401 when token is not given', async () => {
      const test = await apiTest.get('/booking');
      expect(test.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('response: status 401 when token is invalid', async () => {
      const tokenTest = 'x';
      const test = await apiTest.get('/booking').set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('response: status 401 if token does not match with any session', async () => {
      const userTest = await createUser();
      const tokenTest = await jwt.sign({ userId: userTest.id }, process.env.JWT_SECRET);
      const test = await apiTest.get('/booking').set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('case: token is valid', () => {
    it('response: status 200 and booking', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const hotelTest = await createHotelTest();
      const roomTest = await createRoomsTest(hotelTest.id);
      const bookingTest = await createBookingTest(userTest.id, roomTest.id);
      const test = await apiTest.get('/booking').set('Authorization', `Bearer ${tokenTest}`);

      expect(test.status).toBe(httpStatus.OK);
      expect(test.body).toEqual({
        id: bookingTest.id,
        Room: {
          id: roomTest.id,
          name: roomTest.name,
          capacity: roomTest.capacity,
          hotelId: roomTest.hotelId,
          createdAt: roomTest.createdAt.toISOString(),
          updatedAt: roomTest.updatedAt.toISOString(),
        },
      });
    });

    it('response: status 401 if user does not have a booking', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const test = await apiTest.get('/booking').set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.NOT_FOUND);
    });
  });
});

describe('POST /booking', () => {
  describe('case: token is invalid or does not exist', () => {
    it('response: status 401 when token is not given', async () => {
      const test = await apiTest.get('/booking');
      expect(test.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('response: status 401 when token is invalid', async () => {
      const tokenTest = 'x';
      const test = await apiTest.get('/booking').set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('response: status 401 if token does not match with any session', async () => {
      const userTest = await createUser();
      const tokenTest = await jwt.sign({ userId: userTest.id }, process.env.JWT_SECRET);
      const test = await apiTest.get('/booking').set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('case: token is valid', () => {
    it('response: status 200 and booking id', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const enrollmentTest = await createEnrollmentWithAddress(userTest);
      const ticketTypeTest = await createTicketTypeIncludingHotelTest();
      const ticketTest = await createTicket(enrollmentTest.id, ticketTypeTest.id, 'PAID');
      await createPayment(ticketTest.id, ticketTypeTest.price);
      const hotelTest = await createHotelTest();
      const roomTest = await createRoomsTest(hotelTest.id);

      const test = await apiTest
        .post('/booking')
        .set('Authorization', `Bearer ${tokenTest}`)
        .send({ roomId: roomTest.id });
      expect(test.status).toBe(httpStatus.OK);
      expect(test.body).toEqual({ bookingId: expect.any(Number) });
    });

    it('response: status 400 if roomId is missing', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const test = await apiTest.post('/booking').set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('response: status 404 if user does not have a enrollment', async () => {
      const tokenTest = await generateValidToken();
      const test = await apiTest.post('/booking').set('Authorization', `Bearer ${tokenTest}`).send({ roomId: 1 });
      expect(test.status).toBe(httpStatus.NOT_FOUND);
    });

    it('response: status 404 if user does not have a ticket', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      await createEnrollmentWithAddress(userTest);

      const test = await apiTest.post('/booking').set('Authorization', `Bearer ${tokenTest}`).send({ roomId: 1 });
      expect(test.status).toBe(httpStatus.NOT_FOUND);
    });

    it('response: status 403 if the ticket has not been paid', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const enrollmentTest = await createEnrollmentWithAddress(userTest);
      const ticketTypeTest = await createTicketType();
      await createTicket(enrollmentTest.id, ticketTypeTest.id, 'RESERVED');

      const test = await apiTest.post('/booking').set('Authorization', `Bearer ${tokenTest}`).send({ roomId: 1 });
      expect(test.status).toBe(httpStatus.FORBIDDEN);
    });

    it('response: status 403 if the ticket type is remote', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const enrollmentTest = await createEnrollmentWithAddress(userTest);
      const ticketTypeTest = await createTicketTypeRemoteTest();
      await createTicket(enrollmentTest.id, ticketTypeTest.id, 'PAID');

      const test = await apiTest.post('/booking').set('Authorization', `Bearer ${tokenTest}`).send({ roomId: 1 });
      expect(test.status).toBe(httpStatus.FORBIDDEN);
    });

    it('response: status 403 if the ticket does not include hotel', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const enrollmentTest = await createEnrollmentWithAddress(userTest);
      const ticketTypeTest = await createTickeTypetWithNoHotelTest();
      await createTicket(enrollmentTest.id, ticketTypeTest.id, 'PAID');

      const test = await apiTest.post('/booking').set('Authorization', `Bearer ${tokenTest}`).send({ roomId: 1 });
      expect(test.status).toBe(httpStatus.FORBIDDEN);
    });

    it('response: status 404 if the room does not exist', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const enrollmentTest = await createEnrollmentWithAddress(userTest);
      const ticketTypeTest = await createTicketTypeIncludingHotelTest();
      const ticketTest = await createTicket(enrollmentTest.id, ticketTypeTest.id, 'PAID');
      await createPayment(ticketTest.id, ticketTypeTest.price);
      await createHotelTest();

      const test = await apiTest.post('/booking').set('Authorization', `Bearer ${tokenTest}`).send({ roomId: 1 });
      expect(test.status).toBe(httpStatus.NOT_FOUND);
    });

    it('response: status 403 if the room is not available', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const enrollmentTest = await createEnrollmentWithAddress(userTest);
      const ticketTypeTest = await createTicketTypeIncludingHotelTest();
      const ticketTest = await createTicket(enrollmentTest.id, ticketTypeTest.id, 'PAID');
      await createPayment(ticketTest.id, ticketTypeTest.price);
      const hotelTest = await createHotelTest();
      const roomTest = await createRoomWithCapacityTest(hotelTest.id);
      await createBookingTest(userTest.id, roomTest.id);

      const test = await apiTest
        .post('/booking')
        .set('Authorization', `Bearer ${tokenTest}`)
        .send({ roomId: roomTest.id });
      expect(test.status).toBe(httpStatus.FORBIDDEN);
    });
  });
});

describe('PUT /booking/:bookindId', () => {
  describe('case: token is invalid or does not exist', () => {
    it('response: status 401 when token is not given', async () => {
      const test = await apiTest.get('/booking');
      expect(test.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('response: status 401 if the token is invalid', async () => {
      const tokenTest = 'x';
      const test = await apiTest.get('/booking').set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('response: status 401 if given token does not match with any session', async () => {
      const userTest = await createUser();
      const tokenTest = jwt.sign({ userId: userTest.id }, process.env.JWT_SECRET);
      const test = await apiTest.get('/booking').set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('case: token is valid', () => {
    it('response: status 200 and booking id', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const enrollmentTest = await createEnrollmentWithAddress(userTest);
      const ticketTypeTest = await createTicketTypeIncludingHotelTest();
      const ticketTest = await createTicket(enrollmentTest.id, ticketTypeTest.id, 'PAID');
      await createPayment(ticketTest.id, ticketTypeTest.price);
      const hotelTest = await createHotelTest();
      const roomTest = await createRoomsTest(hotelTest.id);
      const bookingTest = await createBookingTest(userTest.id, roomTest.id);

      const test = await apiTest
        .put(`/booking/${bookingTest.id}`)
        .set('Authorization', `Bearer ${tokenTest}`)
        .send({ roomId: roomTest.id });
      expect(test.status).toBe(httpStatus.OK);

      expect(test.body).toEqual({ bookingId: bookingTest.id });
    });

    it('response: status 400 if roomId is missing', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const hotelTest = await createHotelTest();
      const roomTest = await createRoomsTest(hotelTest.id);
      const bookingTest = await createBookingTest(userTest.id, roomTest.id);

      const test = await apiTest.put(`/booking/${bookingTest.id}`).set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('response: status 404 if the room does not exist', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const enrollmentTest = await createEnrollmentWithAddress(userTest);
      const ticketTypeTest = await createTicketTypeIncludingHotelTest();
      const ticketTest = await createTicket(enrollmentTest.id, ticketTypeTest.id, 'PAID');
      await createPayment(ticketTest.id, ticketTypeTest.price);
      const hotelTest = await createHotelTest();
      const roomTest = await createRoomsTest(hotelTest.id);
      const bookingTest = await createBookingTest(userTest.id, roomTest.id);

      const test = await apiTest
        .put(`/booking/${bookingTest.id}`)
        .set('Authorization', `Bearer ${tokenTest}`)
        .send({ roomId: 2 });
      expect(test.status).toBe(httpStatus.NOT_FOUND);
    });

    it('response: status 403 if the room is not available', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const enrollmentTest = await createEnrollmentWithAddress(userTest);
      const ticketTypeTest = await createTicketTypeIncludingHotelTest();
      const ticketTest = await createTicket(enrollmentTest.id, ticketTypeTest.id, 'PAID');
      await createPayment(ticketTest.id, ticketTypeTest.price);
      const hotelTest = await createHotelTest();
      const roomTest = await createRoomWithCapacityTest(hotelTest.id);
      const bookingTest = await createBookingTest(userTest.id, roomTest.id);

      const test = await apiTest
        .put(`/booking/${bookingTest.id}`)
        .set('Authorization', `Bearer ${tokenTest}`)
        .send({ roomId: roomTest.id });

      expect(test.status).toBe(httpStatus.FORBIDDEN);
    });

    it('response: status 403 if user does not have a booking', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const enrollmentTest = await createEnrollmentWithAddress(userTest);
      const ticketTypeTest = await createTicketTypeIncludingHotelTest();
      const ticketTest = await createTicket(enrollmentTest.id, ticketTypeTest.id, 'PAID');
      await createPayment(ticketTest.id, ticketTypeTest.price);
      const hotelTest = await createHotelTest();
      const roomTest = await createRoomsTest(hotelTest.id);

      const test = await apiTest
        .put(`/booking/1`)
        .set('Authorization', `Bearer ${tokenTest}`)
        .send({ roomId: roomTest.id });

      expect(test.status).toBe(httpStatus.FORBIDDEN);
    });
  });
});
