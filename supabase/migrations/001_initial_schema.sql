-- ==============================================================================
-- RosterFlow - Supabase PostgreSQL Schema Migration (001_initial_schema.sql)
-- Multi-Tenant Staff Roster & Workforce Management
-- 100% compatible with the internal PGlite PostgreSQL database
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Businesses Table (Workplace Rooms / Tenants)
CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  business_type TEXT NOT NULL DEFAULT 'Café',
  timezone TEXT NOT NULL DEFAULT 'Europe/Dublin',
  address TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT '€',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Staff Profiles Table
CREATE TABLE IF NOT EXISTS staff_profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
  job_title TEXT NOT NULL DEFAULT 'Staff',
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 15.00,
  max_hours_per_week NUMERIC(5,2) NOT NULL DEFAULT 35.00,
  avatar TEXT,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  availability JSONB NOT NULL DEFAULT '{"mon":true,"tue":true,"wed":true,"thu":true,"fri":true,"sat":true,"sun":false}'::jsonb,
  preferred_shift TEXT NOT NULL DEFAULT 'any',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_approval', 'inactive')),
  joined_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Rosters Table
CREATE TABLE IF NOT EXISTS rosters (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  ai_generated BOOLEAN DEFAULT false,
  ai_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Shifts Table
CREATE TABLE IF NOT EXISTS shifts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  roster_id TEXT NOT NULL REFERENCES rosters(id) ON DELETE CASCADE,
  day TEXT NOT NULL CHECK (day IN ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun')),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  title TEXT NOT NULL,
  required_count INTEGER NOT NULL DEFAULT 1,
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 15.00,
  assigned_staff_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  ai_explanation JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Shift Templates Table
CREATE TABLE IF NOT EXISTS shift_templates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  shifts JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Attendance & Timecard Table
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  staff_id TEXT NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
  shift_id TEXT REFERENCES shifts(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  shift_title TEXT NOT NULL,
  scheduled_start TIME NOT NULL,
  scheduled_end TIME NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  break_minutes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'checked_in', 'on_break', 'completed', 'late', 'absent')),
  calculated_hours NUMERIC(6,2) DEFAULT 0,
  calculated_wage NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Daily Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_staff_id TEXT REFERENCES staff_profiles(id) ON DELETE SET NULL,
  shift_type TEXT NOT NULL DEFAULT 'general' CHECK (shift_type IN ('opening', 'mid', 'closing', 'general')),
  due_date DATE NOT NULL,
  due_time TIME NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  recurring TEXT DEFAULT 'none' CHECK (recurring IN ('daily', 'weekly', 'none')),
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Shift Swap Requests Table
CREATE TABLE IF NOT EXISTS shift_swap_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  shift_id TEXT NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  shift_title TEXT NOT NULL,
  shift_date TEXT NOT NULL,
  shift_time TEXT NOT NULL,
  requester_staff_id TEXT NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
  target_staff_id TEXT REFERENCES staff_profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_staff' CHECK (status IN ('pending_staff', 'pending_owner', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  read BOOLEAN DEFAULT false,
  link TEXT,
  email_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security (RLS) Policies for Multi-Tenancy
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
