import React from 'react';
import { Calendar, MapPin, Phone } from 'lucide-react';
import type { EventConfig } from '../types';

interface HeaderProps {
  eventConfig: EventConfig | null;
}

export function Header({ eventConfig }: HeaderProps) {
  if (!eventConfig) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <header className="relative bg-white shadow-sm border-b overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: 'url(/image.png)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white/90" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {eventConfig.event_name}
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>{eventConfig.venue_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>
                {formatDate(eventConfig.start_date)} - {formatDate(eventConfig.end_date)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Driver Service Available</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                Drivers will pick you up at the airport, take you to your accommodation, 
                and provide daily transfers between your hotel and the event venue. They will 
                also return you to the airport for departure. If you wish to stay beyond the 
                event days, please let us know in advance so we can arrange extra driver service.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-700">
            Find vetted homes near <span className="font-semibold">{eventConfig.event_name}</span>.
            <br className="sm:hidden" />
            <span className="text-sm text-gray-600">Distances are from the event venue.</span>
          </p>
        </div>
      </div>
    </header>
  );
}