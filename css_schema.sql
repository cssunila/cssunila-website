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
  suspended boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: public.competitions
CREATE TABLE public.competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  description jsonb NOT NULL DEFAULT '[]'::jsonb,
  accent text,
  icon text,
  fee_idr integer NOT NULL DEFAULT 0,
  quota integer NOT NULL DEFAULT 0,
  team_size text,
  is_open boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  timeline jsonb NOT NULL DEFAULT '[]'::jsonb,
  pj_1 text,
  no_pj_1 text,
  pj_2 text,
  no_pj_2 text,
  banner text,
  juara_1 text,
  juara_2 text,
  juara_3 text,
  panduan text,
  slot integer NOT NULL DEFAULT 0,
  is_multi_slot boolean NOT NULL DEFAULT false,
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
  slot integer NOT NULL DEFAULT 1,
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
  action text,
  entity_type text,
  entity_id uuid,
  status text DEFAULT 'info' CHECK (status IN ('success','error','warning','info')),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: public.notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id uuid REFERENCES public.competitions(id) ON DELETE SET NULL,
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
    INSERT INTO public.notifications (title, message, is_for_admin, competition_id)
    VALUES (
      'Pendaftaran Baru',
      'Tim ' || NEW.team_name || ' mendaftar untuk cabang ' || COALESCE(comp_name, 'Lomba') || '.',
      true,
      NEW.competition_id
    );
  -- 2. On UPDATE (when status changes)
  ELSIF (TG_OP = 'UPDATE') THEN
    -- If status changes to pending_verification (meaning they paid, waiting for admin verification)
    IF NEW.status = 'pending_verification' AND OLD.status <> 'pending_verification' THEN
      INSERT INTO public.notifications (title, message, is_for_admin, competition_id)
      VALUES (
        'Pembayaran Baru',
        'Tim ' || NEW.team_name || ' telah melakukan pembayaran untuk ' || COALESCE(comp_name, 'Lomba') || ' dan menunggu verifikasi.',
        true,
        NEW.competition_id
      );
    -- If status changes to verified (verified by admin)
    ELSIF NEW.status = 'verified' AND OLD.status <> 'verified' THEN
      INSERT INTO public.notifications (user_id, title, message, is_for_admin, competition_id)
      VALUES (
        NEW.user_id,
        'Pendaftaran Terverifikasi',
        'Selamat! Pendaftaran Tim ' || NEW.team_name || ' untuk cabang ' || COALESCE(comp_name, 'Lomba') || ' telah diverifikasi oleh panitia.',
        false,
        NEW.competition_id
      );
    -- If status changes to rejected (rejected by admin)
    ELSIF NEW.status = 'rejected' AND OLD.status <> 'rejected' THEN
      INSERT INTO public.notifications (user_id, title, message, is_for_admin, competition_id)
      VALUES (
        NEW.user_id,
        'Pendaftaran Ditolak',
        'Pendaftaran Tim ' || NEW.team_name || ' untuk cabang ' || COALESCE(comp_name, 'Lomba') || ' ditolak. Alasan: ' || COALESCE(NEW.rejection_reason, 'Tidak ditentukan'),
        false,
        NEW.competition_id
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
CREATE POLICY "Admins can read activity logs" ON public.export_logs 
  FOR SELECT TO authenticated USING (public.has_role('admin', auth.uid()));

CREATE POLICY "Service role can insert logs" ON public.export_logs
  FOR INSERT TO authenticated, service_role WITH CHECK (true);

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
  status public.publish_status DEFAULT 'draft'::public.publish_status,
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
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone,
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
INSERT INTO public.timeline_items (start_date, end_date, label, description, position) VALUES
  ('2026-10-25T08:00:00+07:00'::timestamp with time zone, NULL, 'Pembukaan', 'Acara pembukaan resmi CSS 3.0 yang menandai dimulainya rangkaian event teknologi dan esports terbesar kampus.', 1),
  ('2026-10-25T08:00:00+07:00'::timestamp with time zone, '2026-11-02T17:00:00+07:00'::timestamp with time zone, 'Pelaksanaan Lomba', 'Seluruh cabang lomba berlangsung selama periode ini. Peserta bertanding untuk membuktikan kemampuan terbaik mereka.', 2),
  ('2026-11-08T19:00:00+07:00'::timestamp with time zone, NULL, 'Penutupan', 'Malam puncak dan pengumuman juara dari seluruh cabang lomba CSS 3.0.', 3)
ON CONFLICT DO NOTHING;

-- =========================================================================
-- 7. NEW ROLES & USER COMPETITION ACCESS
-- =========================================================================

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'lomba';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'petugas';



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

-- =========================================================================
-- 8. PAGE VISIBILITY CONFIGURATION (HIDE/SHOW PAGES)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.page_visibility (
  id text PRIMARY KEY,
  is_visible boolean DEFAULT true NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.page_visibility (id, is_visible) VALUES
  ('lomba', true),
  ('berita', true),
  ('seminar', true),
  ('juara', true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.page_visibility ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of page_visibility" ON public.page_visibility
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage page_visibility" ON public.page_visibility
  FOR ALL TO authenticated
  USING (public.has_role('admin', auth.uid()))
  WITH CHECK (public.has_role('admin', auth.uid()));

-- =========================================================================
-- 9. WEB PUSH NOTIFICATIONS SUBSCRIPTIONS
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage their own push_subscriptions" ON public.push_subscriptions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view push_subscriptions" ON public.push_subscriptions
  FOR SELECT TO authenticated
  USING (public.has_role('admin', auth.uid()));


-- =========================================================================
-- 10. ACTIVITY LOG FUNCTIONS & TRIGGERS
-- =========================================================================

-- FUNGSI HELPER: catat activity log
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action text,
  p_entity_type text,
  p_entity_id uuid DEFAULT NULL,
  p_status text DEFAULT 'info',
  p_actor_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.export_logs (
    export_type,
    action,
    entity_type,
    entity_id,
    status,
    actor_id,
    metadata,
    created_at
  ) VALUES (
    p_entity_type,
    p_action,
    p_entity_type,
    p_entity_id,
    p_status,
    p_actor_id,
    p_metadata,
    now()
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to log activity: %', SQLERRM;
END;
$$;

-- TRIGGER: Pendaftaran (registrations)
CREATE OR REPLACE FUNCTION public.trg_log_registrations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_action text;
  v_status text;
  v_meta jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'Pendaftaran baru dibuat';
    v_status := 'success';
    v_meta := jsonb_build_object(
      'team_name', NEW.team_name,
      'status', NEW.status,
      'competition_id', NEW.competition_id
    );
    PERFORM public.log_activity(v_action, 'registration', NEW.id::uuid, v_status, NEW.user_id, v_meta);

  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      v_action := format('Status pendaftaran diubah: %s → %s', OLD.status, NEW.status);
      v_status := CASE NEW.status
        WHEN 'verified' THEN 'success'
        WHEN 'rejected' THEN 'error'
        WHEN 'pending_verification' THEN 'info'
        WHEN 'pending_payment' THEN 'warning'
        ELSE 'info'
      END;
      v_meta := jsonb_build_object(
        'team_name', NEW.team_name,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'competition_id', NEW.competition_id,
        'rejection_reason', NEW.rejection_reason
      );
      PERFORM public.log_activity(v_action, 'registration', NEW.id::uuid, v_status, NEW.user_id, v_meta);
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    v_meta := jsonb_build_object(
      'team_name', OLD.team_name,
      'status', OLD.status
    );
    PERFORM public.log_activity('Pendaftaran dihapus', 'registration', OLD.id::uuid, 'warning', OLD.user_id, v_meta);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS log_registrations ON public.registrations;
CREATE TRIGGER log_registrations
  AFTER INSERT OR UPDATE OR DELETE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.trg_log_registrations();

-- TRIGGER: Pembayaran (payments)
CREATE OR REPLACE FUNCTION public.trg_log_payments()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_action text;
  v_status text;
  v_meta jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'Transaksi pembayaran diinisialisasi';
    v_meta := jsonb_build_object(
      'amount', NEW.amount_idr,
      'status', NEW.status,
      'order_id', NEW.midtrans_order_id,
      'registration_id', NEW.registration_id
    );
    PERFORM public.log_activity(v_action, 'payment', NEW.id::uuid, 'info', NEW.user_id, v_meta);

  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      v_action := format('Status transaksi pembayaran diubah: %s → %s', OLD.status, NEW.status);
      v_status := CASE NEW.status
        WHEN 'success' THEN 'success'
        WHEN 'failed' THEN 'error'
        WHEN 'expired' THEN 'error'
        WHEN 'refunded' THEN 'warning'
        ELSE 'info'
      END;
      v_meta := jsonb_build_object(
        'amount', NEW.amount_idr,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'order_id', NEW.midtrans_order_id,
        'registration_id', NEW.registration_id
      );
      PERFORM public.log_activity(v_action, 'payment', NEW.id::uuid, v_status, NEW.user_id, v_meta);
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS log_payments ON public.payments;
CREATE TRIGGER log_payments
  AFTER INSERT OR UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.trg_log_payments();

-- TRIGGER: Lomba (competitions)
CREATE OR REPLACE FUNCTION public.trg_log_competitions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_meta jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_meta := jsonb_build_object('name', NEW.name, 'is_open', NEW.is_open);
    PERFORM public.log_activity('Lomba baru dibuat', 'competition', NEW.id::uuid, 'success', NULL, v_meta);
  ELSIF TG_OP = 'UPDATE' THEN
    v_meta := jsonb_build_object(
      'name', NEW.name,
      'old_open', OLD.is_open,
      'new_open', NEW.is_open
    );
    PERFORM public.log_activity('Data lomba diperbarui', 'competition', NEW.id::uuid, 'info', NULL, v_meta);
  ELSIF TG_OP = 'DELETE' THEN
    v_meta := jsonb_build_object('name', OLD.name);
    PERFORM public.log_activity('Lomba dihapus', 'competition', OLD.id::uuid, 'warning', NULL, v_meta);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS log_competitions ON public.competitions;
CREATE TRIGGER log_competitions
  AFTER INSERT OR UPDATE OR DELETE ON public.competitions
  FOR EACH ROW EXECUTE FUNCTION public.trg_log_competitions();

-- TRIGGER: User baru mendaftar (profiles)
CREATE OR REPLACE FUNCTION public.trg_log_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_meta jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_meta := jsonb_build_object('full_name', NEW.full_name, 'institution', NEW.institution);
    PERFORM public.log_activity('Pengguna baru mendaftar', 'user', NEW.id::uuid, 'success', NEW.id, v_meta);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.suspended IS DISTINCT FROM NEW.suspended THEN
      v_meta := jsonb_build_object('full_name', NEW.full_name, 'suspended', NEW.suspended);
      PERFORM public.log_activity(
        CASE WHEN NEW.suspended THEN 'Pengguna disuspend' ELSE 'Suspense pengguna dicabut' END,
        'user', NEW.id::uuid,
        CASE WHEN NEW.suspended THEN 'warning' ELSE 'success' END,
        NEW.id, v_meta
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_meta := jsonb_build_object('full_name', OLD.full_name);
    PERFORM public.log_activity('Akun pengguna dihapus', 'user', OLD.id::uuid, 'warning', OLD.id, v_meta);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS log_user_signup ON public.profiles;
CREATE TRIGGER log_user_signup
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trg_log_user_signup();

-- TRIGGER: Perubahan role pengguna (user_roles)
CREATE OR REPLACE FUNCTION public.trg_log_user_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_meta jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_meta := jsonb_build_object('user_id', NEW.user_id, 'role', NEW.role);
    PERFORM public.log_activity('Role pengguna ditetapkan: ' || NEW.role, 'user', NEW.user_id::uuid, 'info', NULL, v_meta);
  ELSIF TG_OP = 'UPDATE' THEN
    v_meta := jsonb_build_object('user_id', NEW.user_id, 'old_role', OLD.role, 'new_role', NEW.role);
    PERFORM public.log_activity('Role pengguna diubah: ' || OLD.role || ' → ' || NEW.role, 'user', NEW.user_id::uuid, 'info', NULL, v_meta);
  ELSIF TG_OP = 'DELETE' THEN
    v_meta := jsonb_build_object('user_id', OLD.user_id, 'role', OLD.role);
    PERFORM public.log_activity('Role pengguna dihapus: ' || OLD.role, 'user', OLD.user_id::uuid, 'warning', NULL, v_meta);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS log_user_roles ON public.user_roles;
CREATE TRIGGER log_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.trg_log_user_roles();

-- TRIGGER: Berita (news)
CREATE OR REPLACE FUNCTION public.trg_log_news()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_meta jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_meta := jsonb_build_object('title', NEW.title, 'slug', NEW.slug);
    PERFORM public.log_activity('Berita baru diterbitkan', 'news', NEW.id::uuid, 'success', NULL, v_meta);
  ELSIF TG_OP = 'UPDATE' THEN
    v_meta := jsonb_build_object('title', NEW.title, 'slug', NEW.slug);
    PERFORM public.log_activity('Berita diperbarui', 'news', NEW.id::uuid, 'info', NULL, v_meta);
  ELSIF TG_OP = 'DELETE' THEN
    v_meta := jsonb_build_object('title', OLD.title);
    PERFORM public.log_activity('Berita dihapus', 'news', OLD.id::uuid, 'warning', NULL, v_meta);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS log_news ON public.news;
CREATE TRIGGER log_news
  AFTER INSERT OR UPDATE OR DELETE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.trg_log_news();

-- TRIGGER: Seminar
CREATE OR REPLACE FUNCTION public.trg_log_seminars()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_meta jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_meta := jsonb_build_object('title', NEW.title);
    PERFORM public.log_activity('Seminar baru dibuat', 'seminar', NEW.id::uuid, 'success', NULL, v_meta);
  ELSIF TG_OP = 'UPDATE' THEN
    v_meta := jsonb_build_object('title', NEW.title);
    PERFORM public.log_activity('Data seminar diperbarui', 'seminar', NEW.id::uuid, 'info', NULL, v_meta);
  ELSIF TG_OP = 'DELETE' THEN
    v_meta := jsonb_build_object('title', OLD.title);
    PERFORM public.log_activity('Seminar dihapus', 'seminar', OLD.id::uuid, 'warning', NULL, v_meta);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS log_seminars ON public.seminars;
CREATE TRIGGER log_seminars
  AFTER INSERT OR UPDATE OR DELETE ON public.seminars
  FOR EACH ROW EXECUTE FUNCTION public.trg_log_seminars();

-- TRIGGER: Pengiriman notifikasi
CREATE OR REPLACE FUNCTION public.trg_log_notifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_meta jsonb;
BEGIN
  v_meta := jsonb_build_object(
    'title', NEW.title,
    'is_for_admin', NEW.is_for_admin,
    'user_id', NEW.user_id
  );
  PERFORM public.log_activity('Notifikasi dikirim: ' || NEW.title, 'notification', NEW.id::uuid, 'info', NEW.user_id, v_meta);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_notifications ON public.notifications;
CREATE TRIGGER log_notifications
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.trg_log_notifications();

-- TRIGGER: Site settings / Pengaturan website
CREATE OR REPLACE FUNCTION public.trg_log_site_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_meta jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_meta := jsonb_build_object('id', NEW.id, 'value', NEW.value);
    PERFORM public.log_activity('Pengaturan website dibuat: ' || NEW.id, 'site_settings', NULL, 'info', NULL, v_meta);
  ELSIF TG_OP = 'UPDATE' THEN
    v_meta := jsonb_build_object('id', NEW.id, 'old_value', OLD.value, 'new_value', NEW.value);
    PERFORM public.log_activity('Pengaturan website diubah: ' || NEW.id, 'site_settings', NULL, 'info', NULL, v_meta);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS log_site_settings ON public.site_settings;
CREATE TRIGGER log_site_settings
  AFTER INSERT OR UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.trg_log_site_settings();

-- INDEX untuk performa query logs
CREATE INDEX IF NOT EXISTS idx_export_logs_created_at ON public.export_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_export_logs_status ON public.export_logs(status);
CREATE INDEX IF NOT EXISTS idx_export_logs_entity_type ON public.export_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_export_logs_actor_id ON public.export_logs(actor_id);


