import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
  console.log('Received request in route handler');
  try {
    const { formData } = await req.json();
    console.log('Received formData:', formData);

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Tugas:
      1. Buat 5 judul kreatif menggunakan kata kunci seperti referensi ini: '${formData.judulProduk}'. Hindari hiperbola, gunakan bahasa yang serupa dengan judul asli namun lebih menarik.
      2. Buat deskripsi produk yang detail dan informatif untuk perhiasan ${formData.namaToko} dengan SKU ${formData.skuProduk}.

      Panduan untuk deskripsi produk:
      - Mulai dengan paragraf pembuka yang menarik, ramah SEO.
      - SKU produk: ${formData.skuProduk}
      - Jenis: ${formData.kategori}
      - Keunggulan produk: Jelaskan minimal 5 keunggulan produk secara detail.
      - Detail produk:
        * Bahan: ${formData.bahan || '[Deskripsikan bahan berkualitas tinggi yang sesuai]'}
        * Kualitas: Jelaskan proses pembuatan dan standar kualitas yang diterapkan.
        * Ukuran: ${formData.ukuran || '[Berikan ukuran yang spesifik dan akurat]'}
        * Warna: ${formData.warna || '[Deskripsikan warna dan tampilan visual produk]'}
        * Model: Jelaskan gaya dan desain produk secara rinci.
        * Fitur Khusus: ${formData.fiturKhusus || '[Jelaskan fitur unik produk]'}
      - Kesesuaian: Jelaskan untuk siapa produk ini cocok dan pada kesempatan apa bisa digunakan.
      - Perawatan: Berikan tips perawatan produk untuk menjaga kualitas jangka panjang.
      - Layanan pelanggan: Jelaskan secara detail layanan after-sales, garansi, dan komitmen kepuasan pelanggan.
      - Akhiri dengan paragraf penutup yang memotivasi pembelian dan menekankan nilai produk.

      Penting:
      - Gunakan bahasa Indonesia yang sopan, menarik, dan persuasif.
      - Sertakan fakta dan detail spesifik untuk meningkatkan kredibilitas.
      - Gunakan variasi kalimat dan struktur paragraf untuk membuat deskripsi lebih dinamis.
      - Masukkan kata-kata kunci yang relevan dengan produk untuk SEO.
      - Panjang deskripsi maksimal 300 kata.
      - Jangan menambahkan catatan atau instruksi tambahan di akhir deskripsi.
      - Hindari bahasa yang bisa dianggap tidak pantas atau sensual.
      - Gunakan format Markdown untuk penekanan teks (contoh: **teks tebal**, *teks miring*).
      - Gunakan # untuk judul utama, ## untuk sub-judul, dan ### untuk sub-sub-judul.
    `;

    console.log('Sending prompt to Gemini API');
    const result = await model.generateContent(prompt);
    console.log('Received response from Gemini API');
    const response = await result.response;
    const text = response.text();

    if (!text) {
      console.error('Empty response from Gemini API');
      return NextResponse.json({ error: 'Konten yang dihasilkan kosong.' }, { status: 500 });
    }

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error('Error in route handler:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat menghasilkan konten.' }, { status: 500 });
  }
}