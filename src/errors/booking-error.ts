import { ApplicationError } from '@/protocols';

export function bookingError(): ApplicationError {
  return { name: 'bookingError', message: 'This room is not available!' };
}
