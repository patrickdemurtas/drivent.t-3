import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { listHotels } from '@/controllers';

const hotelsRouter = Router();

hotelsRouter.all('*', authenticateToken);
hotelsRouter.get('/', listHotels);

export { hotelsRouter };
