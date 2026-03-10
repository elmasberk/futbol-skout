# ⚽ Futbol Skout

Pozisyon bazlı oyuncu analiz ve alternatif öneri platformu. Hobi projesi.

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcıda aç: http://localhost:3000

## Build & Deploy (Vercel)

```bash
npm run build

# Vercel deploy:
npx vercel
```

## Özellikler

- Pozisyon bazlı oyuncu filtreleme (ST, LW, RW, CAM, CM, CDM, LB, RB, CB, GK)
- Benzer profilli alternatif öneri (ağırlıklı benzerlik skoru)
- Radar chart ile istatistik görselleştirme
- Oyuncu karşılaştırma (yan yana tablo + radar)

## Veri Güncelleme

Oyuncu verisi `data/players.json` dosyasından okunur.
Yeni oyuncu eklemek için bu dosyaya JSON objesi ekle.

Gerçek veri için (kurulum gerektirir):
```bash
pip install soccerdata
python scripts/fetch_data.py
```

## Stack

- **Next.js 14** — SSR/SSG, SEO
- **Tailwind CSS** — Styling
- **Recharts** — Radar grafik
- **TypeScript** — Type safety

---
Hobi projesi · Minimum yatırım · Maksimum öğrenme
