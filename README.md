**Deskriptor AI** adalah aplikasi yang dibuat menggunakan Next.js untuk menghasilkan judul dan deskripsi produk yang menarik dan SEO-friendly secara otomatis. Aplikasi ini pakai teknologi **Google Gemini AI** dan **Grounding by Google** buat memastikan data yang dihasilkan faktual dan aktual.

**Fitur Utama:**
- **Login dengan Remember Me**: Akses login dengan fitur "Ingat saya" yang aktif selama 1 jam.
- **Pembuatan Deskripsi Produk**: Membuat deskripsi produk secara otomatis, lengkap dengan judul kreatif.
- **Riwayat Deskripsi**: Menyimpan deskripsi yang pernah dibuat untuk referensi atau revisi di kemudian hari.
- **Pengaturan Tema Terang/Gelap**: Pilihan tema sesuai preferensi pengguna.
- **Notifikasi Interaktif**: Mengirim notifikasi sesuai aksi yang dilakukan pengguna.

**Prasyarat:**
- **API Key Google Gemini**.
- **Node.js dan npm** yang terinstal di komputer lo.

**Cara Install:**
1. Clone repository ini ke komputer lo.
2. Jalankan `npm install` buat install semua dependencies.
3. Tambahin file `.env.local` di root project lo, lalu masukin API Key kayak gini:  
   `GEMINI_API=gemini_api_lo`
4. Setelah itu, lo bisa jalankan aplikasi dengan `npm run dev` dan akses di `http://localhost:3000`.

**Cara Pakai:**
1. Login dengan password (default: "dev") buat akses aplikasi.
2. Isi form produk dengan detail kayak nama toko, SKU, kategori, judul produk, bahan, warna, ukuran, dan fitur.
3. Klik "Buat Deskripsi" buat hasilin deskripsi otomatis.
4. Lihat riwayat deskripsi sebelumnya di bagian riwayat buat referensi atau edit kalau dibutuhin.

**Teknologi yang Digunakan:**
- **Next.js** buat framework frontend.
- **Google Generative AI (Gemini)** buat bikin deskripsi produk.
- **Grounding by Google** buat memastikan data yang diberikan akurat dan sesuai fakta.
- **Framer Motion** buat animasi interaktif.
- **Lucide-React** buat ikon di UI.
- **Marked** buat parsing konten markdown.
- **LocalStorage** buat nyimpen riwayat deskripsi dan status login sementara.

**Komponen Utama:**
- `Home` buat tampilan dan interaksi utama.
- `Card` buat berbagai bagian UI seperti form input, hasil, dan riwayat.
- `Dialog` buat mengedit atau menghapus judul di riwayat.
- `ThemeToggle` buat switching tema terang/gelap.

**Catatan Keamanan:**
Pastikan API Key lo aman dan nggak kebagi di repository publik. Gunakan file `.env` buat simpan konfigurasi sensitif.

---

Selamat menggunakan Deskriptor AI buat bikin deskripsi produk yang keren!
