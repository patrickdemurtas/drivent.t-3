import { ApplicationError } from '@/protocols';

export function paymentRequiredtError(): ApplicationError {
  return { name: 'PaymentRequiredError', message: 'payment required' };
}
