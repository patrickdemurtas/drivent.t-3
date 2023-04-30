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

export async function assignBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { roomId } = req.body;
  const { userId } = req;

  if (!roomId) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  try {
    const infoIdBooking = await bookingsService.assignBooking(userId, parseInt(roomId));
    return res.status(httpStatus.OK).send({ bookingId: infoIdBooking });
  } catch (error) {
    next(error);
  }
}

export async function changeBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { bookingId } = req.params;
  const { roomId } = req.body;
  const { userId } = req;

  if (!roomId) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  try {
    const bookingUp = await bookingsService.changeBooking(userId, bookingId, parseInt(roomId));
    return res.status(httpStatus.OK).send({ bookingId: bookingUp });
  } catch (error) {
    next(error);
  }
}
