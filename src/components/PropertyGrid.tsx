import React, { useState } from 'react';
import { PropertyCard } from './PropertyCard';
import { BookingModal } from './BookingModal';
import { LoadingSpinner } from './LoadingSpinner';
import { supabase } from '../lib/supabase';
import type { Property, EventConfig, BookingFormData } from '../types';

interface PropertyGridProps {
  properties: Property[];
  eventConfig: EventConfig | null;
  loading: boolean;
  onPropertyUpdate: () => void;
}

export function PropertyGrid({ properties, eventConfig, loading, onPropertyUpdate }: PropertyGridProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  const handleConfirmBooking = async (bookingData: BookingFormData, method: 'whatsapp' | 'email') => {
    if (!selectedProperty || !eventConfig) return;

    console.log('Starting booking process for:', selectedProperty.title);
    console.log('Current available units:', selectedProperty.available_units);
    console.log('Requested units:', bookingData.units);

    try {
      // Check if there are still enough units available
      if (selectedProperty.available_units < bookingData.units) {
        alert('Sorry, there are not enough units available for your request.');
        return;
      }

      // First, create the booking record and reduce inventory
      const nights = bookingData.checkOut && bookingData.checkIn
        ? Math.ceil((bookingData.checkOut.getTime() - bookingData.checkIn.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const accommodationCost = nights * selectedProperty.price_per_night * bookingData.units;
      
      let driverCost = 0;
      if (bookingData.driverService) {
        const carPricing = {
          standard: eventConfig.driver_cost_per_day, // 50000
          comfort: 70000,
          luxury: 0 // Will be discussed with admin
        };
        driverCost = nights * carPricing[bookingData.carType];
      }
      
      const total = accommodationCost + driverCost;

      console.log('Creating booking with total:', total);

      // Create booking record
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          property_id: selectedProperty.id,
          guest_name: bookingData.guestName,
          check_in_date: bookingData.checkIn?.toISOString().split('T')[0],
          check_out_date: bookingData.checkOut?.toISOString().split('T')[0],
          units: bookingData.units,
          driver_service: bookingData.driverService,
          car_type: bookingData.driverService ? bookingData.carType : null,
          total_price: total,
          status: 'temporary',
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
        });

      if (bookingError) throw bookingError;

      console.log('Booking created successfully');

      // Reduce available units
      const newAvailableUnits = selectedProperty.available_units - bookingData.units;
      console.log('Updating available units from', selectedProperty.available_units, 'to', newAvailableUnits);

      const { error: updateError } = await supabase
        .from('properties')
        .update({ 
          available_units: newAvailableUnits
        })
        .eq('id', selectedProperty.id);

      if (updateError) throw updateError;

      console.log('Property inventory updated successfully');

      // Refresh the properties list to show updated availability
      onPropertyUpdate();

      console.log('Properties list refreshed');

      // Create WhatsApp message
      const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      const message = `Hello, my name is ${bookingData.guestName}.

I want to book: ${selectedProperty.title}
For the program: ${eventConfig.event_name}
Venue: ${eventConfig.venue_name}
Check-in: ${bookingData.checkIn ? formatDate(bookingData.checkIn) : 'Not selected'}
Check-out: ${bookingData.checkOut ? formatDate(bookingData.checkOut) : 'Not selected'}
Units: ${bookingData.units}
Driver: ${bookingData.driverService ? `Yes - ${bookingData.carType.charAt(0).toUpperCase() + bookingData.carType.slice(1)} Car (Airport pickup, daily event transfers, airport drop-off)` : 'No'}
Total: ${bookingData.driverService && bookingData.carType === 'luxury' 
  ? `₦${(nights * selectedProperty.price_per_night * bookingData.units).toLocaleString()} + Luxury car service (price to be discussed)`
  : `₦${total.toLocaleString()}`
}

Is this still available?`;

      if (method === 'whatsapp') {
        // Open WhatsApp
        const whatsappUrl = `https://wa.me/${eventConfig.whatsapp_number}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      } else {
        // Open email client
        const subject = `Booking Request - ${selectedProperty.title} for ${eventConfig.event_name}`;
        const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        window.open(emailUrl, '_blank');
      }

      handleCloseModal();

      // Show success message
      alert('Booking request sent successfully! Your booking is pending payment verification. You will receive your access card once payment is confirmed by our admin team.');
      
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('There was an error processing your booking. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No properties available at the moment.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onBook={handleBookProperty}
          />
        ))}
      </div>

      {selectedProperty && (
        <BookingModal
          property={selectedProperty}
          eventConfig={eventConfig}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmBooking}
        />
      )}
    </>
  );
}