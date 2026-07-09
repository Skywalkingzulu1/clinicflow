-- Doctors on Wheels Healthtech Database Schema Boilerplate
-- Created: 2026-07-09

-- 1. Create Profiles Table (Core Users)
CREATE TABLE IF NOT EXISTS public."Profiles" (
    id bigint PRIMARY KEY,
    email text UNIQUE NOT NULL,
    name text,
    role text DEFAULT 'PATIENT',
    credits bigint DEFAULT 0,
    password_hash text,
    is_active boolean DEFAULT true,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp with time zone,
    email_verified boolean DEFAULT false,
    phone_verified boolean DEFAULT false,
    verification_level text DEFAULT 'none',
    phone text,
    hashgraph_account_id text,
    inconvenience_discount_amount numeric DEFAULT 0,
    inconvenience_discount_active boolean DEFAULT false,
    inconvenience_discount_reason text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. Create Doctors Table
CREATE TABLE IF NOT EXISTS public."Doctors" (
    id bigint PRIMARY KEY,
    user_id bigint REFERENCES public."Profiles"(id) ON DELETE CASCADE,
    name text,
    specialty text DEFAULT 'General Practitioner',
    area text,
    bio text,
    rating text DEFAULT '4.5',
    review_count bigint DEFAULT 0,
    consultation_fee numeric DEFAULT 0,
    hpcsa_number text,
    id_number text,
    verification_status text DEFAULT 'pending',
    profile_completed boolean DEFAULT false,
    total_earnings numeric DEFAULT 0,
    pending_earnings numeric DEFAULT 0,
    quick_chat_price numeric DEFAULT 50,
    video_call_price numeric DEFAULT 150,
    full_consultation_price numeric DEFAULT 250,
    prescription_review_price numeric DEFAULT 80,
    report_analysis_price numeric DEFAULT 120,
    peak_pricing_multiplier numeric DEFAULT 1,
    is_online boolean DEFAULT true,
    gig_mode_enabled boolean DEFAULT true,
    hashgraph_account_id text,
    photo_url text,
    practice_number text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 3. Create Appointments Table
CREATE TABLE IF NOT EXISTS public."appointments" (
    id bigint PRIMARY KEY,
    patient_id bigint REFERENCES public."Profiles"(id) ON DELETE CASCADE,
    doctor_id bigint REFERENCES public."Doctors"(id) ON DELETE CASCADE,
    timestamp timestamp with time zone,
    appointment_type text DEFAULT 'VIDEO',
    status text DEFAULT 'SCHEDULED',
    reason text,
    notes text,
    price_credits numeric DEFAULT 0,
    teleconsultation_status text DEFAULT 'pending',
    service_tier text DEFAULT 'VIDEO_CALL',
    base_price numeric DEFAULT 150,
    platform_fee numeric DEFAULT 30,
    doctor_earnings numeric DEFAULT 120,
    tip_amount numeric DEFAULT 0,
    escrow_status text DEFAULT 'NONE',
    started_at timestamp with time zone,
    ended_at timestamp with time zone,
    duration_minutes bigint,
    location text,
    payment_method text DEFAULT 'credits',
    triage_data jsonb,
    triage_tools_results jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 4. Create Transactions Table
CREATE TABLE IF NOT EXISTS public."transactions" (
    id bigint PRIMARY KEY,
    user_id bigint REFERENCES public."Profiles"(id) ON DELETE CASCADE,
    amount numeric DEFAULT 0,
    transaction_type text,
    description text,
    payment_method text,
    payment_status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 5. Create Medical Records Table
CREATE TABLE IF NOT EXISTS public."medical_records" (
    id bigint PRIMARY KEY,
    patient_id bigint REFERENCES public."Profiles"(id) ON DELETE CASCADE,
    doctor_id bigint REFERENCES public."Doctors"(id) ON DELETE CASCADE,
    appointment_id bigint REFERENCES public."appointments"(id) ON DELETE SET NULL,
    summary text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 6. Create Prescriptions Table
CREATE TABLE IF NOT EXISTS public."prescriptions" (
    id bigint PRIMARY KEY,
    appointment_id bigint REFERENCES public."appointments"(id) ON DELETE CASCADE,
    patient_id bigint REFERENCES public."Profiles"(id) ON DELETE CASCADE,
    doctor_id bigint REFERENCES public."Doctors"(id) ON DELETE CASCADE,
    medication text NOT NULL,
    dosage text,
    instructions text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable Row-Level Security (RLS) on all tables (Best Practice)
ALTER TABLE public."Profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Doctors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."appointments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."medical_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."prescriptions" ENABLE ROW LEVEL SECURITY;

-- Note on Database Webhook Trigger:
-- To hook your `db-email-notify` Edge Function to trigger on insertions/updates, you can use the Supabase Dashboard
-- under Database -> Webhooks, or run the following SQL command:
--
-- CREATE TRIGGER on_profile_changes
-- AFTER INSERT OR UPDATE ON public."Profiles"
-- FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request(
--   'https://<your-project-ref>.supabase.co/functions/v1/db-email-notify',
--   'POST',
--   '{"Content-Type":"application/json", "Authorization":"Bearer <your-anon-key>"}',
--   '{}'
-- );
