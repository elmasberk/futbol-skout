'use client'

import { useState, useMemo } from 'react'
import { tumOyuncular, POZISYONLAR, POZISYON_ETIKETI, alternatifBul, radarVerisi, type Player } from '../lib/oneri-motoru'
import OyuncuKarti from '../components/OyuncuKarti'
import RadarGrafik from '../components/RadarGrafik'

export default function Home() {
  const [seciliPozisyon, setSeciliPozisyon] = useState<string>('')
  const [seciliOyuncu, setSeciliOyuncu] = useState<Player | null>(null)
  const [alternatifler, setAlternatifler] = useState<Player[]>([])
  const [karsilastirilan, setKarsilastirilan] = useState<Player | null>(null)
  const [aramaMetni, setAramaMetni] = useState<string>('')

  const aramaOyunculari = useMemo(() => {
    if (aramaMetni.length < 2) return []
    const kucuk = aramaMetni.toLowerCase()
    return tumOyuncular
      .filter(p =>
        p.isim.toLowerCase().includes(kucuk) ||
        p.takim.toLowerCase().includes(kucuk) ||
        p.uyruk.toLowerCase().includes(kucuk)
      )
      .slice(0, 8)
  }, [aramaMetni])

  const pozisyondakiOyuncular = seciliPozisyon
    ? tumOyuncular.filter(p => p.pozisyon === seciliPozisyon)
    : []

  function oyuncuSec(oyuncu: Player) {
    setSeciliOyuncu(oyuncu)
    setAlternatifler(alternatifBul(oyuncu.id))
    setKarsilastirilan(null)
    setAramaMetni('')
    setSeciliPozisyon(oyuncu.pozisyon)
  }

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-green-900 mb-3">
          Pozisyon Bazlı Oyuncu Analizi
        </h1>
        <p className="text-gray-500 text-lg">
          Bir pozisyon seç → Oyuncu belirle → Benzer profilli alternatifleri keşfet
        </p>
      </div>

      {/* Arama Çubuğu */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          🔍 Oyuncu Ara
        </h2>
        <div className="relative">
          <input
            type="text"
            value={aramaMetni}
            onChange={e => setAramaMetni(e.target.value)}
            placeholder="Oyuncu adı, takım veya ülke yaz... (ör: Haaland, Arsenal, Brezilya)"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none text-gray-800 text-sm"
          />
          {aramaMetni && (
            <button
              onClick={() => setAramaMetni('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-lg"
            >
              ✕
            </button>
          )}
          {aramaOyunculari.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
              {aramaOyunculari.map(oyuncu => (
                <button
                  key={oyuncu.id}
                  onClick={() => oyuncuSec(oyuncu)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left border-b border-gray-50 last:border-0"
                >
                  <img src={oyuncu.resim} alt={oyuncu.isim} className="w-9 h-9 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-800">{oyuncu.isim}</div>
                    <div className="text-xs text-gray-400">{oyuncu.takim} · {oyuncu.lig}</div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">
                    {oyuncu.pozisyon}
                  </span>
                </button>
              ))}
            </div>
          )}
          {aramaMetni.length >= 2 && aramaOyunculari.length === 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-xl border border-gray-100 shadow-lg px-4 py-3 text-sm text-gray-400">
              Sonuç bulunamadı.
            </div>
          )}
        </div>
      </div>

      {/* Pozisyon Seç */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          1 — Pozisyona Göre Tara
        </h2>
        <div className="flex flex-wrap gap-2">
          {POZISYONLAR.map(poz => (
            <button
              key={poz}
              onClick={() => { setSeciliPozisyon(poz); setSeciliOyuncu(null); setAlternatifler([]) }}
              className={`px-4 py-2 rounded-xl border-2 font-semibold text-sm transition-all ${
                seciliPozisyon === poz
                  ? 'bg-green-600 border-green-600 text-white shadow-md scale-105'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'
              }`}
            >
              {poz} <span className="font-normal opacity-70 text-xs">· {POZISYON_ETIKETI[poz]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Oyuncu Listesi */}
      {seciliPozisyon && pozisyondakiOyuncular.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            2 — {POZISYON_ETIKETI[seciliPozisyon]} Oyuncusu Seç ({pozisyondakiOyuncular.length} oyuncu)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {pozisyondakiOyuncular.slice(0, 30).map(oyuncu => (
              <button
                key={oyuncu.id}
                onClick={() => oyuncuSec(oyuncu)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                  seciliOyuncu?.id === oyuncu.id
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-100 bg-gray-50 hover:border-green-300'
                }`}
              >
                <img src={oyuncu.resim} alt={oyuncu.isim} className="w-10 h-10 rounded-full" />
                <div>
                  <div className="font-semibold text-sm text-gray-800">{oyuncu.isim}</div>
                  <div className="text-xs text-gray-500">{oyuncu.takim} · {oyuncu.lig}</div>
                </div>
              </button>
            ))}
            {pozisyondakiOyuncular.length > 30 && (
              <div className="flex items-center justify-center p-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400">
                +{pozisyondakiOyuncular.length - 30} daha · Aramayı kullan
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seçili Oyuncu */}
      {seciliOyuncu && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                3 — Seçilen Oyuncu
              </h2>
              <OyuncuKarti oyuncu={seciliOyuncu} vurgulu />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                İstatistik Profili
              </h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-64">
                <RadarGrafik veri={radarVerisi(seciliOyuncu)} renk="#16a34a" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
              4 — Benzer Profilli Alternatifler
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Gol, asist, pas başarısı ve dribling istatistiklerine göre sıralanmıştır.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {alternatifler.map(alt => (
                <div key={alt.id}>
                  <OyuncuKarti
                    oyuncu={alt}
                    onClick={() => setKarsilastirilan(karsilastirilan?.id === alt.id ? null : alt)}
                    secili={karsilastirilan?.id === alt.id}
                  />
                </div>
              ))}
            </div>
          </div>

          {karsilastirilan && (
            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Karşılaştırma — {seciliOyuncu.isim} vs {karsilastirilan.isim}
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-center text-sm font-semibold text-green-700 mb-2">{seciliOyuncu.isim}</p>
                  <div className="h-64">
                    <RadarGrafik veri={radarVerisi(seciliOyuncu)} renk="#16a34a" />
                  </div>
                </div>
                <div>
                  <p className="text-center text-sm font-semibold text-blue-600 mb-2">{karsilastirilan.isim}</p>
                  <div className="h-64">
                    <RadarGrafik veri={radarVerisi(karsilastirilan)} renk="#2563eb" />
                  </div>
                </div>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-500 font-medium">İstatistik</th>
                      <th className="text-right py-2 text-green-700 font-semibold">{seciliOyuncu.isim.split(' ').pop()}</th>
                      <th className="text-right py-2 text-blue-600 font-semibold">{karsilastirilan.isim.split(' ').pop()}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Gol', a: seciliOyuncu.gol, b: karsilastirilan.gol },
                      { label: 'Asist', a: seciliOyuncu.asist, b: karsilastirilan.asist },
                      { label: 'Maç', a: seciliOyuncu.mac, b: karsilastirilan.mac },
                      { label: 'Pas %', a: seciliOyuncu.pasBasarisi, b: karsilastirilan.pasBasarisi },
                      { label: 'Dribling', a: seciliOyuncu.dribling, b: karsilastirilan.dribling },
                      { label: 'Yaş', a: seciliOyuncu.yas, b: karsilastirilan.yas },
                    ].map(({ label, a, b }) => (
                      <tr key={label} className="border-b border-gray-50">
                        <td className="py-2 text-gray-600">{label}</td>
                        <td className={`text-right py-2 font-medium ${a >= b ? 'text-green-600' : 'text-gray-400'}`}>{a}</td>
                        <td className={`text-right py-2 font-medium ${b >= a ? 'text-blue-600' : 'text-gray-400'}`}>{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
