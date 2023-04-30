import { Hotel, Room } from '@prisma/client';
import hotelsRepository from '@/repositories/hotels-repository';
import { bookingError, notFoundError, paymentErr } from '@/errors';
import ticketsRepository from '@/repositories/tickets-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';

async function listHotels(userId: number): Promise<Hotel[]> {
  await checkTicketAndEnroll(userId);

  const listOfHotels = await hotelsRepository.listHotels();

  if (listOfHotels.length === 0) throw notFoundError();

  return listOfHotels;
}

async function listRooms(hotelId: string, userId: number): Promise<Hotel & { Rooms: Room[] }> {
  await checkTicketAndEnroll(userId);
  const infoHotelId = Number(hotelId);

  const rooms = await hotelsRepository.listRooms(infoHotelId);

  if (!rooms) {
    throw notFoundError();
  }

  return rooms;
}

async function checkTicketAndEnroll(userId: number) {
  const infoEnrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!infoEnrollment) throw notFoundError();

  const infoTicket = await ticketsRepository.findTicketByEnrollmentId(infoEnrollment.id);

  if (!infoTicket) throw notFoundError();

  if (infoTicket.status !== 'PAID' || !infoTicket.TicketType.includesHotel || infoTicket.TicketType.isRemote)
    throw paymentErr();
}

async function checkTicketAndEnrollBooking(userId: number) {
  const infoEnrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!infoEnrollment) throw notFoundError();

  const infoTicket = await ticketsRepository.findTicketByEnrollmentId(infoEnrollment.id);

  if (!infoTicket) throw notFoundError();

  if (infoTicket.status !== 'PAID' || !infoTicket.TicketType.includesHotel || infoTicket.TicketType.isRemote)
    throw bookingError();
}

export default {
  listHotels,
  listRooms,
  checkTicketAndEnroll,
  checkTicketAndEnrollBooking,
};
