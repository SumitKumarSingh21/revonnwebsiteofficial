
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMechanicAvailability } from './useMechanicAvailability';

interface TimeSlot {
  id: string;
  garage_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const useTimeSlots = (garageId: string, selectedDate: string) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { 
    isTimeSlotAvailable, 
    loading: mechanicLoading 
  } = useMechanicAvailability(garageId, selectedDate);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!garageId || !selectedDate) {
        console.log('Missing garageId or selectedDate:', { garageId, selectedDate });
        setTimeSlots([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching time slots for:', { garageId, selectedDate });
        
        // Get day of week (0 = Sunday, 1 = Monday, etc.)
        const selectedDateObj = new Date(selectedDate + 'T00:00:00');
        const dayOfWeek = selectedDateObj.getDay();
        
        console.log('Day of week calculated:', dayOfWeek);

        const { data, error } = await supabase
          .from('garage_time_slots')
          .select('*')
          .eq('garage_id', garageId)
          .eq('day_of_week', dayOfWeek)
          .eq('is_available', true)
          .order('start_time');

        console.log('Time slots query result:', { data, error });

        if (error) {
          console.error('Error fetching time slots:', error);
          setTimeSlots([]);
        } else {
          console.log('Found time slots:', data?.length || 0);
          setTimeSlots(data || []);
        }
      } catch (error) {
        console.error('Error fetching time slots:', error);
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, [garageId, selectedDate]);

  // Filter time slots based on mechanic availability
  const availableTimeSlots = timeSlots.filter(slot => {
    if (mechanicLoading) return true; // Show all slots while loading
    return isTimeSlotAvailable(slot.start_time);
  });

  const formatTimeSlot = (startTime: string, endTime: string) => {
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  console.log('Final available time slots:', availableTimeSlots.length);

  return {
    timeSlots: availableTimeSlots,
    loading: loading || mechanicLoading,
    formatTimeSlot
  };
};
