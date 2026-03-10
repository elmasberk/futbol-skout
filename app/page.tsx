'use client'

import { useState } from 'react'
import { tumOyuncular, POZISYONLAR, POZISYON_ETIKETI, alternatifBul, radarVerisi, type Player } from '../lib/oneri-motoru'
import OyuncuKarti from '../components/OyuncuKarti'
import RadarGrafik from '../components/RadarGrafik'

export default function Home() {
  const [seciliPozisyon, setSeciliPozisyon] = useState<string>('')
  const [seciliOyuncu, setSeciliOyuncu] = useState<Player | null>(null)
  const [alternatifler, setAlternatifler] = useState<Player[]>([])
  const [karsilastirilan, setKarsilastirilan] = useState<Player | null>(null)

  const pozisyondakiOyuncular = seciliPozisyon
    ? tumOyuncular.filter(p => p.pozisyon === seciliPozisyon)
    : []

  function oyuncuSec(oyuncu: Player) {
    setSeciliOyuncu(oyuncu)
    setAlternatifler(alternatifBul(oyuncu.id))
    setKarsilastirilan(null)
  }

  const pozRenk: Record<string, string> = {
    ST: 'bg-green-100 border-green-400 text-green-800',
    LW: 'bg-blue-100 border-blue-400 text-blue-800',
    RW: 'bg-orange-100 border-orange-400 text-orange-800',
    CAM: 'bg-purple-100 border-purple-400 text-purple-800',
    CM: 'bg-purple-100 border-purple-400 text-purple-800',
    CDM: 'bg-gray-100 border-gray-400 text-gray-800',
    LB: 'bg-red-100 border-red-400 text-red-800',
    RB: 'bg-red-100 border-red-400 text-red-800',
    CB: 'bg-red-100 border-red-400 text-red-800',
    GK: 'bg-sky-100 border-sky-400 text-sky-800',
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

      {/* Adım 1: Pozisyon Seç */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          1 — Pozisyon Seç
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

      {/* Adım 2: Oyuncu Seç */}
      {seciliPozisyon && pozisyondakiOyuncular.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            2 — {POZISYON_ETIKETI[seciliPozisyon]} Oyuncusu Seç ({pozisyondakiOyuncular.length} oyuncu)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {pozisyondakiOyuncular.map(oyuncu => (
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
          </div>
        </div>
      )}

      {seciliPozisyon && pozisyondakiOyuncular.length === 0 && (
        <div className="bg-yellow-50 rounded-xl p-4 text-yellow-700 text-sm">
          Bu pozisyonda henüz veri yok. Yakında ekleniyor.
        </div>
      )}

      {/* Seçili Oyuncu Detayı + Alternatifler */}
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

          {/* Alternatifler */}
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

          {/* Karşılaştırma */}
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
                      { label: 'Değer (M€)', a: seciliOyuncu.transferDegeri, b: karsilastirilan.transferDegeri },
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
