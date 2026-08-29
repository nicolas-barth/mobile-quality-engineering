import { ShippingAddress } from '../types/address';

const DEFAULT_ADDRESS: ShippingAddress = {
  fullName: 'Rebecca Winter',
  address1: 'Mandorley 112',
  address2: 'Entrance 1',
  city: 'Truro',
  state: 'Cornwall',
  zip: '89750',
  country: 'United Kingdom',
};

export function buildShippingAddress(overrides: Partial<ShippingAddress> = {}): ShippingAddress {
  return { ...DEFAULT_ADDRESS, ...overrides };
}
