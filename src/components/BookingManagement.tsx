import React, { useState } from 'react';
import { Calendar, User, MapPin, Car, Clock, CheckCircle, XCircle, AlertTriangle, CreditCard, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AccessCardReceipt } from './AccessCardReceipt';
import type { Booking, Property } from '../types';
import type { BookingFormData } from '../types';

interface BookingWithProperty extends Booking {
  properties: Property;
}

interface BookingManagementProps {
  bookings: BookingWithProperty[];
  onBookingUpdate: () => void;
}

export function BookingManagement({ bookings, onBookingUpdate }: BookingManagementProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showAccessCard, setShowAccessCard] = useState<string | null>(null);
  const [accessCardData, setAccessCardData] = useState<{
    booking: BookingWithProperty;
    formData: BookingFormData;
  } | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'temporary': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'temporary': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleConfirmBooking = async (booking: BookingWithProperty) => {
    setLoading(booking.id);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking.id);

      if (error) throw error;
      onBookingUpdate();
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Failed to confirm booking');
    } finally {
      setLoading(null);
    }
  };

  const handleCancelBooking = async (booking: BookingWithProperty) => {
    setLoading(booking.id);
    try {
      // Cancel the booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);

      if (bookingError) throw bookingError;

      // Restore inventory
      const { error: inventoryError } = await supabase
        .from('properties')
        .update({ 
          available_units: booking.properties.available_units + booking.units 
        })
        .eq('id', booking.property_id);

      if (inventoryError) throw inventoryError;

      onBookingUpdate();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateAccessCard = (booking: BookingWithProperty) => {
    // Convert booking data to form data format for the access card
    const formData: BookingFormData = {
      guestName: booking.guest_name,
      checkIn: new Date(booking.check_in_date),
      checkOut: new Date(booking.check_out_date),
      units: booking.units,
      driverService: booking.driver_service,
      carType: (booking.car_type as 'standard' | 'comfort' | 'luxury') || 'standard'
    };

    setAccessCardData({ booking, formData });
    setShowAccessCard(booking.id);
  };

  const handleCloseAccessCard = () => {
    setShowAccessCard(null);
    setAccessCardData(null);
  };

  const isExpired = (booking: Booking) => {
    if (!booking.expires_at) return false;
    return new Date(booking.expires_at) < new Date();
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    // Sort by status priority, then by creation date
    const statusPriority = { temporary: 0, confirmed: 1, cancelled: 2 };
    const aPriority = statusPriority[a.status as keyof typeof statusPriority];
    const bPriority = statusPriority[b.status as keyof typeof statusPriority];
    
    if (aPriority !== bPriority) return aPriority - bPriority;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
        <div className="text-sm text-gray-600">
          {bookings.length} total bookings
        </div>
      </div>

      <div className="grid gap-4">
        {sortedBookings.map((booking) => (
          <div
            key={booking.id}
            className={`bg-white rounded-lg border p-6 ${
              isExpired(booking) && booking.status === 'temporary' 
                ? 'border-red-200 bg-red-50' 
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {getStatusIcon(booking.status)}
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </div>
                {isExpired(booking) && booking.status === 'temporary' && (
                  <span className="text-xs text-red-600 font-medium">EXPIRED</span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Created: {formatDate(booking.created_at)}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{booking.guest_name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{booking.properties.title}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{booking.units} unit{booking.units !== 1 ? 's' : ''}</span>
                  {booking.driver_service && (
                    <div className="flex items-center gap-1">
                      <Car className="h-4 w-4" />
                      <span>
                        {booking.car_type ? 
                          `${booking.car_type.charAt(0).toUpperCase() + booking.car_type.slice(1)} car` : 
                          'Driver included'
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(booking.total_price)}
                  </div>
                  <div className="text-sm text-gray-500">Total amount</div>
                </div>

                {booking.status === 'temporary' && (
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleConfirmBooking(booking)}
                      disabled={loading === booking.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                    >
                      {loading === booking.id ? 'Confirming...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => handleCancelBooking(booking)}
                      disabled={loading === booking.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                    >
                      {loading === booking.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  </div>
                )}

                {booking.status === 'confirmed' && (
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleGenerateAccessCard(booking)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      Generate Access Card
                    </button>
                    <button
                      onClick={() => handleCancelBooking(booking)}
                      disabled={loading === booking.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                    >
                      {loading === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No bookings found
          </div>
        )}
      </div>

      {/* Access Card Modal */}
      {showAccessCard && accessCardData && (
        <AccessCardReceipt
          property={accessCardData.booking.properties}
          eventConfig={{
            id: '1',
            event_name: 'Genra Assembly',
            venue_name: 'Koinonia Event center',
            start_date: '2025-01-01',
            end_date: '2025-01-05',
            whatsapp_number: '+2349022467034',
            driver_cost_per_day: 50000
          }}
          bookingData={accessCardData.formData}
          isOpen={true}
          onClose={handleCloseAccessCard}
        />
      )}
    </div>
  );
}