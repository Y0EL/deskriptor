import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string)

function processOutput(text: string) {
  const lines = text.split('\n')
  const titles = []
  let description = ''
  let isTitles = true

  for (const line of lines) {
    if (line.trim() === '') {
      isTitles = false
      continue
    }
    if (isTitles) {
      titles.push(line.trim())
    } else {
      description += line + '\n'
    }
  }

  return {
    titles,
    description: description.trim()
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { storeName, productSKU, category, productTitle, material, color, size, specialFeatures } = body

  const prompt = `
    Tugas:
    1. Buat 5 judul kreatif menggunakan kata kunci seperti referensi ini: '${productTitle}'. Hindari hiperbola, gunakan bahasa yang serupa dengan judul asli namun lebih menarik.
    2. Buat deskripsi produk yang detail dan informatif untuk perhiasan ${storeName} dengan SKU ${productSKU}.

    Panduan untuk deskripsi produk:
    - Mulai dengan paragraf pembuka yang menarik, menggambarkan keindahan dan keunikan produk.
    - Sertakan informasi berikut dalam format "Judul: Isi":
      - SKU Produk: ${productSKU}
      - Jenis: ${category}
      - Bahan: ${material || 'Deskripsikan bahan berkualitas tinggi yang sesuai'}
      - Ukuran: ${size || 'Berikan ukuran yang spesifik dan akurat'}
      - Warna: ${color || 'Deskripsikan warna dan tampilan visual produk'}
      - Fitur Khusus: ${specialFeatures || 'Jelaskan fitur unik produk'}
    - Keunggulan Produk: Jelaskan minimal 5 keunggulan produk secara detail.
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
