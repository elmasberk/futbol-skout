# Futbol Skout — Deploy Rehberi

## İçindekiler
1. Web (Vercel) — En kolay, önce bunu yap
2. Gerçek Veri (soccerdata)
3. Mobil App (iOS & Android) — Capacitor
4. App Store & Google Play yayınlama

---

## 1 — Web Deploy (Vercel)

### Gereksinimler
- Node.js 18+ → https://nodejs.org
- Git → https://git-scm.com
- GitHub hesabı → https://github.com
- Vercel hesabı → https://vercel.com (GitHub ile ücretsiz kayıt)

### Adımlar

```bash
# 1. Projeyi kur
cd futbol-app
npm install

# 2. Çalışıyor mu test et
npm run dev
# → http://localhost:3000 aç, gözden geçir

# 3. GitHub reposu oluştur (github.com'da New Repository)
git init
git add .
git commit -m "ilk commit"
git remote add origin https://github.com/KULLANICI_ADIN/futbol-skout.git
git push -u origin main

# 4. Vercel'e git → "Add New Project" → GitHub reposunu seç
# → Framework: Next.js (otomatik algılar)
# → Deploy butonuna bas
```

**Sonuç:** 2 dakikada `https://futbol-skout.vercel.app` gibi bir URL alırsın.
Custom domain eklemek istersen Vercel panelinde "Domains" bölümü.

---

## 2 — Gerçek Veri (soccerdata)

### Kurulum

```bash
pip install soccerdata pandas
```

### Normal kullanım (WhoScored)

```bash
python scripts/fetch_data.py
```

Başarılı olursa `data/players.json` güncellenir (~500-2000 oyuncu gelir).

### WhoScored bot bloğu yiyorsan (Kaggle alternatifi)

1. https://www.kaggle.com/datasets/vivovinco/football-player-stats adresine git
2. "Download" butonuyla `stats.csv` indir
3. Dosyayı `scripts/` klasörüne koy
4. Çalıştır:

```bash
python scripts/fetch_data.py --kaggle
```

### Vercel'de otomatik güncelleme (GitHub Action)

`.github/workflows/update-data.yml` dosyası oluştur:

```yaml
name: Haftalık Veri Güncelleme
on:
  schedule:
    - cron: '0 3 * * 1'   # Her Pazartesi 03:00 UTC

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install soccerdata pandas
      - run: python scripts/fetch_data.py
      - name: Commit & push
        run: |
          git config user.email "action@github.com"
          git config user.name "GitHub Action"
          git add data/players.json
          git diff --staged --quiet || git commit -m "veri güncellendi"
          git push
```

Push edince Vercel otomatik yeniden deploy alır.

---

## 3 — Mobil App (Capacitor)

### Gereksinimler

**iOS için:**
- macOS bilgisayar (zorunlu — Apple şartı)
- Xcode → App Store'dan ücretsiz indir
- Apple Developer hesabı → https://developer.apple.com ($99/yıl)
- iPhone veya simulator

**Android için:**
- Windows, macOS veya Linux (farklı OS olabilir)
- Android Studio → https://developer.android.com/studio (ücretsiz)
- Android Developer hesabı → https://play.google.com/console ($25 bir kerelik)
- Android telefon veya emulator

### Kurulum

```bash
cd futbol-app
npm install

# Capacitor başlat (ilk kez)
npx cap init "Futbol Skout" "com.futbolskout.app" --web-dir out

# Platform ekle
npx cap add ios
npx cap add android
```

### Her güncellemede

```bash
# Web uygulamasını build et
npm run build
# → /out klasörü oluşur (statik dosyalar)

# Capacitor'a kopyala
npx cap sync
```

### iOS'ta test et

```bash
npx cap open ios
# → Xcode açılır
# → Sol üstten hedef cihazı seç (iPhone 15 Simulator)
# → ▶ Run butonuna bas
```

### Android'de test et

```bash
npx cap open android
# → Android Studio açılır
# → "Run app" butonuna bas (▶)
# → Emulator veya bağlı telefon seç
```

---

## 4 — App Store & Google Play Yayınlama

### App Store (iOS)

**Hazırlık:**
1. https://developer.apple.com → Certificates, IDs & Profiles
2. App ID oluştur: `com.futbolskout.app`
3. Distribution Certificate oluştur
4. App Store Connect'te yeni uygulama oluştur: https://appstoreconnect.apple.com

**Xcode'da:**
1. `Product → Archive` ile build al
2. `Distribute App → App Store Connect → Upload`
3. App Store Connect'te build'i seç, test uçuşu için TestFlight'a gönder
4. Gözden geçir, ardından "Submit for Review"

**İnceleme süresi:** Genellikle 1-3 gün.

---

### Google Play (Android)

**Hazırlık:**
1. https://play.google.com/console → Yeni uygulama oluştur
2. Paket adı: `com.futbolskout.app`

**Android Studio'da:**
1. `Build → Generate Signed Bundle / APK`
2. `Android App Bundle (AAB)` seç
3. Keystore oluştur (ilk kez) veya mevcut olanı kullan — ÖNEMLİ: Keystore dosyasını kaybetme, bir daha yayınlayamazsın
4. Build al → `.aab` dosyası oluşur

**Play Console'da:**
1. `Production → Create new release`
2. AAB dosyasını yükle
3. Release notes yaz (Türkçe + İngilizce)
4. "Review release" → "Start rollout"

**İnceleme süresi:** İlk sürüm 2-7 gün, sonraki güncellemeler genellikle birkaç saat.

---

## Özet Tablo

| Hedef | Süre | Maliyet | Zorluk |
|---|---|---|---|
| Vercel web deploy | 15 dakika | Ücretsiz | ⭐ Kolay |
| soccerdata kurulum | 30 dakika | Ücretsiz | ⭐⭐ Orta |
| Android APK test | 1-2 saat | Ücretsiz | ⭐⭐ Orta |
| Google Play yayın | 2-3 saat + bekleme | $25 (bir kez) | ⭐⭐⭐ Zor |
| App Store yayın | 3-5 saat + bekleme | $99/yıl | ⭐⭐⭐⭐ En zor |

## Önerilen Sıra

1. `npm run dev` ile lokalde test et ✓
2. Vercel'e deploy et, linki paylaş
3. soccerdata ile gerçek veri çek
4. Android APK oluştur, telefonunda test et
5. Google Play'e gönder
6. iOS (Mac gerekiyorsa bu en sona)

---

*Futbol Skout · Hobi Projesi*
