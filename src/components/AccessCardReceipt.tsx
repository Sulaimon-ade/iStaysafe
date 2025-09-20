import React from 'react';
import { Calendar, MapPin, Users, Car, Phone, Mail, Download, X } from 'lucide-react';
import type { Property, EventConfig, BookingFormData } from '../types';

interface AccessCardReceiptProps {
  property: Property;
  eventConfig: EventConfig | null;
  bookingData: BookingFormData;
  isOpen: boolean;
  onClose: () => void;
}

export function AccessCardReceipt({ 
  property, 
  eventConfig, 
  bookingData, 
  isOpen, 
  onClose 
}: AccessCardReceiptProps) {
  if (!isOpen || !eventConfig) return null;

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not selected';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const diffTime = Math.abs(bookingData.checkOut.getTime() - bookingData.checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const accommodationCost = nights * property.price_per_night * bookingData.units;
    
    let driverCost = 0;
    if (bookingData.driverService && eventConfig) {
      const carPricing = {
        standard: eventConfig.driver_cost_per_day,
        comfort: 70000,
        luxury: 0
      };
      driverCost = nights * carPricing[bookingData.carType];
    }
    
    return accommodationCost + driverCost;
  };

  const nights = calculateNights();
  const total = calculateTotal();
  const bookingId = `ISS-${Date.now().toString().slice(-6)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a new window with just the receipt content
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>iStaySafe Access Card - ${bookingData.guestName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #2e1616ff; }
              .receipt { max-width: 400px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #9b7504ff 0%, #695814ff 100%); color: white; padding: 24px; text-align: center; }
              .logo { width: 60px; height: 60px; margin: 0 auto 16px; }
              .content { padding: 24px; }
              .section { margin-bottom: 20px; }
              .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
              .value { font-size: 16px; color: #1f2937; font-weight: 600; }
              .divider { height: 1px; background: #e5e7eb; margin: 20px 0; }
              .total { background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; }
              .footer { background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <img src="/iStaySafe_logo_transparent.png" alt="iStaySafe" class="logo" />
                <h2 style="margin: 0; font-size: 24px;">iStaySafe</h2>
                <p style="margin: 8px 0 0; opacity: 0.9;">Your Digital Access Card</p>
              </div>
              <div class="content">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h3 style="margin: 0; color: #1e40af;">Welcome, ${bookingData.guestName}!</h3>
                  <p style="margin: 8px 0 0; color: #6b7280;">Your accommodation is confirmed</p>
                </div>
                
                <div class="section">
                  <div class="label">Booking Reference</div>
                  <div class="value">${bookingId}</div>
                </div>
                
                <div class="section">
                  <div class="label">Property</div>
                  <div class="value">${property.title}</div>
                </div>
                
                <div class="section">
                  <div class="label">Event</div>
                  <div class="value">${eventConfig.event_name}</div>
                </div>
                
                <div class="section">
                  <div class="label">Check-in</div>
                  <div class="value">${formatDate(bookingData.checkIn)}</div>
                </div>
                
                <div class="section">
                  <div class="label">Check-out</div>
                  <div class="value">${formatDate(bookingData.checkOut)}</div>
                </div>
                
                <div class="divider"></div>
                
                <div class="total">
                  <div class="label">Total Amount</div>
                  <div style="font-size: 24px; font-weight: bold; color: #1e40af;">${formatPrice(total)}</div>
                </div>
              </div>
              <div class="footer">
                <p>Present this card at check-in • Safe travels with iStaySafe</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Your Access Card</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Access Card Design */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-500/20 to-transparent p-6 text-white text-center">
              <img 
                src="/iStaySafe_logo_transparent.png" 
                alt="iStaySafe" 
                className="w-16 h-16 mx-auto mb-4 drop-shadow-lg"
              />
              <h3 className="text-2xl font-bold mb-2">iStaySafe</h3>
              <p className="text-blue-100 text-sm">Your Digital Access Card</p>
            </div>

            {/* Welcome Message */}
            <div className="px-6 py-4 bg-white/10 backdrop-blur-sm">
              <div className="text-center text-white">
                <h4 className="text-xl font-semibold mb-2">
                  Welcome, {bookingData.guestName}!
                </h4>
                <p className="text-blue-100 text-sm">
                  Your accommodation is confirmed and ready for your arrival
                </p>
              </div>
            </div>

            {/* Card Details */}
            <div className="p-6 space-y-4 text-white">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-blue-200 text-xs uppercase tracking-wide mb-1">
                    Booking Reference
                  </p>
                  <p className="font-mono font-bold text-lg">{bookingId}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs uppercase tracking-wide mb-1">
                    Units
                  </p>
                  <p className="font-bold text-lg">{bookingData.units}</p>
                </div>
              </div>

              <div className="border-t border-blue-400/30 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-blue-200" />
                  <p className="text-blue-200 text-xs uppercase tracking-wide">
                    Property
                  </p>
                </div>
                <p className="font-semibold">{property.title}</p>
                <p className="text-blue-100 text-sm">{property.distance_from_venue}</p>
              </div>

              <div className="border-t border-blue-400/30 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-200" />
                  <p className="text-blue-200 text-xs uppercase tracking-wide">
                    Event Details
                  </p>
                </div>
                <p className="font-semibold">{eventConfig.event_name}</p>
                <p className="text-blue-100 text-sm">{eventConfig.venue_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-blue-400/30 pt-4">
                <div>
                  <p className="text-blue-200 text-xs uppercase tracking-wide mb-1">
                    Check-in
                  </p>
                  <p className="font-semibold text-sm">
                    {bookingData.checkIn?.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs uppercase tracking-wide mb-1">
                    Check-out
                  </p>
                  <p className="font-semibold text-sm">
                    {bookingData.checkOut?.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {bookingData.driverService && (
                <div className="border-t border-blue-400/30 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="h-4 w-4 text-blue-200" />
                    <p className="text-blue-200 text-xs uppercase tracking-wide">
                      Driver Service
                    </p>
                  </div>
                  <p className="font-semibold capitalize">
                    {bookingData.carType} Car Service
                  </p>
                  <p className="text-blue-100 text-sm">
                    Airport transfers & daily event transport included
                  </p>
                </div>
              )}

              {/* Total Amount */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border-t border-blue-400/30 mt-4">
                <div className="text-center">
                  <p className="text-blue-200 text-xs uppercase tracking-wide mb-1">
                    Total Amount
                  </p>
                  <p className="text-3xl font-bold">
                    {bookingData.driverService && bookingData.carType === 'luxury' 
                      ? `${formatPrice(nights * property.price_per_night * bookingData.units)}*`
                      : formatPrice(total)
                    }
                  </p>
                  {bookingData.driverService && bookingData.carType === 'luxury' && (
                    <p className="text-blue-100 text-xs mt-1">
                      *Plus luxury car service (price on request)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="bg-blue-900/50 px-6 py-4 text-center">
              <p className="text-blue-100 text-xs">
                Present this card at check-in • Safe travels with iStaySafe
              </p>
              <div className="flex items-center justify-center gap-4 mt-3 text-blue-200">
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span className="text-xs">{eventConfig.whatsapp_number}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="text-xs">support@istaysafe.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleDownload}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="h-5 w-5" />
              Download Card
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">How to use your Access Card:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Save or screenshot this card to your phone</li>
              <li>• Present it at the property during check-in</li>
              <li>• Keep your booking reference handy: <strong>{bookingId}</strong></li>
              <li>• Contact us via WhatsApp for any assistance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}