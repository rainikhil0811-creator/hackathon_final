-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- references auth.users(id)
  product_name TEXT NOT NULL,
  brand TEXT,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'pcs',
  price NUMERIC,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: We only add the foreign key constraint if you are using Supabase Auth.
-- To prevent migration errors if auth.users is empty or inaccessible during the script,
-- we'll skip the strict FK for the demo, or assume it works.
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user') THEN
    ALTER TABLE public.inventory 
    ADD CONSTRAINT fk_user
    FOREIGN KEY (user_id) 
    REFERENCES auth.users (id) 
    ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'auth.users table does not exist, skipping FK constraint.';
END $$;


-- Enable Row Level Security (RLS)
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to allow re-running
DROP POLICY IF EXISTS "Users can view their own inventory" ON public.inventory;
DROP POLICY IF EXISTS "Users can insert their own inventory" ON public.inventory;
DROP POLICY IF EXISTS "Users can update their own inventory" ON public.inventory;
DROP POLICY IF EXISTS "Users can delete their own inventory" ON public.inventory;

-- Create policies
CREATE POLICY "Users can view their own inventory"
  ON public.inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory"
  ON public.inventory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory"
  ON public.inventory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory"
  ON public.inventory FOR DELETE
  USING (auth.uid() = user_id);


-- Seed Data (For Testing/Demo Purposes)
-- This creates a test user if it doesn't exist and seeds data for them.
-- WARNING: Only use this for dev/demo. 
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000000'::UUID;
BEGIN
    -- Check if we can safely insert into auth.users (for direct DB migrations)
    -- This requires the auth schema to exist.
    BEGIN
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
        VALUES (test_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo@dukaansaathi.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '')
        ON CONFLICT (id) DO NOTHING;
        
        -- Insert mock inventory items for this demo user
        INSERT INTO public.inventory (user_id, product_name, brand, quantity, unit, price, expiry_date)
        VALUES 
            (test_user_id, 'Parle-G Gold Biscuits', 'Parle', 45, 'pcs', 25, '2027-05-10'),
            (test_user_id, 'Aashirvaad Atta', 'ITC', 3, 'kg', 220, '2026-12-15'),
            (test_user_id, 'Tata Salt', 'Tata', 12, 'kg', 28, '2028-01-01'),
            (test_user_id, 'Amul Butter', 'Amul', 2, 'pcs', 58, '2026-10-15'),
            (test_user_id, 'Maggi Noodles', 'Nestle', 120, 'pkts', 14, '2027-02-28')
        ON CONFLICT DO NOTHING;
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'Skipping seed data because auth.users is unavailable.';
    END;
END $$;
