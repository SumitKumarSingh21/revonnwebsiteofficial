
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMechanicAvailability } from './useMechanicAvailability';

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
}

export const useTimeSlots = (garageId: string, selectedDate: string) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { isTimeSlotAvailable, loading: mechanicLoading } = useMechanicAvailability(garageId, selectedDate);

  useEffect(() => {
    if (!garageId || !selectedDate) {
      setTimeSlots([]);
      return;
    }

    const fetchTimeSlots = async () => {
      setLoading(true);
      try {
        const selectedDateObj = new Date(selectedDate + 'T00:00:00');
        const dayOfWeek = selectedDateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.

        console.log(`Fetching time slots for garage ${garageId} on day ${dayOfWeek} (${selectedDate})`);

        const { data, error } = await supabase
          .from('garage_time_slots')
          .select('*')
          .eq('garage_id', garageId)
          .eq('day_of_week', dayOfWeek)
          .eq('is_available', true)
          .order('start_time');

        if (error) {
          console.error('Error fetching time slots:', error);
          setTimeSlots([]);
          return;
        }

        console.log('Raw time slots from database:', data?.length || 0);
        setTimeSlots(data || []);
      } catch (error) {
        console.error('Error in fetchTimeSlots:', error);
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
    const available = isTimeSlotAvailable(slot.start_time);
    console.log(`Time slot ${slot.start_time} availability: ${available}`);
    return available;
  });

  const formatTimeSlot = (startTime: string, endTime: string) => {
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  return {
    timeSlots: availableTimeSlots,
    loading: loading || mechanicLoading,
    formatTimeSlot,
  };
};
