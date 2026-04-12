import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Futbol Skout — Oyuncu Analiz & Alternatif Platformu',
  description: 'Oyuncuları karşılaştır, pozisyona göre en uygun alternatifleri keşfet.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <nav className="bg-green-900 text-white px-6 py-4 flex items-center gap-3 shadow-lg">
          <span className="text-2xl">⚽</span>
          <span className="font-bold text-xl tracking-tight">Futbol Skout</span>
          <span className="ml-2 text-green-400 text-sm font-medium">Beta</span>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-100 mt-16 py-8">
          <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
            <div className="text-gray-700 font-semibold">⚽ Futbol Skout</div>
            <div className="text-gray-400 text-sm">
              Veriler <span className="font-medium text-gray-600">2024/25 sezonu</span>na aittir · Her hafta Pazartesi güncellenir
            </div>
            <div className="text-gray-400 text-xs">
              Kaynak: FBref · Kaggle · Top 5 Lig (Premier Lig, La Liga, Bundesliga, Serie A, Ligue 1)
            </div>
            <div className="text-gray-300 text-xs">Hobi projesi · Ticari amaç taşımaz</div>
          </div>
        </footer>
      </body>
    </html>
  )
}
