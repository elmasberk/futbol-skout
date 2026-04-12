'use client'

import { useState, useMemo } from 'react'
import { tumOyuncular, POZISYON_ETIKETI, alternatifBul, radarVerisi, type Player } from '../lib/oneri-motoru'
import OyuncuKarti from '../components/OyuncuKarti'
import RadarGrafik from '../components/RadarGrafik'

const FORMASYON_SIRASI: Record<string, number> = {
  GK: 1, LB: 2, CB: 3, RB: 4, CDM: 5, CM: 6, CAM: 7, LW: 8, RW: 9, ST: 10,
}
const POZ_RENK: Record<string, string> = {
  GK: 'bg-sky-100 text-sky-700',
  CB: 'bg-red-100 text-red-700', LB: 'bg-red-100 text-red-700', RB: 'bg-red-100 text-red-700',
  CDM: 'bg-gray-100 text-gray-700', CM: 'bg-purple-100 text-purple-700', CAM: 'bg-purple-100 text-purple-700',
  LW: 'bg-blue-100 text-blue-700', RW: 'bg-orange-100 text-orange-700', ST: 'bg-green-100 text-green-700',
}

export default function Home() {
  const [aramaMetni, setAramaMetni] = useState('')
  const [seciliTakim, setSeciliTakim] = useState<string | null>(null)
  const [seciliOyuncu, setSeciliOyuncu] = useState<Player | null>(null)
  const [alternatifler, setAlternatifler] = useState<Player[]>([])
  const [karsilastirilan, setKarsilastirilan] = useState<Player | null>(null)

  const aramaOyunculari = useMemo(() => {
    if (aramaMetni.length < 2) return []
    const k = aramaMetni.toLowerCase()
    return tumOyuncular.filter(p => p.isim.toLowerCase().includes(k) || p.uyruk.toLowerCase().includes(k)).slice(0, 6)
  }, [aramaMetni])

  const aramaTakimlari = useMemo(() => {
    if (aramaMetni.length < 2) return []
    const k = aramaMetni.toLowerCase()
    return Array.from(new Set(tumOyuncular.map(p => p.takim))).filter(t => t.toLowerCase().includes(k)).slice(0, 4)
  }, [aramaMetni])

  const tumSonuclar = [...aramaTakimlari.map(t => ({ tip: 'takim', deger: t })), ...aramaOyunculari.map(p => ({ tip: 'oyuncu', deger: p }))]

  const takimOyunculari = useMemo(() => {
    if (!seciliTakim) return []
    return tumOyuncular.filter(p => p.takim === seciliTakim)
      .sort((a, b) => (FORMASYON_SIRASI[a.pozisyon] || 99) - (FORMASYON_SIRASI[b.pozisyon] || 99))
  }, [seciliTakim])

  function takimSec(takim: string) {
    setSeciliTakim(takim); setSeciliOyuncu(null); setAlternatifler([]); setKarsilastirilan(null); setAramaMetni('')
  }

  function oyuncuSec(oyuncu: Player) {
    setSeciliOyuncu(oyuncu); setAlternatifler(alternatifBul(oyuncu.id)); setKarsilastirilan(null); setAramaMetni('')
    if (!seciliTakim) setSeciliTakim(oyuncu.takim)
  }

  const KARSILASTIRMA_SATIRLARI = seciliOyuncu && karsilastirilan ? [
    { label: 'Gol',          a: seciliOyuncu.gol,        b: karsilastirilan.gol },
    { label: 'Asist',        a: seciliOyuncu.asist,       b: karsilastirilan.asist },
    { label: 'xG',           a: seciliOyuncu.xG ?? 0,     b: karsilastirilan.xG ?? 0 },
    { label: 'xAG',          a: seciliOyuncu.xAG ?? 0,    b: karsilastirilan.xAG ?? 0 },
    { label: 'Gol/90',       a: seciliOyuncu.gls90 ?? 0,  b: karsilastirilan.gls90 ?? 0 },
    { label: 'Asist/90',     a: seciliOyuncu.ast90 ?? 0,  b: karsilastirilan.ast90 ?? 0 },
    { label: 'Pas İlerleme', a: seciliOyuncu.prgP ?? 0,   b: karsilastirilan.prgP ?? 0 },
    { label: 'Top Taşıma',   a: seciliOyuncu.prgC ?? 0,   b: karsilastirilan.prgC ?? 0 },
    { label: 'Alım',         a: seciliOyuncu.prgR ?? 0,   b: karsilastirilan.prgR ?? 0 },
    { label: 'Maç',          a: seciliOyuncu.mac,         b: karsilastirilan.mac },
    { label: 'Yaş',          a: seciliOyuncu.yas,         b: karsilastirilan.yas },
  ] : []

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-900 mb-2">Futbol Oyuncu Analizi</h1>
        <p className="text-gray-500">Takım veya oyuncu ara → Alternatifleri keşfet</p>
      </div>

      {/* Arama */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="relative">
          <input
            type="text" value={aramaMetni}
            onChange={e => setAramaMetni(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && aramaTakimlari.length > 0) takimSec(aramaTakimlari[0])
              if (e.key === 'Enter' && aramaTakimlari.length === 0 && aramaOyunculari.length > 0) oyuncuSec(aramaOyunculari[0])
            }}
            placeholder="Takım veya oyuncu ara... (ör: Arsenal, Haaland)"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none text-gray-800 text-sm"
          />
          {aramaMetni && <button onClick={() => setAramaMetni('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">✕</button>}

          {aramaMetni.length >= 2 && tumSonuclar.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
              {aramaTakimlari.length > 0 && <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">Takımlar</div>}
              {aramaTakimlari.map(takim => (
                <button key={takim} onClick={() => takimSec(takim)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left border-b border-gray-50">
                  <span className="text-xl">🏟️</span>
                  <div>
                    <div className="font-semibold text-sm text-gray-800">{takim}</div>
                    <div className="text-xs text-gray-400">
                      {tumOyuncular.find(p => p.takim === takim)?.lig} · {tumOyuncular.filter(p => p.takim === takim).length} oyuncu
                    </div>
                  </div>
                </button>
              ))}
              {aramaOyunculari.length > 0 && <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">Oyuncular</div>}
              {aramaOyunculari.map(oyuncu => (
                <button key={oyuncu.id} onClick={() => oyuncuSec(oyuncu as Player)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left border-b border-gray-50 last:border-0">
                  <img src={(oyuncu as Player).resim} alt={(oyuncu as Player).isim} className="w-9 h-9 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-800">{(oyuncu as Player).isim}</div>
                    <div className="text-xs text-gray-400">{(oyuncu as Player).takim} · {(oyuncu as Player).lig}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${POZ_RENK[(oyuncu as Player).pozisyon] || 'bg-gray-100 text-gray-600'}`}>
                    {(oyuncu as Player).pozisyon}
                  </span>
                </button>
              ))}
            </div>
          )}
          {aramaMetni.length >= 2 && tumSonuclar.length === 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-xl border border-gray-100 shadow-lg px-4 py-3 text-sm text-gray-400">Sonuç bulunamadı.</div>
          )}
        </div>
      </div>

      {/* Takım Sayfası */}
      {seciliTakim && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🏟️</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{seciliTakim}</h2>
              <p className="text-sm text-gray-400">{takimOyunculari[0]?.lig} · {takimOyunculari.length} oyuncu</p>
            </div>
            <button onClick={() => { setSeciliTakim(null); setSeciliOyuncu(null); setAlternatifler([]) }}
              className="ml-auto text-sm text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-1">✕ Kapat</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sol: Kadro */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Kadro — Formation Sırası</h3>
              <div className="space-y-1">
                {takimOyunculari.map(oyuncu => (
                  <button key={oyuncu.id} onClick={() => oyuncuSec(oyuncu)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                      seciliOyuncu?.id === oyuncu.id ? 'bg-green-50 border-2 border-green-400' : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg w-12 text-center ${POZ_RENK[oyuncu.pozisyon] || 'bg-gray-100 text-gray-600'}`}>
                      {oyuncu.pozisyon}
                    </span>
                    <img src={oyuncu.resim} alt={oyuncu.isim} className="w-8 h-8 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-800 truncate">{oyuncu.isim}</div>
                      <div className="text-xs text-gray-400">
                        {oyuncu.mac} maç · {oyuncu.gol}G · {oyuncu.asist}A · xG {oyuncu.xG ?? 0}
                      </div>
                    </div>
                    {seciliOyuncu?.id === oyuncu.id && <span className="text-green-500 text-xs font-medium">Seçili</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Sağ: Alternatifler */}
            <div>
              {!seciliOyuncu ? (
                <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400 h-full flex items-center justify-center">
                  <div>
                    <div className="text-4xl mb-3">👈</div>
                    <div className="font-medium">Soldaki listeden bir oyuncu seç</div>
                    <div className="text-sm mt-1">Benzer profilli alternatifler burada görünecek</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Seçilen Oyuncu</p>
                    <OyuncuKarti oyuncu={seciliOyuncu} vurgulu />
                    {/* xG / xAG / npxG bilgi satırı */}
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: 'xG', val: seciliOyuncu.xG ?? 0 },
                        { label: 'xAG', val: seciliOyuncu.xAG ?? 0 },
                        { label: 'Gol/90', val: seciliOyuncu.gls90 ?? 0 },
                      ].map(({ label, val }) => (
                        <div key={label} className="bg-green-50 rounded-xl py-2">
                          <div className="font-bold text-green-700 text-sm">{val}</div>
                          <div className="text-green-500 text-xs">{label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: 'PrgC', val: seciliOyuncu.prgC ?? 0 },
                        { label: 'PrgP', val: seciliOyuncu.prgP ?? 0 },
                        { label: 'PrgR', val: seciliOyuncu.prgR ?? 0 },
                      ].map(({ label, val }) => (
                        <div key={label} className="bg-gray-50 rounded-xl py-2">
                          <div className="font-bold text-gray-700 text-sm">{val}</div>
                          <div className="text-gray-400 text-xs">{label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="h-52 mt-3">
                      <RadarGrafik veri={radarVerisi(seciliOyuncu)} renk="#16a34a" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Benzer Profilli Alternatifler</p>
                    <div className="space-y-3">
                      {alternatifler.map(alt => (
                        <div key={alt.id}>
                          <OyuncuKarti oyuncu={alt}
                            onClick={() => setKarsilastirilan(karsilastirilan?.id === alt.id ? null : alt)}
                            secili={karsilastirilan?.id === alt.id} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {karsilastirilan && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Karşılaştırma</p>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="h-48">
                          <p className="text-center text-xs font-semibold text-green-700 mb-1">{seciliOyuncu.isim.split(' ').pop()}</p>
                          <RadarGrafik veri={radarVerisi(seciliOyuncu)} renk="#16a34a" />
                        </div>
                        <div className="h-48">
                          <p className="text-center text-xs font-semibold text-blue-600 mb-1">{karsilastirilan.isim.split(' ').pop()}</p>
                          <RadarGrafik veri={radarVerisi(karsilastirilan)} renk="#2563eb" />
                        </div>
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left py-1 text-gray-400 font-medium text-xs">İstatistik</th>
                            <th className="text-right py-1 text-green-700 font-semibold text-xs">{seciliOyuncu.isim.split(' ').pop()}</th>
                            <th className="text-right py-1 text-blue-600 font-semibold text-xs">{karsilastirilan.isim.split(' ').pop()}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {KARSILASTIRMA_SATIRLARI.map(({ label, a, b }) => (
                            <tr key={label} className="border-b border-gray-50">
                              <td className="py-1 text-gray-500 text-xs">{label}</td>
                              <td className={`text-right py-1 text-xs font-medium ${a >= b ? 'text-green-600' : 'text-gray-400'}`}>{a}</td>
                              <td className={`text-right py-1 text-xs font-medium ${b >= a ? 'text-blue-600' : 'text-gray-400'}`}>{b}</td>
                            </tr>
                          ))}
                          <tr className="border-b border-gray-50">
                            <td className="py-1 text-gray-500 text-xs">Transfer Değeri</td>
                            <td className={`text-right py-1 text-xs font-medium ${seciliOyuncu.transferDegeri > 0 ? (seciliOyuncu.transferDegeri >= karsilastirilan.transferDegeri ? 'text-green-600' : 'text-gray-400') : 'text-gray-300'}`}>
                              {seciliOyuncu.transferDegeri > 0 ? `€${seciliOyuncu.transferDegeri}M` : '—'}
                            </td>
                            <td className={`text-right py-1 text-xs font-medium ${karsilastirilan.transferDegeri > 0 ? (karsilastirilan.transferDegeri >= seciliOyuncu.transferDegeri ? 'text-blue-600' : 'text-gray-400') : 'text-gray-300'}`}>
                              {karsilastirilan.transferDegeri > 0 ? `€${karsilastirilan.transferDegeri}M` : '—'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!seciliTakim && (
        <div className="text-center py-20 text-gray-300">
          <div className="text-6xl mb-4">⚽</div>
          <div className="text-lg font-medium text-gray-400">Bir takım veya oyuncu ara</div>
          <div className="text-sm mt-1">Arsenal, Real Madrid, Haaland...</div>
        </div>
      )}
    </div>
  )
}
