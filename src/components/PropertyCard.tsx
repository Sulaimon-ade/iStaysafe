import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { MapPin, Wifi, Snowflake, Car, Users, Calendar } from 'lucide-react';
import type { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onBook: (property: Property) => void;
}

const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="h-4 w-4" />,
  'AC': <Snowflake className="h-4 w-4" />,
  'Parking': <Car className="h-4 w-4" />,
  'Kitchen': <Users className="h-4 w-4" />,
};

export function PropertyCard({ property, onBook }: PropertyCardProps) {
  const [emblaRef] = useEmblaCarousel({ loop: true });
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const availabilityColor = property.available_units > 2 
    ? 'text-emerald-600' 
    : property.available_units > 0 
    ? 'text-orange-600' 
    : 'text-red-600';

  const isAvailable = property.available_units > 0;

    // Use DB images if available, fallback to single image
  const images = property.image_urls && property.image_urls.length > 0 
    ? property.image_urls 
    : [property.image_url];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative">
        <div className="embla overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex">
            {images.map((image, index) => (
              <div key={index} className="embla__slide flex-none w-full">
                <img 
                  src={image} 
                  alt={`${property.title} - Image ${index + 1}`}
                  className="w-full h-48 sm:h-56 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Carousel indicators */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
          {images.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-white/60 backdrop-blur-sm"
            />
          ))}
        </div>
        
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm ${availabilityColor}`}>
            {property.available_units} of {property.total_units} left
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
            {property.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{property.distance_from_venue}</span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {property.amenities.map((amenity, index) => (
            <div 
              key={index} 
              className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700"
            >
              {amenityIcons[amenity] || <Calendar className="h-4 w-4" />}
              <span>{amenity}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(property.price_per_night)}
            </span>
            <span className="text-gray-600 text-sm">/night</span>
          </div>
          
          <button
            onClick={() => onBook(property)}
            disabled={!isAvailable}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              isAvailable
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isAvailable ? 'Book Now' : 'Sold Out'}
          </button>
        </div>
      </div>
    </div>
  );
}