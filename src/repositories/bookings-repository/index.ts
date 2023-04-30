import { Room } from '@prisma/client';
import { prisma } from '@/config';

async function bookingsCount(roomId: number) {
  return await prisma.booking.count({ where: { roomId: roomId } });
}

async function checkRoomById(roomId: number): Promise<Room> {
  return await prisma.room.findFirst({ where: { id: roomId } });
}

async function listBooking(userId: number): Promise<{ Room: Room; id: number }> {
  return await prisma.booking.findFirst({
    where: { userId: userId },
    select: { id: true, Room: true },
  });
}

async function assignBooking(userId: number, roomId: number) {
  const assigBooking = await prisma.booking.create({ data: { userId: userId, roomId: roomId } });
  return assigBooking.id;
}

async function changeBooking(roomId: number, bookingId: number, userId: number) {
  const change = await prisma.booking.update({
    where: { id: bookingId },
    data: { roomId: roomId, userId: userId },
  });
  return change.id;
}

export default {
  bookingsCount,
  checkRoomById,
  listBooking,
  assignBooking,
  changeBooking,
};
