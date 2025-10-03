-- =====================================================
-- PADEL BOOKING - SAMPLE DATA
-- Data awal untuk testing
-- =====================================================

-- 1. INSERT FIELDS (Lapangan)
-- =====================================================

INSERT INTO public.fields (id, name, description, price_per_hour, image_url, is_active)
VALUES 
  (
    'a1d4fc32-27f1-4e47-bf7e-2c63301dac6c',
    'Lapangan Padel A',
    'Lapangan indoor premium dengan pencahayaan LED terbaik',
    150000.00,
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
    true
  ),
  (
    'e8806da9-ae4f-4813-b6fd-eb0fd4d49e06',
    'Lapangan Padel B',
    'Lapangan outdoor dengan rumput sintetis berkualitas',
    120000.00,
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- 2. INSERT SETTINGS
-- =====================================================

INSERT INTO public.settings (
  site_name,
  site_logo_url,
  hero_banner_url,
  whatsapp_number,
  qris_image_url,
  payment_instructions,
  webhook_url
)
VALUES (
  'Padel Booking',
  NULL,
  NULL,
  '6285355341334', -- Ganti dengan nomor WhatsApp admin
  NULL, -- Upload QRIS di admin panel
  'Silakan transfer ke rekening berikut:\nBank: BCA\nNo. Rek: 1234567890\nA.n: Padel Booking\n\nAtau scan QRIS di atas.\n\nSetelah transfer, konfirmasi via WhatsApp.',
  NULL -- Isi webhook URL untuk n8n jika ada
)
ON CONFLICT DO NOTHING;

-- 3. CREATE ADMIN USER (MANUAL STEP)
-- =====================================================
-- PENTING: Setelah run script ini, Anda perlu:
-- 
-- A. Buat akun admin via Sign Up di app:
--    Email: admin@padelbatam.com
--    Password: [password pilihan Anda]
--
-- B. Setelah signup, dapatkan user_id dari tabel auth.users
-- 
-- C. Run query ini untuk set role admin (ganti USER_ID):
--    INSERT INTO public.user_roles (user_id, role)
--    VALUES ('USER_ID_DARI_AUTH_USERS', 'admin');
--
-- Atau via Lovable Cloud Dashboard:
-- 1. Buka Users tab
-- 2. Temukan user yang baru dibuat
-- 3. Tambahkan role 'admin' secara manual

-- 4. SAMPLE ARTICLE (Optional)
-- =====================================================
-- Note: author_id harus diisi dengan ID user yang sudah dibuat
-- Uncomment dan ganti USER_ID setelah admin dibuat:

-- INSERT INTO public.articles (
--   title,
--   excerpt,
--   content,
--   author_id,
--   is_published
-- )
-- VALUES (
--   'Selamat Datang di Padel Booking!',
--   'Booking lapangan padel kini lebih mudah dan cepat',
--   'Selamat datang di sistem booking lapangan padel kami. Anda dapat dengan mudah memesan lapangan, memilih waktu yang sesuai, dan melakukan pembayaran secara online. Nikmati pengalaman bermain padel yang lebih menyenangkan!',
--   'USER_ID_ADMIN', -- Ganti dengan ID admin
--   true
-- );

-- =====================================================
-- SAMPLE DATA SETUP COMPLETE
-- =====================================================

-- NEXT STEPS:
-- 1. Sign up sebagai admin di aplikasi
-- 2. Dapatkan user_id dari Users tab di Lovable Cloud
-- 3. Insert role admin dengan query:
--    INSERT INTO public.user_roles (user_id, role) 
--    VALUES ('your-user-id', 'admin');
-- 4. Upload QRIS image di Admin Panel -> Settings
-- 5. Update WhatsApp number di Settings jika perlu
