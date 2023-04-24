import { ApplicationError } from '@/protocols';

export function paymentErr(): ApplicationError {
  return { name: 'PaymentErr', message: 'payment required' };
}
