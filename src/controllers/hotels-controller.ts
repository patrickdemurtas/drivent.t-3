import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelsService from '@/services/hotels-service';

export async function listHotels(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;

  try {
    const hotels = await hotelsService.listHotels(userId);

    return res.status(httpStatus.OK).send(hotels);
  } catch (err) {
    next(err);
  }
}

export async function listRooms(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { hotelId } = req.params;
  const { userId } = req;

  if (!hotelId) return res.status(httpStatus.BAD_REQUEST).send('search not found');

  try {
    const rooms = await hotelsService.listRooms(hotelId, userId);
    return res.status(httpStatus.OK).send(rooms);
  } catch (err) {
    next(err);
  }
}
