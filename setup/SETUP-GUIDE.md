# 🎾 Panduan Setup Padel Booking App

## 📋 Prerequisites
1. Project Lovable baru sudah dibuat
2. Lovable Cloud sudah aktif dan terhubung ke Supabase project: `espaknhmihmrwzjoprsu`

---

## 🚀 Langkah Setup

### 1️⃣ Copy Code dari Project Lama
- Transfer semua code dari project ini ke project baru Anda
- Bisa via GitHub atau copy manual semua file

### 2️⃣ Setup Database Schema

**Via Lovable Cloud Dashboard:**

1. Buka Lovable Cloud Dashboard
2. Pilih tab **"SQL Editor"** atau gunakan migration tool
3. Copy dan paste isi file `setup/01-database-schema.sql`
4. Jalankan SQL tersebut
5. Pastikan tidak ada error

**Via Supabase Dashboard (Alternative):**
1. Login ke https://supabase.com/dashboard
2. Pilih project `espaknhmihmrwzjoprsu`
3. Buka **SQL Editor**
4. Copy paste isi `01-database-schema.sql`
5. Run query

### 3️⃣ Insert Sample Data

1. Copy dan paste isi file `setup/02-sample-data.sql`
2. Run SQL di SQL Editor
3. Ini akan membuat:
   - 2 lapangan sample (Lapangan A & B)
   - Settings default
   - Storage bucket untuk images

### 4️⃣ Buat Admin User

**A. Sign Up di Aplikasi**
1. Buka aplikasi Anda
2. Klik "Admin" di navbar
3. Sign up dengan:
   - Email: `admin@padelbatam.com` (atau email pilihan Anda)
   - Password: [password pilihan Anda]

**B. Set Role Admin**

Via Lovable Cloud Dashboard:
1. Buka **Users** tab
2. Temukan user yang baru dibuat
3. Copy **User ID**
4. Buka **SQL Editor**
5. Run query ini (ganti `YOUR_USER_ID`):

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin');
```

**Verifikasi:**
- Login dengan akun admin
- Anda seharusnya bisa akses Admin Dashboard

### 5️⃣ Konfigurasi Settings

1. Login sebagai admin
2. Buka **Admin Dashboard → Settings**
3. Upload **QRIS image** untuk pembayaran
4. Update **WhatsApp number** (format: 6285355341334)
5. Update **Site Name** jika perlu
6. Upload **Hero Banner** untuk homepage
7. Isi **Webhook URL** untuk n8n (optional)

### 6️⃣ Enable Auto-Confirm Email (Testing)

Via Lovable Cloud Dashboard:
1. Buka **Auth Settings**
2. Enable **"Auto-confirm email signups"**
3. Ini mempercepat testing (users langsung confirmed tanpa email)

### 7️⃣ Testing

1. **Test Booking Flow:**
   - Pilih lapangan
   - Pilih tanggal & waktu
   - Isi form booking
   - Cek pembayaran dengan QRIS
   - Konfirmasi via WhatsApp

2. **Test Admin Panel:**
   - Kelola booking (ubah status)
   - Tambah/edit lapangan
   - Tambah artikel
   - Update settings

---

## 📁 File Structure

```
setup/
├── 01-database-schema.sql    # Schema lengkap (tables, RLS, functions)
├── 02-sample-data.sql         # Data awal (fields, settings)
└── SETUP-GUIDE.md            # Panduan ini
```

---

## 🔧 Troubleshooting

### Error: "relation does not exist"
- Schema belum di-run dengan benar
- Run ulang `01-database-schema.sql`

### Error: "new row violates row-level security"
- User belum punya role yang tepat
- Pastikan admin role sudah di-insert

### Tidak bisa login sebagai admin
- Cek apakah user_roles sudah berisi role 'admin'
- Query: `SELECT * FROM user_roles WHERE user_id = 'YOUR_USER_ID';`

### Data tidak muncul
- Cek RLS policies: `SELECT * FROM fields;` di SQL Editor
- Pastikan is_active = true untuk fields

---

## 📞 Support

Jika ada masalah:
1. Cek console logs di browser (F12)
2. Cek database logs di Lovable Cloud
3. Pastikan semua migrations sudah berjalan
4. Verifikasi RLS policies sudah aktif

---

## ✅ Checklist Setup

- [ ] Code sudah di-copy ke project baru
- [ ] Database schema sudah di-run
- [ ] Sample data sudah di-insert
- [ ] Admin user sudah dibuat dan punya role
- [ ] QRIS image sudah diupload
- [ ] WhatsApp number sudah diset
- [ ] Auto-confirm email sudah enabled
- [ ] Testing booking flow berhasil
- [ ] Admin panel berfungsi normal

---

**Selamat! Setup selesai! 🎉**

Aplikasi Padel Booking Anda siap digunakan.
