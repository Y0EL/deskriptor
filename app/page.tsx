'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Edit2, Trash2, Lock, Unlock } from 'lucide-react'
import ResultsDisplay from '@/components/results-display'
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

type ResultType = {
  titles: string[];
  description: string;
}

type HistoryItem = {
  id: number;
  judul: string;
  konten: ResultType;
  timestamp: string;
}

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
  const [result, setResult] = useState<ResultType | null>(null)
  const [riwayat, setRiwayat] = useState<HistoryItem[]>([])
  const [riwayatTerpilih, setRiwayatTerpilih] = useState<HistoryItem | null>(null)
  const [dialogState, setDialogState] = useState<{ type: string; id: number | null; judul: string }>({ type: '', id: null, judul: '' })

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
            message: "Terlalu banyak percobaan. Silakan coba lagi nanti.",
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
      message: "Logout berhasil. Terima kasih telah menggunakan Deskriptor AI.",
      type: "success",
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const generateDescription = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: ResultType = await response.json();
      setResult(data);
      tambahKeRiwayat(data);
    } catch (error) {
      console.error('Error generating content:', error);
      setNotification({ message: 'Terjadi kesalahan saat menghasilkan konten.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const tambahKeRiwayat = (konten: ResultType) => {
    const itemRiwayatBaru: HistoryItem = {
      id: Date.now(),
      judul: formData.judulProduk || 'Produk Tanpa Judul',
      konten,
      timestamp: new Date().toLocaleString('id-ID'),
    }
    const riwayatDiperbarui = [itemRiwayatBaru, ...riwayat]
    setRiwayat(riwayatDiperbarui)
    localStorage.setItem('riwayatDeskripsiProduk', JSON.stringify(riwayatDiperbarui))
    setNotification({ message: 'Deskripsi berhasil ditambahkan ke riwayat.', type: 'success' })
  }

  const handleUbahJudul = (id: number, judulBaru: string) => {
    const riwayatDiperbarui = riwayat.map((item) =>
      item.id === id ? { ...item, judul: judulBaru } : item
    )
    setRiwayat(riwayatDiperbarui)
    localStorage.setItem('riwayatDeskripsiProduk', JSON.stringify(riwayatDiperbarui))
    setNotification({
      message: `Judul berhasil diubah menjadi "${judulBaru}"`,
      type: 'success'
    })
  }

  const handleHapus = (id: number) => {
    const riwayatDiperbarui = riwayat.filter((item) => item.id !== id)
    setRiwayat(riwayatDiperbarui)
    localStorage.setItem('riwayatDeskripsiProduk', JSON.stringify(riwayatDiperbarui))
    setNotification({
      message: "Item riwayat telah dihapus dari daftar",
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
                    <Checkbox id="rememberMe" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} />
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
        <h1 className="text-3xl font-bold">Deskriptor</h1>
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
            <ResultsDisplay result={riwayatTerpilih ? riwayatTerpilih.konten : result} />
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
                              <Button onClick={() => dialogState.id && handleUbahJudul(dialogState.id, dialogState.judul)}>
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
                              onClick={() => setDialogState({ type: 'delete', id: item.id, judul: '' })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
                              <DialogDescription>
                                Lo yakin mau hapus riwayat ini? Karena ini gabisa dibatalkan.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="destructive" onClick={() => dialogState.id && handleHapus(dialogState.id)}>
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
        © 2024 Deskriptor. All rights reserved.
      </footer>
    </div>
  )
}
