export interface ShippingAddress {
  fullName: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
}
