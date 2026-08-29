import { CheckoutFixture, PaymentDetails } from '../types/checkout';

import { buildShippingAddress } from './addressFactory';

const DEFAULT_PAYMENT: PaymentDetails = {
  cardHolder: 'Rebecca Winter',
  cardNumber: '4111111111111111',
  expirationDate: '12/28',
  securityCode: '123',
};

export function buildPaymentDetails(overrides: Partial<PaymentDetails> = {}): PaymentDetails {
  return { ...DEFAULT_PAYMENT, ...overrides };
}

export function buildCheckoutFixture(overrides: Partial<CheckoutFixture> = {}): CheckoutFixture {
  return {
    shippingAddress: overrides.shippingAddress ?? buildShippingAddress(),
    payment: overrides.payment ?? buildPaymentDetails(),
  };
}
