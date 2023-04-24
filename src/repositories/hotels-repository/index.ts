import { Hotel, Room } from '@prisma/client';
import { prisma } from '@/config';

async function listHotels(): Promise<Hotel[]> {
  return prisma.hotel.findMany();
}

async function listRooms(hotelId: number): Promise<Hotel & { Rooms: Room[] }> {
  return await prisma.hotel.findFirst({
    where: { id: hotelId },
    include: { Rooms: true },
  });
}

export default {
  listHotels,
  listRooms,
};
