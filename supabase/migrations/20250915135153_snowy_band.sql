/*
  # Event Housing Booking Schema

  1. New Tables
    - `event_config`
      - `id` (uuid, primary key)
      - `event_name` (text) - Name of the event
      - `venue_name` (text) - Event venue name
      - `start_date` (date) - Event start date
      - `end_date` (date) - Event end date
      - `whatsapp_number` (text) - WhatsApp contact number
      - `driver_cost_per_day` (integer) - Daily driver service cost in Naira
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `properties`
      - `id` (uuid, primary key)
      - `title` (text) - Property title
      - `description` (text) - Property description
      - `price_per_night` (integer) - Price per night in Naira
      - `distance_from_venue` (text) - Distance from venue
      - `amenities` (text array) - List of amenities
      - `total_units` (integer) - Total available units
      - `available_units` (integer) - Currently available units
      - `image_url` (text) - Property image URL
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `bookings`
      - `id` (uuid, primary key)
      - `property_id` (uuid, foreign key)
      - `guest_name` (text) - Guest name
      - `check_in_date` (date) - Check-in date
      - `check_out_date` (date) - Check-out date
      - `units` (integer) - Number of units booked
      - `driver_service` (boolean) - Whether driver service is included
      - `total_price` (integer) - Total booking price
      - `status` (text) - Booking status: temporary, confirmed, cancelled
      - `expires_at` (timestamp) - When temporary booking expires
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated users to manage data

  3. Sample Data
    - Insert sample event configuration
    - Insert sample properties with realistic data
*/

-- Create event_config table
CREATE TABLE IF NOT EXISTS event_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  venue_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  whatsapp_number text NOT NULL,
  driver_cost_per_day integer NOT NULL DEFAULT 10000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_per_night integer NOT NULL,
  distance_from_venue text NOT NULL,
  amenities text[] NOT NULL DEFAULT '{}',
  total_units integer NOT NULL DEFAULT 1,
  available_units integer NOT NULL DEFAULT 1,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  units integer NOT NULL DEFAULT 1,
  driver_service boolean NOT NULL DEFAULT false,
  total_price integer NOT NULL,
  status text NOT NULL DEFAULT 'temporary' CHECK (status IN ('temporary', 'confirmed', 'cancelled')),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE event_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can read event config"
  ON event_config
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read properties"
  ON properties
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read bookings"
  ON bookings
  FOR SELECT
  TO public
  USING (true);

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can manage event config"
  ON event_config
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage properties"
  ON properties
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample event configuration
INSERT INTO event_config (
  event_name,
  venue_name,
  start_date,
  end_date,
  whatsapp_number,
  driver_cost_per_day
) VALUES (
  'Tech Conference Lagos 2025',
  'Eko Convention Centre, Victoria Island',
  '2025-03-15',
  '2025-03-18',
  '2348123456789',
  10000
) ON CONFLICT DO NOTHING;

-- Insert sample properties
INSERT INTO properties (
  title,
  description,
  price_per_night,
  distance_from_venue,
  amenities,
  total_units,
  available_units,
  image_url
) VALUES
(
  '2-Bedroom Apartment, Wuse II',
  'Modern apartment with stunning city views, fully furnished with contemporary amenities. Perfect for professionals attending the conference.',
  25000,
  '2.5km from venue',
  ARRAY['WiFi', 'AC', 'Kitchen', 'Parking'],
  5,
  3,
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Luxury Studio, Victoria Island',
  'Premium studio apartment in the heart of Victoria Island. Walking distance to restaurants and business district.',
  35000,
  '800m from venue',
  ARRAY['WiFi', 'AC', 'Gym Access', 'Concierge'],
  3,
  2,
  'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  '3-Bedroom House, Ikoyi',
  'Spacious family house with private garden and swimming pool. Ideal for groups or families attending the conference.',
  45000,
  '3.2km from venue',
  ARRAY['WiFi', 'AC', 'Pool', 'Garden', 'Parking'],
  2,
  1,
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Executive Suite, Lekki Phase 1',
  'Premium executive suite with ocean views and hotel-grade amenities. Perfect for VIP guests.',
  55000,
  '4.1km from venue',
  ARRAY['WiFi', 'AC', 'Ocean View', 'Room Service'],
  4,
  4,
  'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Cozy 1-Bedroom, Surulere',
  'Comfortable and affordable accommodation with modern amenities. Great value for solo travelers.',
  18000,
  '5.5km from venue',
  ARRAY['WiFi', 'AC', 'Kitchen'],
  6,
  5,
  'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Penthouse Suite, Banana Island',
  'Ultra-luxury penthouse with panoramic city views and premium amenities. The ultimate conference experience.',
  80000,
  '6km from venue',
  ARRAY['WiFi', 'AC', 'City View', 'Private Elevator', 'Butler Service'],
  1,
  1,
  'https://images.pexels.com/photos/1743227/pexels-photo-1743227.jpeg?auto=compress&cs=tinysrgb&w=800'
) ON CONFLICT DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_event_config_updated_at
  BEFORE UPDATE ON event_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();