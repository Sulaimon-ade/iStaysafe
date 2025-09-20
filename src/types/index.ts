export interface Property {
  id: string;
  title: string;
  price_per_night: number;
  distance_from_venue: string;
  amenities: string[];
  total_units: number;
  available_units: number;
  image_url: string;
  image_urls?: string[]; // Optional array for multiple images
  description: string;
}

export interface EventConfig {
  id: string;
  event_name: string;
  venue_name: string;
  start_date: string;
  end_date: string;
  whatsapp_number: string;
  driver_cost_per_day: number;
}

export interface Booking {
  id: string;
  property_id: string;
  guest_name: string;
  check_in_date: string;
  check_out_date: string;
  units: number;
  driver_service: boolean;
  car_type?: 'standard' | 'comfort' | 'luxury';
  total_price: number;
  status: 'temporary' | 'confirmed' | 'cancelled';
  expires_at: string;
  created_at: string;
}

export interface BookingFormData {
  guestName: string;
  checkIn: Date | null;
  checkOut: Date | null;
  units: number;
  driverService: boolean;
  carType: 'standard' | 'comfort' | 'luxury';
}