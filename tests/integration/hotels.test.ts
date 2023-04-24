import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import httpStatus from 'http-status';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createHotelTest,
  createRoomsTest,
  createTickeTypetWithNoHotelTest,
  createTicketTypeRemoteTest,
  createTicketTypeIncludingHotelTest,
  createEnrollmentWithAddress,
  createPayment,
  createTicket,
  createUser,
  createTicketType,
} from '../factories';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const apiTest = supertest(app);

describe('GET /hotels', () => {
  describe('case: invalid token or does not exist', () => {
    it('response: status 401 when token is not given', async () => {
      const test = await apiTest.get('/hotels');

      expect(test.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('response: status 401 when token is invalid', async () => {
      const tokenTest = 'x';
      const test = await apiTest.get('/hotels').set('Authorization', `Bearer ${tokenTest}`);

      expect(test.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('response: status 401 when the given token does not match with any session', async () => {
      const userNoSessionTest = await createUser();
      const tokenTest = jwt.sign({ userId: userNoSessionTest.id }, process.env.JWT_SECRET);

      const test = await apiTest.get('/hotels').set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('case: valid token', () => {
    it('response: status 404 when the given userId does not match with any enrollment', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);

      const test = await apiTest.get('/hotels').set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.NOT_FOUND);
    });

    it('response: status 404 when the user does not have a ticket', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken();

      await createEnrollmentWithAddress(userTest);

      const test = await apiTest.get('/hotels').set('Authorization', `Bearer ${tokenTest}`);

      expect(test.status).toBe(httpStatus.NOT_FOUND);
    });

    it('response: status 402 when the ticket was not paid', async () => {
      const userTest = await createUser();
      const tokenTest = generateValidToken(userTest);
      const enrollmentTest = await createEnrollmentWithAddress(userTest);
      const ticketTypeTest = await createTicketType();
      await createTicket(enrollmentTest.id, ticketTypeTest.id, 'RESERVED');

      const test = await apiTest.get('/hotels').set('Authorization', `Bearer ${tokenTest}`);

      expect(test.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('response: status 402 when the ticketType is remote', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const enrollmentTest = await createEnrollmentWithAddress(userTest);
      const ticketTypeTest = await createTicketTypeRemoteTest();
      await createTicket(enrollmentTest.id, ticketTypeTest.id, 'PAID');

      const test = await apiTest.get('/hotels').set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('response: status 402 when the ticket does not include hotel', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const enrollmentTest = await createEnrollmentWithAddress(userTest);
      const ticketTypeTest = await createTickeTypetWithNoHotelTest();
      await createTicket(enrollmentTest.id, ticketTypeTest.id, 'PAID');

      const test = await apiTest.get('/hotels').set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('response: status 404 if the search for hotels returns nothing', async () => {
      const tokenTest = await generateValidToken();

      const test = await apiTest.get('/hotels').set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.NOT_FOUND);
    });

    it('response: status 200 and the list of all hotels found', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const enrollmentTest = await createEnrollmentWithAddress(userTest);
      const ticketTypeTest = await createTicketTypeIncludingHotelTest();
      const ticketTest = await createTicket(enrollmentTest.id, ticketTypeTest.id, 'PAID');
      await createPayment(ticketTest.id, ticketTypeTest.price);
      const hotelTest = await createHotelTest();

      const test = await apiTest.get('/hotels').set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.OK);

      expect(test.body).toEqual([
        {
          id: hotelTest.id,
          name: hotelTest.name,
          image: hotelTest.image,
          createdAt: hotelTest.createdAt.toISOString(),
          updatedAt: hotelTest.updatedAt.toISOString(),
        },
      ]);
    });
  });
});

describe('GET /hotels/:hotelId', () => {
  describe('case: the token is invalid or does not exist', () => {
    it('response: status 401 when the token is not given', async () => {
      const test = await apiTest.get('/hotels/1');

      expect(test.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('response: status 401 when the token is invalid', async () => {
      const tokenTest = 'x';
      const test = await apiTest.get('/hotels/1').set('Authorization', `Bearer ${tokenTest}`);

      expect(test.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('response: status 401 when the given token does not match with any session', async () => {
      const userTest = await createUser();
      const tokenTest = jwt.sign({ userId: userTest.id }, process.env.JWT_SECRET);

      const test = await apiTest.get('/hotels/1').set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('When the token is valid', () => {
    it('response: status 404 when the given userId does not match with any enrollment', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);

      const test = await apiTest.get('/hotels/1').set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.NOT_FOUND);
    });

    it('response: status 404 when the user does not have a ticket', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);

      await createEnrollmentWithAddress(userTest);

      const test = await apiTest.get('/hotels/1').set('Authorization', `Bearer ${tokenTest}`);

      expect(test.status).toBe(httpStatus.NOT_FOUND);
    });

    it('response: status 402 when the ticket was not paid', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const enrollmentTest = await createEnrollmentWithAddress(userTest);
      const ticketTypeTest = await createTicketType();

      await createTicket(enrollmentTest.id, ticketTypeTest.id, 'RESERVED');

      const test = await apiTest.get('/hotels/1').set('Authorization', `Bearer ${tokenTest}`);

      expect(test.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('response: status 402 when the ticket type is remote', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const enrollmentTest = await createEnrollmentWithAddress(userTest);
      const ticketTypeTest = await createTicketTypeRemoteTest();

      await createTicket(enrollmentTest.id, ticketTypeTest.id, 'PAID');
      const test = await apiTest.get('/hotels/1').set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('response: status 402 when the ticket does not include hotel', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const enrollmentTest = await createEnrollmentWithAddress(userTest);
      const ticketTypeTest = await createTickeTypetWithNoHotelTest();

      await createTicket(enrollmentTest.id, ticketTypeTest.id, 'PAID');

      const test = await apiTest.get('/hotels/1').set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('response: status 404 if the search for hotels returns nothing', async () => {
      const tokenTest = await generateValidToken();
      const test = await apiTest.get('/hotels/1').set('Authorization', `Bearer ${tokenTest}`);

      expect(test.status).toBe(httpStatus.NOT_FOUND);
    });

    it('response: status 200 and the hotel and respective rooms', async () => {
      const userTest = await createUser();
      const tokenTest = await generateValidToken(userTest);
      const enrollmentTest = await createEnrollmentWithAddress(userTest);
      const ticketTypeTest = await createTicketTypeIncludingHotelTest();
      const ticketTest = await createTicket(enrollmentTest.id, ticketTypeTest.id, 'PAID');

      await createPayment(ticketTest.id, ticketTypeTest.price);

      const hotelTest = await createHotelTest();
      const roomTest = await createRoomsTest(hotelTest.id);

      const test = await apiTest.get(`/hotels/${hotelTest.id}`).set('Authorization', `Bearer ${tokenTest}`);
      expect(test.status).toBe(httpStatus.OK);

      expect(test.body).toEqual({
        id: hotelTest.id,
        name: hotelTest.name,
        image: hotelTest.image,
        createdAt: hotelTest.createdAt.toISOString(),
        updatedAt: hotelTest.updatedAt.toISOString(),
        Rooms: [
          {
            id: roomTest.id,
            name: roomTest.name,
            capacity: roomTest.capacity,
            hotelId: roomTest.hotelId,
            createdAt: roomTest.createdAt.toISOString(),
            updatedAt: roomTest.updatedAt.toISOString(),
          },
        ],
      });
    });
  });
});
