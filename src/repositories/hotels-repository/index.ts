import { Hotel } from '@prisma/client';
import { prisma } from '@/config';

async function listHotels(): Promise<Hotel[]> {
  return prisma.hotel.findMany();
}

export default { listHotels };
