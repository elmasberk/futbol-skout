import players from '../data/players.json'

export type Player = {
  id: number; isim: string; takim: string; lig: string; pozisyon: string
  yas: number; uyruk: string; gol: number; asist: number; mac: number; dakika: number
  xG: number; xAG: number; npxG: number
  prgC: number; prgP: number; prgR: number
  gls90: number; ast90: number; xG90: number; xAG90: number
  pasBasarisi: number; dribling: number; topKazanma: number; havaTopu: number
  sutsayisi: number; sariKart: number; kirmKart: number
  transferDegeri: number; sozlesmeBitis: number; resim: string
}

export const tumOyuncular: Player[] = players as Player[]

export const POZISYONLAR = ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK']
export const POZISYON_ETIKETI: Record<string, string> = {
  ST: 'Santrafor', LW: 'Sol Kanat', RW: 'Sağ Kanat',
  CAM: 'Attacking Mid', CM: 'Orta Saha', CDM: 'Defansif Mid',
  LB: 'Sol Bek', RB: 'Sağ Bek', CB: 'Stoper', GK: 'Kaleci',
}

function benzerlikSkoru(hedef: Player, aday: Player): number {
  return (
    0.25 * Math.abs(hedef.gol - aday.gol) / 40 +
    0.15 * Math.abs(hedef.asist - aday.asist) / 20 +
    0.20 * Math.abs((hedef.xG || 0) - (aday.xG || 0)) / 30 +
    0.15 * Math.abs((hedef.xAG || 0) - (aday.xAG || 0)) / 15 +
    0.15 * Math.abs(hedef.pasBasarisi - aday.pasBasarisi) / 100 +
    0.05 * Math.abs(hedef.dribling - aday.dribling) / 100 +
    0.05 * Math.abs(hedef.yas - aday.yas) / 15
  )
}

export function alternatifBul(hedefId: number, limit = 5): Player[] {
  const hedef = tumOyuncular.find(p => p.id === hedefId)
  if (!hedef) return []
  return tumOyuncular
    .filter(p => p.id !== hedefId && p.pozisyon === hedef.pozisyon)
    .map(p => ({ oyuncu: p, skor: benzerlikSkoru(hedef, p) }))
    .sort((a, b) => a.skor - b.skor)
    .slice(0, limit)
    .map(x => x.oyuncu)
}

export function radarVerisi(oyuncu: Player) {
  return [
    { metrik: 'xG',           deger: Math.min(100, ((oyuncu.xG || 0) / 25) * 100) },
    { metrik: 'xAG',          deger: Math.min(100, ((oyuncu.xAG || 0) / 15) * 100) },
    { metrik: 'Pas İlerleme', deger: Math.min(100, ((oyuncu.prgP || 0) / 150) * 100) },
    { metrik: 'Top Taşıma',   deger: Math.min(100, ((oyuncu.prgC || 0) / 100) * 100) },
    { metrik: 'Alım',         deger: Math.min(100, ((oyuncu.prgR || 0) / 120) * 100) },
    { metrik: 'Gol/90',       deger: Math.min(100, ((oyuncu.gls90 || 0) / 1) * 100) },
  ]
}
