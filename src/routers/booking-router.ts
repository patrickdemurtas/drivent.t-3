import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { listBooking, assignBooking } from '@/controllers/booking-controller';

const bookingRouter = Router();

bookingRouter.all('/*', authenticateToken);
bookingRouter.get('/', listBooking);
bookingRouter.post('/', assignBooking);

export { bookingRouter };
