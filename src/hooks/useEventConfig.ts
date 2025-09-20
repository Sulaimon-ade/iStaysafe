import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { EventConfig } from '../types';

export function useEventConfig() {
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('event_config')
          .select('*')
          .single();

        if (error) throw error;
        setEventConfig(data);
      } catch (err) {
        console.error('Error fetching event config:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventConfig();
  }, []);

  return { eventConfig, loading };
}