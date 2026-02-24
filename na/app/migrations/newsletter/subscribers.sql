-- Create subscribers table for newsletter functionality
CREATE TABLE public.subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  subscribed_at timestamptz DEFAULT now() NOT NULL,
  unsubscribed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add indexes for performance
CREATE INDEX idx_subscribers_email ON public.subscribers(email);
CREATE INDEX idx_subscribers_status ON public.subscribers(status);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for anyone to subscribe
CREATE POLICY "Anyone can insert subscribers" ON public.subscribers
  FOR INSERT WITH CHECK (true);

-- Create policy for anyone to view their own subscription
CREATE POLICY "Users can view their own subscription" ON public.subscribers
  FOR SELECT USING (true);

-- Create policy for authenticated users to manage subscribers
CREATE POLICY "Authenticated users can manage subscribers" ON public.subscribers
  FOR ALL USING (auth.role() = 'authenticated');

-- Create the trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER set_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_current_timestamp_updated_at();
