
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Mechanic {
  id: string;
  name: string;
  status: string;
}

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  assigned_mechanic_id: string | null;
}

export const useMechanicAvailability = (garageId: string, selectedDate: string) => {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!garageId || !selectedDate) {
      setMechanics([]);
      setExistingBookings([]);
      setLoading(false);
      return;
    }

    const fetchMechanicsAndBookings = async () => {
      try {
        setLoading(true);
        console.log('Fetching mechanics and bookings for:', { garageId, selectedDate });

        // Fetch available mechanics for this garage
        const { data: mechanicsData, error: mechanicsError } = await supabase
          .from('mechanics')
          .select('id, name, status')
          .eq('garage_id', garageId)
          .eq('status', 'active');

        if (mechanicsError) {
          console.error('Error fetching mechanics:', mechanicsError);
          setMechanics([]);
        } else {
          console.log('Found mechanics:', mechanicsData?.length || 0);
          setMechanics(mechanicsData || []);
        }

        // Fetch existing bookings for the selected date
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('id, booking_date, booking_time, assigned_mechanic_id')
          .eq('garage_id', garageId)
          .eq('booking_date', selectedDate)
          .in('status', ['confirmed', 'in_progress']);

        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
          setExistingBookings([]);
        } else {
          console.log('Found existing bookings:', bookingsData?.length || 0);
          setExistingBookings(bookingsData || []);
        }
      } catch (error) {
        console.error('Error fetching mechanic availability:', error);
        setMechanics([]);
        setExistingBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMechanicsAndBookings();
  }, [garageId, selectedDate]);

  const isTimeSlotAvailable = (timeSlot: string) => {
    // If no mechanics are set up yet, allow booking (garage owner can assign later)
    if (mechanics.length === 0) {
      console.log('No mechanics found, allowing booking for time slot:', timeSlot);
      return true;
    }

    // Count how many mechanics are already booked for this time slot
    const bookedMechanics = existingBookings.filter(
      booking => booking.booking_time === timeSlot && booking.assigned_mechanic_id
    ).length;

    // Available if we have more mechanics than bookings
    const available = bookedMechanics < mechanics.length;
    console.log(`Time slot ${timeSlot}: ${bookedMechanics} booked, ${mechanics.length} total mechanics, available: ${available}`);
    
    return available;
  };

  const getAvailableMechanicForSlot = (timeSlot: string) => {
    // If no mechanics are available, return null (will be handled in booking)
    if (mechanics.length === 0) {
      console.log('No mechanics available, booking will need manual assignment');
      return null;
    }

    const bookedMechanicIds = existingBookings
      .filter(booking => booking.booking_time === timeSlot && booking.assigned_mechanic_id)
      .map(booking => booking.assigned_mechanic_id);

    return mechanics.find(mechanic => !bookedMechanicIds.includes(mechanic.id));
  };

  return {
    mechanics,
    existingBookings,
    loading,
    isTimeSlotAvailable,
    getAvailableMechanicForSlot
  };
};
