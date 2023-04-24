import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { listHotels, listRooms } from '@/controllers';

const hotelsRouter = Router();

hotelsRouter.all('*', authenticateToken);
hotelsRouter.get('/', listHotels);
hotelsRouter.get('/:hotelId', listRooms);

export { hotelsRouter };
