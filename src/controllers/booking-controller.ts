import httpStatus from 'http-status';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import bookingsService from '@/services/bookings-service';

export async function listBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;

  try {
    const infoBooking = await bookingsService.listBooking(userId);
    return res.status(httpStatus.OK).send(infoBooking);
  } catch (error) {
    next(error);
  }
}
