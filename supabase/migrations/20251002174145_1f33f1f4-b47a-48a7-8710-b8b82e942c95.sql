-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create user_roles table for admin management
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create fields (courts) table
CREATE TABLE public.fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_per_hour DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active fields"
  ON public.fields FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert fields"
  ON public.fields FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update fields"
  ON public.fields FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete fields"
  ON public.fields FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create bookings table
CREATE TYPE public.booking_status AS ENUM ('pending', 'paid', 'canceled');

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status booking_status DEFAULT 'pending' NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(field_id, booking_date, start_time)
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view bookings"
  ON public.bookings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update bookings"
  ON public.bookings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bookings"
  ON public.bookings FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create articles table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published articles"
  ON public.articles FOR SELECT
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert articles"
  ON public.articles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update articles"
  ON public.articles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete articles"
  ON public.articles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create settings table
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT DEFAULT 'Padel Booking' NOT NULL,
  site_logo_url TEXT,
  hero_banner_url TEXT,
  whatsapp_number TEXT,
  qris_image_url TEXT,
  payment_instructions TEXT,
  webhook_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings"
  ON public.settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update settings"
  ON public.settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert settings"
  ON public.settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.settings (site_name, payment_instructions)
VALUES ('Padel Booking', 'Silakan transfer ke nomor QRIS di atas dan konfirmasi pembayaran melalui WhatsApp admin.');

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.fields
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Storage policies
CREATE POLICY "Public images are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

CREATE POLICY "Admins can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'));