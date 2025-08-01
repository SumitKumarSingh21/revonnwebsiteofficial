import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface WelcomeNameFormProps {
  userId: string;
  onComplete: () => void;
}

const WelcomeNameForm = ({ userId, onComplete }: WelcomeNameFormProps) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      // Update the user's profile with their name
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: name.trim() })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Welcome to Revonn!",
        description: "Your profile has been updated successfully."
      });

      onComplete();
      navigate('/');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome to Revonn! 🎉</CardTitle>
            <p className="text-muted-foreground">Just one last step — tell us your name.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="mt-1"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !name.trim()}
                size="lg"
              >
                {isLoading ? "Saving..." : "Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WelcomeNameForm;