-- Trades table for Mini Trading Journal
-- Run this migration in Supabase SQL Editor or via Supabase CLI

-- Create trades table
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'crypto', 'forex', 'index', 'other')),
  side TEXT NOT NULL CHECK (side IN ('long', 'short')),
  entry_date TIMESTAMPTZ NOT NULL,
  exit_date TIMESTAMPTZ NOT NULL,
  entry_price NUMERIC NOT NULL CHECK (entry_price > 0),
  exit_price NUMERIC NOT NULL CHECK (exit_price > 0),
  position_size NUMERIC NOT NULL CHECK (position_size > 0),
  fees NUMERIC NOT NULL DEFAULT 0 CHECK (fees >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT exit_after_entry CHECK (exit_date >= entry_date)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_trades_user_exit_date ON public.trades (user_id, exit_date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_user_symbol ON public.trades (user_id, symbol);

-- Enable Row Level Security (RLS)
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only access their own trades
CREATE POLICY "Users can read own trades"
  ON public.trades
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON public.trades
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON public.trades
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON public.trades
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
