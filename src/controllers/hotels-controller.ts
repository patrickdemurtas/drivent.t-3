import httpStatus from 'http-status';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import hotelsService from '@/services/hotels-service';

async function listHotels(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;

  try {
    const listOfHotels = await hotelsService.listHotels(userId);
    return res.status(httpStatus.OK).send(listOfHotels);
  } catch (e) {
    next(e);
  }
}

export { listHotels };
