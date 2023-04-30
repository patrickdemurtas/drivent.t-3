import hotelsService from '../hotels-service';
import { notFoundError, bookingError } from '@/errors';
import bookingsRepository from '@/repositories/bookings-repository';

async function checkRoomStatus(roomId: number) {
  const infoRoom = await bookingsRepository.checkRoomById(roomId);

  if (!infoRoom) {
    throw notFoundError();
  }

  const infoBookings = await bookingsRepository.bookingsCount(roomId);
  if (infoRoom.capacity <= infoBookings) {
    throw bookingError();
  }

  return infoRoom;
}

async function listBooking(userId: number) {
  const infoBooking = await bookingsRepository.listBooking(userId);
  if (!infoBooking) {
    throw notFoundError();
  }

  return infoBooking;
}

async function assignBooking(userId: number, roomId: number) {
  await hotelsService.checkTicketAndEnrollBooking(userId);
  await checkRoomStatus(roomId);

  return await bookingsRepository.assignBooking(userId, roomId);
}

async function changeBooking(userId: number, bookingId: string, roomId: number) {
  await checkRoomStatus(roomId);
  const infoBookingId = Number(bookingId);
  const infoUserBooking = await bookingsRepository.listBooking(userId);

  if (!infoUserBooking) {
    throw bookingError();
  }

  return await bookingsRepository.changeBooking(roomId, infoBookingId, userId);
}

export default {
  checkRoomStatus,
  listBooking,
  assignBooking,
  changeBooking,
};
