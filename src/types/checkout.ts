import { ShippingAddress } from './address';

export interface PaymentDetails {
  cardHolder: string;
  cardNumber: string;
  expirationDate: string;
  securityCode: string;
}

export interface CheckoutFixture {
  shippingAddress: ShippingAddress;
  payment: PaymentDetails;
}

export interface OrderOverview {
  itemCount: number;
  deliveryFee: number;
  subtotal: number;
  total: number;
}
