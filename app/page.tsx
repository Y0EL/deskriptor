'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Edit2, Trash2, Lock, Unlock } from 'lucide-react'
import { marked } from 'marked'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { motion, AnimatePresence } from 'framer-motion'
import { Checkbox } from "@/components/ui/checkbox"

// Inisialisasi Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginError, setShowLoginError] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [rememberMe, setRememberMe] = useState(false)

  const [formData, setFormData] = useState({
    namaToko: '',
    skuProduk: '',
    kategori: '',
    judulProduk: '',
    bahan: '',
    warna: '',
    ukuran: '',
    fiturKhusus: '',
  })
  const [kontenHasil, setKontenHasil] = useState('')
  const [riwayat, setRiwayat] = useState([])
  const [riwayatTerpilih, setRiwayatTerpilih] = useState(null)
  const [dialogState, setDialogState] = useState({ type: '', id: null, judul: '' })

  useEffect(() => {
    const riwayatTersimpan = localStorage.getItem('riwayatDeskripsiProduk')
    if (riwayatTersimpan) {
      setRiwayat(JSON.parse(riwayatTersimpan))
    }
    const loginExpiration = localStorage.getItem('loginExpiration')
    if (loginExpiration) {
      const currentTime = new Date().getTime()
      if (currentTime < parseInt(loginExpiration)) {
        setIsLoggedIn(true)
      } else {
        localStorage.removeItem('loginExpiration')
      }
    }
  }, [])

  const handleLogin = () => {
    setIsLoading(true)
    setTimeout(() => {
      if (password === '' || password === 'dev') {
        setIsLoggedIn(true)
        setShowLoginError(false)
        setLoginAttempts(0)
        setNotification({ message: "Login berhasil", type: "success" })
        if (rememberMe) {
          const expirationTime = new Date().getTime() + 60 * 60 * 1000 // 1 hour
          localStorage.setItem('loginExpiration', expirationTime.toString())
        }
      } else {
        setShowLoginError(true)
        setLoginAttempts(prev => prev + 1)
        if (loginAttempts >= 2) {
          setPassword('')
          setLoginAttempts(0)
          setNotification({
            message: "Terlalu banyak percobaan",
            description: "Silakan coba lagi nanti",
            type: "error",
          })
        }
      }
      setIsLoading(false)
    }, 1500)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setPassword('')
    localStorage.removeItem('loginExpiration')
    setNotification({
      message: "Logout berhasil",
      description: "Terima kasih telah menggunakan Deskriptor AI",
      type: "success",
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const generateDescription = async () => {
    setIsLoading(true)
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

      const prompt = `
        Tugas:
        1. Buat 5 judul kreatif menggunakan kata kunci seperti referensi ini: '${formData.judulProduk}'. Hindari hiperbola, gunakan bahasa yang serupa dengan judul asli namun lebih menarik.
        2. Buat deskripsi produk yang detail dan informatif untuk perhiasan ${formData.namaToko} dengan SKU ${formData.skuProduk}.

        Panduan untuk deskripsi produk:
        - Mulai dengan paragraf pembuka yang menarik, menggambarkan keindahan dan keunikan produk.
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
        - Panjang deskripsi minimal 300 kata.
        - Jangan menambahkan catatan atau instruksi tambahan di akhir deskripsi.
        - Hindari bahasa yang bisa dianggap tidak pantas atau sensual.
        - Gunakan format Markdown untuk penekanan teks (contoh: **teks tebal**, *teks miring*).
        - Gunakan # untuk judul utama, ## untuk sub-judul, dan ### untuk sub-sub-judul.
      `;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        safetySettings: [
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      const response = await result.response;
      const text = response.text();
      setKontenHasil(text);
      tambahKeRiwayat(text);
    } catch (error) {
      console.error('Error generating content:', error);
      setKontenHasil('Terjadi kesalahan saat menghasilkan konten. Silakan coba lagi.');
      setNotification({ message: 'Terjadi kesalahan saat menghasilkan konten.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const tambahKeRiwayat = (konten) => {
    const itemRiwayatBaru = {
      id: Date.now(),
      judul: formData.judulProduk || 'Produk Tanpa Judul',
      konten,
      timestamp: new Date().toLocaleString('id-ID'),
    }
    const riwayatDiperbarui = [...riwayat, itemRiwayatBaru]
    setRiwayat(riwayatDiperbarui)
    localStorage.setItem('riwayatDeskripsiProduk', JSON.stringify(riwayatDiperbarui))
    setNotification({ message: 'Deskripsi berhasil ditambahkan ke riwayat.', type: 'success' })
  }

  const handleUbahJudul = (id, judulBaru) => {
    const riwayatDiperbarui = riwayat.map((item) =>
      item.id === id ? { ...item, judul: judulBaru } : item
    )
    setRiwayat(riwayatDiperbarui)
    localStorage.setItem('riwayatDeskripsiProduk', JSON.stringify(riwayatDiperbarui))
    setNotification({
      message: "Judul berhasil diubah",
      description: `Judul telah diperbarui menjadi "${judulBaru}"`,
      type: 'success'
    })
  }

  const handleHapus = (id) => {
    const riwayatDiperbarui = riwayat.filter((item) => item.id !== id)
    setRiwayat(riwayatDiperbarui)
    localStorage.setItem('riwayatDeskripsiProduk', JSON.stringify(riwayatDiperbarui))
    setNotification({
      message: "Riwayat berhasil dihapus",
      description: "Item riwayat telah dihapus dari daftar",
      type: 'success'
    })
  }

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="w-96">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Login Deskriptor AI</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={showLoginError ? 'border-red-500' : ''}
                    />
                    {showLoginError && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500"
                      >
                        Password salah. Sisa percobaan: {3 - loginAttempts}
                      </motion.p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox id="rememberMe" checked={rememberMe} onCheckedChange={setRememberMe} />
                    <label htmlFor="rememberMe" className="text-sm text-gray-600">
                      Ingat saya selama 1 jam
                    </label>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Lock className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Deskriptor AI 🛍️</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {notification && (
            <div className={`px-4 py-2 rounded-md ${
              notification.type === 'success' ? 'bg-green-500' :
              notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            } text-white`}>
              {notification.message}
            </div>
          )}
          <Button onClick={handleLogout} variant="outline">
            <Unlock className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Informasi Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <Input
                name="namaToko"
                placeholder="Nama Toko"
                value={formData.namaToko}
                onChange={handleInputChange}
              />
              <Input
                name="skuProduk"
                placeholder="SKU Produk"
                value={formData.skuProduk}
                onChange={handleInputChange}
              />
              <Input
                name="kategori"
                placeholder="Kategori Produk"
                value={formData.kategori}
                onChange={handleInputChange}
              />
              <Input
                name="judulProduk"
                placeholder="Judul Produk"
                value={formData.judulProduk}
                onChange={handleInputChange}
              />
              <Input
                name="bahan"
                placeholder="Bahan (opsional)"
                value={formData.bahan}
                onChange={handleInputChange}
              />
              <Input
                name="warna"
                placeholder="Warna (opsional)"
                value={formData.warna}
                onChange={handleInputChange}
              />
              <Input
                name="ukuran"
                placeholder="Ukuran (opsional)"
                value={formData.ukuran}
                onChange={handleInputChange}
              />
              <Textarea
                name="fiturKhusus"
                placeholder="Fitur Khusus (opsional, pisahkan dengan koma)"
                value={formData.fiturKhusus}
                onChange={handleInputChange}
              />
              <Button onClick={generateDescription} className="w-full" 
                disabled={isLoading}>
                {isLoading ? 'Lagi Ngetik...' : 'Buat Deskripsi'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Konten Hasil</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose dark:prose-invert h-[500px] overflow-y-auto"
              dangerouslySetInnerHTML={{
                __html: riwayatTerpilih
                  ? marked.parse(riwayatTerpilih.konten)
                  : marked.parse(kontenHasil)
              }}
            />
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle>Riwayat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {riwayat.map((item) => (
                <Card key={item.id} className="flex flex-col justify-between group">
                  <CardHeader>
                    <CardTitle className="text-sm flex justify-between items-center">
                      {item.judul}
                      <span className="text-xs text-gray-500">{item.timestamp}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <Button variant="outline" onClick={() => setRiwayatTerpilih(item)}>
                        Lihat
                      </Button>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDialogState({ type: 'edit', id: item.id, judul: item.judul })}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Ubah Judul Riwayat</DialogTitle>
                              <DialogDescription>
                                Masukkan judul baru untuk riwayat ini.
                              </DialogDescription>
                            </DialogHeader>
                            <Input
                              value={dialogState.judul}
                              onChange={(e) => setDialogState({ ...dialogState, judul: e.target.value })}
                            />
                            <DialogFooter>
                              <Button onClick={() => handleUbahJudul(dialogState.id, dialogState.judul)}>
                                Simpan Perubahan
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDialogState({ type: 'delete', id: item.id })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
                              <DialogDescription>
                                Apakah Anda yakin ingin menghapus riwayat ini? Tindakan ini tidak dapat dibatalkan.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="destructive" onClick={() => handleHapus(dialogState.id)}>
                                Hapus
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <footer className="border-t mt-8 py-4 text-center text-sm text-muted-foreground">
      © 2024 Deskriptor AI. All rights reserved.
      </footer>
      </div>
  )
}