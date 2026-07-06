-- Supabase Database Schema Export for CSS Unila 3.0
-- Reconstructed from supabase/types.d.ts
-- Date: 2026-07-01
-- This SQL file will create all necessary Enums, Tables, Relationships, Functions, Triggers, RLS Policies, and Storage settings on a clean Supabase instance.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. ENUMS CREATION
-- =========================================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TYPE public.field_type AS ENUM (
  'text',
  'textarea',
  'number',
  'email',
  'tel',
  'url',
  'select',
  'file'
);

CREATE TYPE public.payment_status AS ENUM (
  'pending',
  'success',
  'failed',
  'expired',
  'refunded'
);

CREATE TYPE public.publish_status AS ENUM (
  'draft',
  'published'
);

CREATE TYPE public.registration_status AS ENUM (
  'draft',
  'pending_payment',
  'pending_verification',
  'verified',
  'rejected'
);

-- =========================================================================
-- 2. TABLES CREATION
-- =========================================================================

-- Table: public.profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  whatsapp text,
  institution text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: public.competitions
CREATE TABLE public.competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  description text,
  accent text,
  icon text,
  fee_idr integer NOT NULL DEFAULT 0,
  quota integer NOT NULL DEFAULT 0,
  team_size text,
  is_open boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  timeline jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: public.competition_fields
CREATE TABLE public.competition_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  key text NOT NULL,
  label text NOT NULL,
  field_type public.field_type NOT NULL DEFAULT 'text',
  placeholder text,
  options jsonb,
  position integer NOT NULL DEFAULT 0,
  required boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: public.registrations
CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES public.competitions(id) ON DELETE RESTRICT NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT NOT NULL,
  team_name text NOT NULL,
  leader_name text NOT NULL,
  leader_whatsapp text NOT NULL,
  leader_email text,
  rejection_reason text,
  status public.registration_status NOT NULL DEFAULT 'draft',
  verified_at timestamp with time zone,
  verified_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: public.registration_answers
CREATE TABLE public.registration_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES public.registrations(id) ON DELETE CASCADE NOT NULL,
  field_id uuid REFERENCES public.competition_fields(id) ON DELETE SET NULL,
  field_key text NOT NULL,
  field_label text,
  value text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: public.payments
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES public.registrations(id) ON DELETE CASCADE UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT NOT NULL,
  amount_idr integer NOT NULL,
  midtrans_order_id text,
  midtrans_payment_type text,
  midtrans_token text,
  midtrans_transaction_status text,
  paid_at timestamp with time zone,
  status public.payment_status NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: public.group_links
CREATE TABLE public.group_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE UNIQUE NOT NULL,
  link_url text NOT NULL,
  qr_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: public.news
CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text,
  excerpt text,
  content text,
  image_url text,
  drive_link text,
  gallery jsonb DEFAULT '[]'::jsonb,
  status public.publish_status NOT NULL DEFAULT 'draft',
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: public.seminars
CREATE TABLE public.seminars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  speaker text,
  speaker_image_url text,
  location text,
  image_url text,
  status public.publish_status NOT NULL DEFAULT 'draft',
  scheduled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: public.sponsors
CREATE TABLE public.sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  website text,
  tier text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: public.media_partners
CREATE TABLE public.media_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  website text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: public.user_roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- Table: public.export_logs
CREATE TABLE public.export_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  export_type text NOT NULL,
  filters jsonb,
  row_count integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: public.notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  is_for_admin boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 3. FUNCTIONS & TRIGGERS CREATION
-- =========================================================================

-- Function: has_role
CREATE OR REPLACE FUNCTION public.has_role(
  _role public.app_role,
  _user_id uuid
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Function: handle_new_user
-- Automatically creates a profile entry and a user role when a user signs up via auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger to auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger Function: notify_on_registration
CREATE OR REPLACE FUNCTION public.notify_on_registration()
RETURNS trigger AS $$
DECLARE
  comp_name text;
BEGIN
  -- Get competition name
  SELECT name INTO comp_name FROM public.competitions WHERE id = NEW.competition_id;

  -- 1. On INSERT (when user first registers)
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.notifications (title, message, is_for_admin)
    VALUES (
      'Pendaftaran Baru',
      'Tim ' || NEW.team_name || ' mendaftar untuk cabang ' || COALESCE(comp_name, 'Lomba') || '.',
      true
    );
  -- 2. On UPDATE (when status changes)
  ELSIF (TG_OP = 'UPDATE') THEN
    -- If status changes to pending_verification (meaning they paid, waiting for admin verification)
    IF NEW.status = 'pending_verification' AND OLD.status <> 'pending_verification' THEN
      INSERT INTO public.notifications (title, message, is_for_admin)
      VALUES (
        'Pembayaran Baru',
        'Tim ' || NEW.team_name || ' telah melakukan pembayaran untuk ' || COALESCE(comp_name, 'Lomba') || ' dan menunggu verifikasi.',
        true
      );
    -- If status changes to verified (verified by admin)
    ELSIF NEW.status = 'verified' AND OLD.status <> 'verified' THEN
      INSERT INTO public.notifications (user_id, title, message, is_for_admin)
      VALUES (
        NEW.user_id,
        'Pendaftaran Terverifikasi',
        'Selamat! Pendaftaran Tim ' || NEW.team_name || ' untuk cabang ' || COALESCE(comp_name, 'Lomba') || ' telah diverifikasi oleh panitia.',
        false
      );
    -- If status changes to rejected (rejected by admin)
    ELSIF NEW.status = 'rejected' AND OLD.status <> 'rejected' THEN
      INSERT INTO public.notifications (user_id, title, message, is_for_admin)
      VALUES (
        NEW.user_id,
        'Pendaftaran Ditolak',
        'Pendaftaran Tim ' || NEW.team_name || ' untuk cabang ' || COALESCE(comp_name, 'Lomba') || ' ditolak. Alasan: ' || COALESCE(NEW.rejection_reason, 'Tidak ditentukan'),
        false
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger to registrations
CREATE OR REPLACE TRIGGER on_registration_change
  AFTER INSERT OR UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_registration();

-- =========================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seminars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_logs ENABLE ROW LEVEL SECURITY;

-- Policies: Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles 
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles 
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles 
  FOR ALL TO authenticated USING (public.has_role('admin', auth.uid()));

-- Policies: Competitions
CREATE POLICY "Allow public read access to competitions" ON public.competitions 
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage competitions" ON public.competitions 
  FOR ALL TO authenticated USING (public.has_role('admin', auth.uid()));

-- Policies: Competition Fields
CREATE POLICY "Allow public read access to competition_fields" ON public.competition_fields 
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage competition_fields" ON public.competition_fields 
  FOR ALL TO authenticated USING (public.has_role('admin', auth.uid()));

-- Policies: Registrations
CREATE POLICY "Users can view their own registrations" ON public.registrations 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their registrations" ON public.registrations 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" ON public.registrations 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all registrations" ON public.registrations 
  FOR ALL TO authenticated USING (public.has_role('admin', auth.uid()));

-- Policies: Registration Answers
CREATE POLICY "Users can view their own answers" ON public.registration_answers 
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.registrations r 
      WHERE r.id = registration_answers.registration_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own answers" ON public.registration_answers 
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.registrations r 
      WHERE r.id = registration_answers.registration_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own answers" ON public.registration_answers 
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.registrations r 
      WHERE r.id = registration_answers.registration_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all answers" ON public.registration_answers 
  FOR ALL TO authenticated USING (public.has_role('admin', auth.uid()));

-- Policies: Payments
CREATE POLICY "Users can view their own payments" ON public.payments 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments" ON public.payments 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" ON public.payments 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payments" ON public.payments 
  FOR ALL TO authenticated USING (public.has_role('admin', auth.uid()));

-- Policies: Group Links
CREATE POLICY "Allow read access to group_links for authenticated users" ON public.group_links 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage group_links" ON public.group_links 
  FOR ALL TO authenticated USING (public.has_role('admin', auth.uid()));

-- Policies: News
CREATE POLICY "Allow public read access to news" ON public.news 
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage news" ON public.news 
  FOR ALL TO authenticated USING (public.has_role('admin', auth.uid()));

-- Policies: Seminars
CREATE POLICY "Allow public read access to seminars" ON public.seminars 
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage seminars" ON public.seminars 
  FOR ALL TO authenticated USING (public.has_role('admin', auth.uid()));

-- Policies: Sponsors
CREATE POLICY "Allow public read access to sponsors" ON public.sponsors 
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage sponsors" ON public.sponsors 
  FOR ALL TO authenticated USING (public.has_role('admin', auth.uid()));

-- Policies: Media Partners
CREATE POLICY "Allow public read access to media_partners" ON public.media_partners 
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage media_partners" ON public.media_partners 
  FOR ALL TO authenticated USING (public.has_role('admin', auth.uid()));

-- Policies: User Roles
CREATE POLICY "Users can view their own roles" ON public.user_roles 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user roles" ON public.user_roles 
  FOR ALL TO authenticated USING (public.has_role('admin', auth.uid()));

-- Policies: Export Logs
CREATE POLICY "Admins can manage export logs" ON public.export_logs 
  FOR ALL TO authenticated USING (public.has_role('admin', auth.uid()));

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies: Notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR (is_for_admin = true AND public.has_role('admin', auth.uid())));

CREATE POLICY "Users can update their own notifications to read" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR (is_for_admin = true AND public.has_role('admin', auth.uid())));

CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL TO authenticated USING (public.has_role('admin', auth.uid()));

-- =========================================================================
-- 5. STORAGE BUCKETS & POLICIES SETUP
-- =========================================================================

-- Ensure storage schema is active (standard on Supabase)
-- Insert the registration-files storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('registration-files', 'registration-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'registration-files' bucket

-- 1. Allow authenticated users to upload files to a path starting with their user_id
CREATE POLICY "Allow users to upload registration files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'registration-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Allow users to read their own uploaded files
CREATE POLICY "Allow users to read their own registration files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'registration-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Allow admins to read all registration files
CREATE POLICY "Allow admins to read all registration files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'registration-files' AND
  public.has_role('admin', auth.uid())
);

-- Enable real-time replication for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Table: public.winners
CREATE TABLE public.winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  registration_id uuid REFERENCES public.registrations(id) ON DELETE SET NULL,
  rank integer NOT NULL,
  title text NOT NULL,
  prize_money text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- Select policy: Allow anyone to view winners
CREATE POLICY "Allow public read access to winners" ON public.winners
  FOR SELECT USING (true);

-- Admin policy: Allow admins all actions
CREATE POLICY "Allow admins all actions on winners" ON public.winners
  TO authenticated
  USING (public.has_role('admin', auth.uid()))
  WITH CHECK (public.has_role('admin', auth.uid()));

-- =========================================================================
-- 6. SITE SETTINGS & TIMELINE TABLES
-- =========================================================================

-- Table: public.site_settings (key-value store for site content)
CREATE TABLE public.site_settings (
  id text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of site_settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage site_settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role('admin', auth.uid()))
  WITH CHECK (public.has_role('admin', auth.uid()));

-- Seed default values for site settings
INSERT INTO public.site_settings (id, value) VALUES
  ('hero_tagline', 'Computer Science Showdown 2026'),
  ('hero_subtitle', 'Event teknologi & esports terbesar yang diadakan oleh himakom. Tersedia beberapa cabang lomba menarik dibidang akademik maupun non-akademik. Segera daftar dan buktikan kemampuanmu!'),
  ('about_title', 'Apa itu Computer Science Showdown 3.0?'),
  ('about_description_1', 'Dalam rangka Dies Natalis Jurusan, kami ingin mengadakan serangkaian acara besar yang bersifat pengembangan keilmuan sebagai refleksi dari Visi dan Misi FMIPA yang menuntut kami untuk selalu menjujung tinggi tentang penelitian. Dies Natalis Jurusan Ilmu Komputer ini juga merupakan momentum untuk memberikan kesempatan kepada para pelajar dan umum di luar sana.'),
  ('about_description_2', 'Maka melalui acara ini kami berupaya untuk mengoptimalkan kehidupan saintis dengan kreatifitas yang kaya akan imajinasi dalam memberikan terobosan - terobosan baru bagi perkembangan ilmu pengetahuan dan teknologi. Acara ini juga sebagai ajang motivasi bagi kami untuk menjadi lebih baik, dengan adanya tekad untuk maju dan terus memberikan manfaat bagi sivitas akademika Jurusan Ilmu Komputer khususnya dan sivitas akademika FMIPA Universitas Lampung.'),
  ('about_highlights', '["Menambah pengalaman di CV","Sertifikat Resmi","Relasi Skill","Hadiah uang tunai"]'),
  ('site_logo', '/css-logo.png'),
  ('site_favicon', '/favicon.ico'),
  ('site_title_main', 'CSS'),
  ('site_title_sub', '3.0')
ON CONFLICT (id) DO NOTHING;

-- Table: public.timeline_items (manageable event timeline)
CREATE TABLE public.timeline_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date text NOT NULL,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.timeline_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of timeline_items" ON public.timeline_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage timeline_items" ON public.timeline_items
  FOR ALL TO authenticated
  USING (public.has_role('admin', auth.uid()))
  WITH CHECK (public.has_role('admin', auth.uid()));

-- Seed default timeline from static data
INSERT INTO public.timeline_items (date, label, description, position) VALUES
  ('25 Oktober 2026', 'Pembukaan', 'Acara pembukaan resmi CSS 3.0 yang menandai dimulainya rangkaian event teknologi dan esports terbesar kampus.', 1),
  ('25 Oktober - 02 November 2026', 'Pelaksanaan Lomba', 'Seluruh cabang lomba berlangsung selama periode ini. Peserta bertanding untuk membuktikan kemampuan terbaik mereka.', 2),
  ('08 November 2026', 'Penutupan', 'Malam puncak dan pengumuman juara dari seluruh cabang lomba CSS 3.0.', 3)
ON CONFLICT DO NOTHING;

-- =========================================================================
-- 7. NEW ROLES & USER COMPETITION ACCESS
-- =========================================================================

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'lomba';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'petugas';

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended boolean DEFAULT false NOT NULL;

CREATE TABLE IF NOT EXISTS public.user_competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_competition UNIQUE (user_id, competition_id)
);

ALTER TABLE public.user_competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of user_competitions" ON public.user_competitions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage user_competitions" ON public.user_competitions
  FOR ALL TO authenticated
  USING (public.has_role('admin', auth.uid()))
  WITH CHECK (public.has_role('admin', auth.uid()));

