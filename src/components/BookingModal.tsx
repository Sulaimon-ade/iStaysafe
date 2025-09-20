import React, { useState } from 'react';
import { X, Calendar, Users, Car, CheckCircle, MessageCircle, Mail } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import type { Property, EventConfig, BookingFormData } from '../types';

interface BookingModalProps {
  property: Property;
  eventConfig: EventConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingData: BookingFormData, method: 'whatsapp' | 'email') => void;
}

export function BookingModal({ property, eventConfig, isOpen, onClose, onConfirm }: BookingModalProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    guestName: '',
    checkIn: null,
    checkOut: null,
    units: 1,
    driverService: false,
    carType: 'standard'
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const diffTime = Math.abs(formData.checkOut.getTime() - formData.checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const accommodationCost = nights * property.price_per_night * formData.units;
    
    let driverCost = 0;
    if (formData.driverService && eventConfig) {
      const carPricing = {
        standard: eventConfig.driver_cost_per_day, // 50000
        comfort: 70000,
        luxury: 0 // Will be discussed with admin
      };
      driverCost = nights * carPricing[formData.carType];
    }
    
    return accommodationCost + driverCost;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This will be handled by the individual button clicks
  };

  const handleBookingMethod = (method: 'whatsapp' | 'email') => {
    onConfirm(formData, method);
  };

  const isFormValid = () => {
    return formData.guestName.trim() && formData.checkIn && formData.checkOut && formData.units > 0;
  };

  if (!isOpen) return null;

  const nights = calculateNights();
  const total = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Book Your Stay</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">{property.title}</h3>
            <p className="text-sm text-gray-600">{formatPrice(property.price_per_night)} per night</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guest Name
            </label>
            <input
              type="text"
              value={formData.guestName}
              onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Check-in
              </label>
              <DatePicker
                selected={formData.checkIn}
                onChange={(date) => setFormData(prev => ({ ...prev, checkIn: date }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholderText="Select date"
                minDate={new Date()}
                dateFormat="MMM d, yyyy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Check-out
              </label>
              <DatePicker
                selected={formData.checkOut}
                onChange={(date) => setFormData(prev => ({ ...prev, checkOut: date }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholderText="Select date"
                minDate={formData.checkIn || new Date()}
                dateFormat="MMM d, yyyy"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Number of Units
            </label>
            <select
              value={formData.units}
              onChange={(e) => setFormData(prev => ({ ...prev, units: parseInt(e.target.value) }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: Math.min(property.available_units, 5) }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} unit{i > 0 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.driverService}
                onChange={(e) => setFormData(prev => ({ ...prev, driverService: e.target.checked }))}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Car className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Add Driver Service</span>
                </div>
                <p className="text-xs text-blue-800">
                  Airport pickup, daily event transfers, airport drop-off
                </p>
              </div>
            </label>
            
            {formData.driverService && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium text-blue-900">Choose Car Type:</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="carType"
                      value="standard"
                      checked={formData.carType === 'standard'}
                      onChange={(e) => setFormData(prev => ({ ...prev, carType: e.target.value as 'standard' | 'comfort' | 'luxury' }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 flex justify-between">
                      <span className="text-sm text-blue-800">Standard Car</span>
                      <span className="text-sm font-medium text-blue-700">
                        {eventConfig && formatPrice(eventConfig.driver_cost_per_day)}/day
                      </span>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="carType"
                      value="comfort"
                      checked={formData.carType === 'comfort'}
                      onChange={(e) => setFormData(prev => ({ ...prev, carType: e.target.value as 'standard' | 'comfort' | 'luxury' }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 flex justify-between">
                      <span className="text-sm text-blue-800">Comfort Car</span>
                      <span className="text-sm font-medium text-blue-700">
                        {formatPrice(70000)}/day
                      </span>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="carType"
                      value="luxury"
                      checked={formData.carType === 'luxury'}
                      onChange={(e) => setFormData(prev => ({ ...prev, carType: e.target.value as 'standard' | 'comfort' | 'luxury' }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 flex justify-between">
                      <span className="text-sm text-blue-800">Luxury Car</span>
                      <span className="text-sm font-medium text-blue-700">
                        Price on request
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {nights > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Accommodation ({nights} night{nights !== 1 ? 's' : ''} × {formData.units} unit{formData.units !== 1 ? 's' : ''})</span>
                <span>{formatPrice(nights * property.price_per_night * formData.units)}</span>
              </div>
              {formData.driverService && eventConfig && (
                <div className="flex justify-between text-sm">
                  <span>
                    Driver Service - {formData.carType.charAt(0).toUpperCase() + formData.carType.slice(1)} 
                    ({nights} day{nights !== 1 ? 's' : ''})
                  </span>
                  <span>
                    {formData.carType === 'luxury' 
                      ? 'Price on request' 
                      : formatPrice(nights * (formData.carType === 'comfort' ? 70000 : eventConfig.driver_cost_per_day))
                    }
                  </span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>
                  {formData.driverService && formData.carType === 'luxury' 
                    ? `${formatPrice(nights * property.price_per_night * formData.units)} + Luxury car (on request)`
                    : formatPrice(total)
                  }
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center">Choose your preferred booking method:</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleBookingMethod('whatsapp')}
                disabled={!isFormValid()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                Book via WhatsApp
              </button>
              
              <button
                type="button"
                onClick={() => handleBookingMethod('email')}
                disabled={!isFormValid()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="h-5 w-5" />
                Book via Email
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}