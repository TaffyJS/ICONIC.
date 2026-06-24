export type CourierProvider = "speedy" | "econt";
export type DeliveryMethod = "address" | "office";

export type CourierOffice = {
  id: string;
  provider: CourierProvider;
  label: string;
  city: string;
  address: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
};

export type CourierQuote = {
  provider: CourierProvider;
  deliveryMethod: DeliveryMethod;
  amount: number;
  currency: "EUR";
  estimate: boolean;
  sourceLabel: string;
};
