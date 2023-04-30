import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { listBooking, assignBooking, changeBooking } from '@/controllers/booking-controller';

const bookingRouter = Router();

bookingRouter.all('/*', authenticateToken);
bookingRouter.get('/', listBooking);
bookingRouter.post('/', assignBooking);
bookingRouter.put('/:bookingId', changeBooking);

export { bookingRouter };
