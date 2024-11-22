import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

function processOutput(text: string): { titles: string[]; description: string } {
  const sections = text.split('\n\n')
  const titles = sections[0].split('\n').filter(line => line.trim() !== '')
  const description = sections.slice(1).join('\n\n').trim()

  return {
    titles,
    description
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { namaToko, skuProduk, kategori, judulProduk, bahan, warna, ukuran, fiturKhusus } = body.formData

  const prompt = `
Tugas:
1. Buat 5 judul kreatif menggunakan kata kunci seperti referensi ini: '${judulProduk}'. Hindari hiperbola, gunakan bahasa yang serupa dengan judul asli namun lebih menarik.
2. Buat deskripsi produk yang detail dan informatif untuk ${kategori} dari toko ${namaToko} dengan SKU ${skuProduk}.

Panduan untuk deskripsi produk:
- Mulai dengan paragraf pembuka yang menarik, menggambarkan keindahan dan keunikan produk.
- Sertakan informasi berikut dalam format "Judul: Isi":
  - SKU Produk: ${skuProduk}
  - Jenis: ${kategori}
  - Bahan: ${bahan || 'Deskripsikan bahan berkualitas tinggi yang sesuai'}
  - Ukuran: ${ukuran || 'Berikan ukuran yang spesifik dan akurat'}
  - Warna: ${warna || 'Deskripsikan warna dan tampilan visual produk'}
  - Fitur Khusus: ${fiturKhusus || 'Jelaskan fitur unik produk'}
- Keunggulan Produk: Jelaskan keunggulan produk secara detail dan deskriptif.
- Kesesuaian: Jelaskan untuk siapa produk ini cocok dan pada kesempatan apa bisa digunakan.
- Perawatan: Berikan tips perawatan produk untuk menjaga kualitas jangka panjang.
- Layanan Pelanggan: Jelaskan secara detail layanan after-sales, garansi, dan komitmen kepuasan pelanggan.
- Akhiri dengan paragraf penutup yang memotivasi pembelian dan menekankan nilai produk.

Penting:
- Gunakan bahasa Indonesia yang sopan, menarik, dan persuasif.
- Sertakan fakta dan detail spesifik untuk meningkatkan kredibilitas.
- Gunakan variasi kalimat dan struktur paragraf untuk membuat deskripsi lebih dinamis.
- Masukkan kata-kata kunci yang relevan dengan produk untuk SEO.
- Panjang deskripsi minimal 300 kata.
- Jangan menambahkan catatan atau instruksi tambahan di akhir deskripsi.
- Hindari bahasa yang bisa dianggap tidak pantas atau sensual.
- Pisahkan judul dan deskripsi dengan baris kosong.
- Jangan gunakan format markdown atau karakter khusus lainnya untuk penekanan.

Format output:
[Judul 1]
[Judul 2]
[Judul 3]
[Judul 4]
[Judul 5]

[Deskripsi produk]
`

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const processedOutput = processOutput(response.text())

    return NextResponse.json(processedOutput)
  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}
