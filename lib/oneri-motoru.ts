import players from '../data/players.json'

export type Player = {
  id: number
  isim: string
  takim: string
  lig: string
  pozisyon: string
  yas: number
  uyruk: string
  gol: number
  asist: number
  mac: number
  dakika: number
  pasBasarisi: number
  dribling: number
  topKazanma: number
  havaTopu: number
  sutsayisi: number
  sariKart: number
  kirmKart: number
  transferDegeri: number
  sozlesmeBitis: number
  resim: string
}

export const tumOyuncular: Player[] = players as Player[]

export const POZISYONLAR = ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK']
export const POZISYON_ETIKETI: Record<string, string> = {
  ST: 'Santrafor',
  LW: 'Sol Kanat',
  RW: 'Sağ Kanat',
  CAM: 'Attacking Mid',
  CM: 'Orta Saha',
  CDM: 'Defansif Mid',
  LB: 'Sol Bek',
  RB: 'Sağ Bek',
  CB: 'Stoper',
  GK: 'Kaleci',
}

function normalize(val: number, min: number, max: number): number {
  if (max === min) return 0
  return (val - min) / (max - min)
}

function benzerlikSkoru(hedef: Player, aday: Player): number {
  const golFarki = Math.abs(hedef.gol - aday.gol) / 40
  const asistFarki = Math.abs(hedef.asist - aday.asist) / 20
  const pasiFarki = Math.abs(hedef.pasBasarisi - aday.pasBasarisi) / 100
  const dribFarki = Math.abs(hedef.dribling - aday.dribling) / 100
  const yasFarki = Math.abs(hedef.yas - aday.yas) / 15
  const topFarki = Math.abs(hedef.topKazanma - aday.topKazanma) / 80

  return (
    0.30 * golFarki +
    0.20 * asistFarki +
    0.20 * pasiFarki +
    0.15 * dribFarki +
    0.10 * yasFarki +
    0.05 * topFarki
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

export function pozisyonaGoreFiltrele(pozisyon: string): Player[] {
  return tumOyuncular.filter(p => p.pozisyon === pozisyon)
}

export function radarVerisi(oyuncu: Player) {
  return [
    { metrik: 'Gol', deger: Math.min(100, (oyuncu.gol / 40) * 100) },
    { metrik: 'Asist', deger: Math.min(100, (oyuncu.asist / 20) * 100) },
    { metrik: 'Pas %', deger: oyuncu.pasBasarisi },
    { metrik: 'Dribling', deger: oyuncu.dribling },
    { metrik: 'Top Kazanma', deger: Math.min(100, (oyuncu.topKazanma / 80) * 100) },
    { metrik: 'Hava Topu', deger: oyuncu.havaTopu },
  ]
}
