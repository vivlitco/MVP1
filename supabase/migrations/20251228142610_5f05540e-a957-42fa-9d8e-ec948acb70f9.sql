-- Add open_mode column to jars table
-- 'daily' = one note per day, 'unlimited' = open any number
ALTER TABLE public.jars 
ADD COLUMN open_mode TEXT NOT NULL DEFAULT 'daily' 
CHECK (open_mode IN ('daily', 'unlimited'));