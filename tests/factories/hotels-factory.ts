import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotelTest() {
  return await prisma.hotel.create({
    data: { name: faker.company.companyName(), image: faker.image.imageUrl() },
  });
}

export async function createRoomsTest(hotelId: number) {
  return await prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: faker.datatype.number(),
      hotelId: hotelId,
    },
  });
}

export async function createRoomWithCapacityTest(hotelId: number) {
  return await prisma.room.create({
    data: { name: faker.name.findName(), capacity: 1, hotelId: hotelId },
  });
}
