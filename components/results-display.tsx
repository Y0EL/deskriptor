'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ResultType = {
  titles: string[];
  description: string;
}

export default function ResultsDisplay({ result }: { result: ResultType | null }) {
  const formatDescription = (description: string) => {
    const sections = description.split('\n\n');
    return sections.map((section, index) => {
      if (section.includes(':')) {
        const [title, ...content] = section.split(':');
        return (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-semibold mb-2">{title.trim()}:</h3>
            <p className="text-sm">{content.join(':').trim()}</p>
          </div>
        );
      }
      return <p key={index} className="mb-4 text-sm">{section.trim()}</p>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Hasil Generasi</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-3">Judul Kreatif:</h2>
                <ol className="list-decimal list-inside space-y-1">
                  {result.titles.map((title, index) => (
                    <li key={index} className="text-sm">{title}</li>
                  ))}
                </ol>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3">Deskripsi Produk:</h2>
                <div className="space-y-4">
                  {formatDescription(result.description)}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Hasil akan muncul di sini setelah Anda menghasilkan deskripsi.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
