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

export default {
  checkRoomStatus,
  listBooking,
};
