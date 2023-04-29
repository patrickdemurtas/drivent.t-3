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

export default {
  bookingsCount,
  checkRoomById,
  listBooking,
};
