-- Create support system tables
-- Support tickets table
CREATE TABLE public.support_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  assigned_agent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subject text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'general', -- booking, payment, garage, app_bug, other, general
  priority text NOT NULL DEFAULT 'medium', -- low, medium, high
  status text NOT NULL DEFAULT 'open', -- open, in_progress, resolved, closed
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  notes text, -- internal admin notes
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone
);

-- Support chat messages table
CREATE TABLE public.support_chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type text NOT NULL, -- user, agent, system
  message text NOT NULL,
  attachment_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Call requests table
CREATE TABLE public.call_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  reason text NOT NULL,
  preferred_time timestamp with time zone,
  scheduled_time timestamp with time zone,
  assigned_agent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, scheduled, completed, cancelled
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- CSAT ratings table
CREATE TABLE public.support_csat (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_csat ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
CREATE POLICY "Users can view their own tickets" ON public.support_tickets
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create support tickets" ON public.support_tickets
FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Support staff can view all tickets" ON public.support_tickets
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true 
    AND role IN ('super_admin', 'support_staff', 'state_admin')
  )
);

CREATE POLICY "Support staff can update tickets" ON public.support_tickets
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true 
    AND role IN ('super_admin', 'support_staff', 'state_admin')
  )
);

-- RLS Policies for support_chat_messages
CREATE POLICY "Users can view messages for their tickets" ON public.support_chat_messages
FOR SELECT USING (
  ticket_id IN (
    SELECT id FROM public.support_tickets WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their tickets" ON public.support_chat_messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND sender_type = 'user' AND
  ticket_id IN (
    SELECT id FROM public.support_tickets WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Support staff can view chat messages" ON public.support_chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true 
    AND role IN ('super_admin', 'support_staff', 'state_admin')
  )
);

CREATE POLICY "Support staff can send chat messages" ON public.support_chat_messages
FOR INSERT WITH CHECK (
  sender_type = 'agent' AND
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true 
    AND role IN ('super_admin', 'support_staff', 'state_admin')
  )
);

-- RLS Policies for call_requests
CREATE POLICY "Anyone can create call requests" ON public.call_requests
FOR INSERT WITH CHECK (true);

CREATE POLICY "Support staff can view call requests" ON public.call_requests
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true 
    AND role IN ('super_admin', 'support_staff', 'state_admin')
  )
);

CREATE POLICY "Support staff can manage call requests" ON public.call_requests
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true 
    AND role IN ('super_admin', 'support_staff', 'state_admin')
  )
);

-- RLS Policies for support_csat
CREATE POLICY "Users can create CSAT for their tickets" ON public.support_csat
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  ticket_id IN (
    SELECT id FROM public.support_tickets WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own CSAT" ON public.support_csat
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Support staff can view CSAT" ON public.support_csat
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true 
    AND role IN ('super_admin', 'support_staff', 'state_admin')
  )
);

-- Create indexes for better performance
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_assigned_agent ON public.support_tickets(assigned_agent_id);
CREATE INDEX idx_support_tickets_created_at ON public.support_tickets(created_at DESC);
CREATE INDEX idx_support_chat_messages_ticket_id ON public.support_chat_messages(ticket_id);
CREATE INDEX idx_support_chat_messages_created_at ON public.support_chat_messages(created_at DESC);
CREATE INDEX idx_call_requests_status ON public.call_requests(status);
CREATE INDEX idx_call_requests_created_at ON public.call_requests(created_at DESC);

-- Create triggers for updated_at
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_call_requests_updated_at
BEFORE UPDATE ON public.call_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();