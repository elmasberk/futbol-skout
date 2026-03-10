'use client'

import { type Player, POZISYON_ETIKETI } from '../lib/oneri-motoru'

interface Props {
  oyuncu: Player
  vurgulu?: boolean
  secili?: boolean
  onClick?: () => void
}

const pozRenk: Record<string, string> = {
  ST: 'bg-green-100 text-green-700',
  LW: 'bg-blue-100 text-blue-700',
  RW: 'bg-orange-100 text-orange-700',
  CAM: 'bg-purple-100 text-purple-700',
  CM: 'bg-purple-100 text-purple-700',
  CDM: 'bg-gray-100 text-gray-700',
  LB: 'bg-red-100 text-red-700',
  RB: 'bg-red-100 text-red-700',
  CB: 'bg-red-100 text-red-700',
  GK: 'bg-sky-100 text-sky-700',
}

export default function OyuncuKarti({ oyuncu, vurgulu, secili, onClick }: Props) {
  const renkSinifi = pozRenk[oyuncu.pozisyon] || 'bg-gray-100 text-gray-700'

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border-2 p-4 transition-all ${
        vurgulu ? 'border-green-500 shadow-md' :
        secili ? 'border-blue-500 shadow-md' :
        onClick ? 'border-gray-100 hover:border-blue-300 cursor-pointer hover:shadow-md' :
        'border-gray-100'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <img
          src={oyuncu.resim}
          alt={oyuncu.isim}
          className="w-12 h-12 rounded-full border-2 border-gray-100"
        />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 truncate">{oyuncu.isim}</div>
          <div className="text-xs text-gray-500 truncate">{oyuncu.takim} · {oyuncu.lig}</div>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${renkSinifi}`}>
          {oyuncu.pozisyon}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'Gol', val: oyuncu.gol },
          { label: 'Asist', val: oyuncu.asist },
          { label: 'Maç', val: oyuncu.mac },
          { label: 'Yaş', val: oyuncu.yas },
        ].map(({ label, val }) => (
          <div key={label} className="bg-gray-50 rounded-lg py-2">
            <div className="font-bold text-gray-800 text-sm">{val}</div>
            <div className="text-gray-400 text-xs">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Pas %', val: oyuncu.pasBasarisi },
          { label: 'Dribling', val: oyuncu.dribling },
          { label: 'Değer M€', val: oyuncu.transferDegeri },
        ].map(({ label, val }) => (
          <div key={label} className="text-xs">
            <div className="h-1.5 bg-gray-100 rounded-full mb-1">
              <div
                className="h-1.5 bg-green-400 rounded-full"
                style={{ width: `${Math.min(100, val)}%` }}
              />
            </div>
            <span className="text-gray-500">{label}: </span>
            <span className="font-semibold text-gray-700">{val}</span>
          </div>
        ))}
      </div>

      {onClick && (
        <div className="mt-3 text-center">
          <span className="text-xs text-blue-500 font-medium">
            {secili ? '✓ Karşılaştırılıyor' : 'Karşılaştır →'}
          </span>
        </div>
      )}
    </div>
  )
}
