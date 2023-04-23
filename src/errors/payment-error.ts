import { ApplicationError } from '@/protocols';

function paymentErr(): ApplicationError {
  return { name: 'paymentRequired', message: 'payment required' };
}

export { paymentErr };
