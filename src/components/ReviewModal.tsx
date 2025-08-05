
import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ReviewModalProps {
  booking: {
    id: string;
    garage_id: string;
    service_id: string;
    booking_date: string;
    booking_time: string;
    status: string;
    total_amount: number;
    customer_name: string;
    vehicle_make: string;
    vehicle_model: string;
    notes: string;
  };
  existingReview?: {
    id: string;
    rating: number;
    comment: string;
  };
  onReviewSubmitted: () => void;
}

const ReviewModal = ({ booking, existingReview, onReviewSubmitted }: ReviewModalProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);

  // Show review option only for completed bookings
  if (booking.status !== 'completed') {
    return null;
  }

  const handleSubmit = async () => {
    if (!user || rating === 0) {
      toast({
        title: "Error",
        description: "Please provide a rating",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating,
            comment,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingReview.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Review updated successfully",
        });
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert({
            booking_id: booking.id,
            garage_id: booking.garage_id,
            user_id: user.id,
            rating,
            comment
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Review submitted successfully",
        });
      }

      setOpen(false);
      onReviewSubmitted();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={existingReview ? "outline" : "default"} 
          size="sm"
          className={existingReview ? "" : "bg-red-600 hover:bg-red-700"}
        >
          <Star className="h-4 w-4 mr-2" />
          {existingReview ? 'Edit Review' : 'Write Review'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existingReview ? 'Edit Review' : 'Write a Review'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Service for {booking.vehicle_make} {booking.vehicle_model}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}
            </p>
          </div>

          <div>
            <Label htmlFor="rating">Rating</Label>
            <div className="flex space-x-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
