import { notFoundError, paymentErr } from '@/errors';
import ticketsRepository from '@/repositories/tickets-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import hotelsRepository from '@/repositories/hotels-repository';

async function listHotels(userId: number) {
  await checkTicketAndEnroll(userId);

  const listOfHotels = await hotelsRepository.listHotels();
  if (listOfHotels.length === 0) throw notFoundError();
  return listOfHotels;
}

async function checkTicketAndEnroll(userId: number) {
  const infoEnroll = await enrollmentRepository.findById(userId);
  if (!infoEnroll) throw notFoundError();

  const infoTicket = await ticketsRepository.findTicketByEnrollmentId(infoEnroll.id);
  if (!infoTicket) throw notFoundError();

  if (!infoTicket.TicketType.includesHotel || infoTicket.TicketType.isRemote || infoTicket.status !== 'PAID')
    throw paymentErr();

  return;
}

export default { listHotels };
