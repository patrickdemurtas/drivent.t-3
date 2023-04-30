import { prisma } from '@/config';

export async function createBookingTest(userId: number, roomId: number) {
  return await prisma.booking.create({ data: { userId: userId, roomId: roomId } });
}
