import { ApplicationError } from '@/protocols';

export function bookingError(): ApplicationError {
  return { name: 'BookingError', message: 'This room is not available!' };
}
