export type CourierProvider = "speedy" | "econt";
export type DeliveryMethod = "address" | "office";
export type DataSource = "live" | "fallback";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

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

export type CourierDataStore = {
  fallbackCitiesByProvider: Record<CourierProvider, string[]>;
  cityCoordinates: Record<string, Coordinates>;
};

export type CourierCredentials = {
  apiUrl: string;
  userName: string;
  password: string;
};

export type CourierConfig = {
  speedy?: CourierCredentials;
  econt?: CourierCredentials;
  econtDemoEnabled: boolean;
};

export type CourierCitiesResult = {
  cities: string[];
  source: DataSource;
};

export type CourierOfficesResult = {
  offices: CourierOffice[];
  source: DataSource;
};

export type CourierQuoteInput = {
  provider: CourierProvider;
  deliveryMethod: DeliveryMethod;
  itemCount: number;
  subtotal: number;
};
