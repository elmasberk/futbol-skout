"""
Futbol Skout — Gerçek Veri Çekme Scripti
=========================================
Kurulum:
    pip install soccerdata pandas

Çalıştırma:
    python scripts/fetch_data.py

Bu script soccerdata kütüphanesi üzerinden WhoScored'dan
oyuncu istatistiklerini çeker ve data/players.json dosyasını günceller.

NOT: WhoScored bazen bot koruması uygular. Hata alırsan aşağıdaki
     "Alternatif Kaynak" bölümüne bak.
"""

import json
import os
import sys

# ── Bağımlılık Kontrolü ────────────────────────────────────────────────────────
try:
    import soccerdata as sd
    import pandas as pd
except ImportError:
    print("❌ Eksik paket. Çalıştır: pip install soccerdata pandas")
    sys.exit(1)

# ── Ayarlar ───────────────────────────────────────────────────────────────────
LIGLER = [
    "ENG-Premier League",
    "ESP-La Liga",
    "GER-Bundesliga",
    "ITA-Serie A",
    "FRA-Ligue 1",
]
SEZON = "2324"          # 2023-24 sezonu. Güncel sezon için "2425"
CIKTI_DOSYA = os.path.join(os.path.dirname(__file__), "..", "data", "players.json")

# Pozisyon eşleme: WhoScored → uygulamamız
POZISYON_MAP = {
    "GK": "GK",
    "DC": "CB", "DL": "LB", "DR": "RB",
    "DMC": "CDM", "MC": "CM", "AMC": "CAM",
    "AML": "LW", "AMR": "RW",
    "FW": "ST", "FWL": "LW", "FWR": "RW",
}

def pozisyon_cevir(raw: str) -> str:
    """WhoScored pozisyon kodunu uygulama koduna çevirir."""
    if not raw:
        return "CM"
    ilk = raw.split(",")[0].strip()
    return POZISYON_MAP.get(ilk, "CM")

def avatar_url(isim: str, pozisyon: str) -> str:
    """Pozisyona göre renkli avatar URL üretir."""
    renkler = {
        "GK": "0ea5e9", "CB": "ef4444", "LB": "ef4444", "RB": "ef4444",
        "CDM": "6b7280", "CM": "8b5cf6", "CAM": "8b5cf6",
        "LW": "3b82f6", "RW": "f97316", "ST": "22c55e",
    }
    renk = renkler.get(pozisyon, "22c55e")
    seed = "".join([c for c in isim if c.isalpha()])[:4].upper()
    return f"https://api.dicebear.com/7.x/initials/svg?seed={seed}&backgroundColor={renk}"

# ── Ana Fonksiyon ──────────────────────────────────────────────────────────────
def veri_cek():
    print(f"📡 WhoScored'dan veri çekiliyor... (Sezon: {SEZON})")
    print(f"   Ligler: {', '.join(LIGLER)}\n")

    ws = sd.WhoScored(leagues=LIGLER, seasons=[SEZON])

    try:
        df = ws.read_player_season_stats()
    except Exception as e:
        print(f"❌ WhoScored hatası: {e}")
        print("\n💡 Alternatif: Kaggle verisini dene (aşağıya bak)")
        return []

    print(f"✅ {len(df)} kayıt alındı. İşleniyor...")

    df = df.reset_index()

    # Sütun adlarını normalize et
    df.columns = [c.lower().replace(" ", "_") for c in df.columns]

    oyuncular = []
    for i, row in df.iterrows():
        try:
            poz = pozisyon_cevir(str(row.get("position", "")))
            isim = str(row.get("player", f"Oyuncu {i}"))
            takim = str(row.get("team", "Bilinmiyor"))
            lig_raw = str(row.get("league", ""))

            # Lig adını kısalt
            lig_map = {
                "ENG-Premier League": "Premier Lig",
                "ESP-La Liga": "La Liga",
                "GER-Bundesliga": "Bundesliga",
                "ITA-Serie A": "Serie A",
                "FRA-Ligue 1": "Ligue 1",
            }
            lig = lig_map.get(lig_raw, lig_raw)

            oyuncu = {
                "id": i + 1,
                "isim": isim,
                "takim": takim,
                "lig": lig,
                "pozisyon": poz,
                "yas": int(row.get("age", 25)),
                "uyruk": str(row.get("nationality", "Bilinmiyor")),
                "gol": int(row.get("goals", 0)),
                "asist": int(row.get("assists", 0)),
                "mac": int(row.get("apps", 0)),
                "dakika": int(row.get("mins_played", 0)),
                "pasBasarisi": round(float(row.get("pass_success", 75)), 1),
                "dribling": round(float(row.get("dribbles_per_90", 1)) * 20, 1),  # normalize
                "topKazanma": round(float(row.get("tackles_per_90", 2)) * 15, 1),
                "havaTopu": round(float(row.get("aerial_won_per_90", 1)) * 30, 1),
                "sutsayisi": int(row.get("shots_per_90", 1) * int(row.get("apps", 0))),
                "sariKart": int(row.get("yellow_cards", 0)),
                "kirmKart": int(row.get("red_cards", 0)),
                "transferDegeri": 0,      # WhoScored'da yok, Transfermarkt'tan ayrıca çekilebilir
                "sozlesmeBitis": 2026,    # Manuel güncellenebilir
                "resim": avatar_url(isim, poz),
            }
            oyuncular.append(oyuncu)

        except Exception as e:
            continue  # Hatalı satırı atla

    return oyuncular


def kaggle_alternatif():
    """
    Alternatif: Kaggle'dan indirilen CSV dosyasını kullan.

    1. https://www.kaggle.com/datasets/vivovinco/football-player-stats adresine git
    2. 'stats.csv' dosyasını scripts/ klasörüne koy
    3. Bu fonksiyonu çağır: python scripts/fetch_data.py --kaggle
    """
    try:
        import pandas as pd
    except ImportError:
        print("pip install pandas")
        return []

    csv_yolu = os.path.join(os.path.dirname(__file__), "stats.csv")
    if not os.path.exists(csv_yolu):
        print(f"❌ Dosya bulunamadı: {csv_yolu}")
        print("   Kaggle'dan stats.csv'yi scripts/ klasörüne koy.")
        return []

    df = pd.read_csv(csv_yolu, sep=";", encoding="utf-8")
    print(f"✅ Kaggle'dan {len(df)} kayıt okundu.")

    oyuncular = []
    for i, row in df.iterrows():
        poz_raw = str(row.get("Pos", "MF"))
        # Kaggle'da pozisyon: GK, DF, MF, FW
        poz_map = {"GK": "GK", "DF": "CB", "MF": "CM", "FW": "ST",
                   "DF,MF": "CDM", "MF,FW": "CAM", "FW,MF": "RW"}
        poz = poz_map.get(poz_raw.split(",")[0], "CM")

        isim = str(row.get("Player", f"Oyuncu {i}"))
        oyuncu = {
            "id": i + 1,
            "isim": isim,
            "takim": str(row.get("Squad", "Bilinmiyor")),
            "lig": str(row.get("Comp", "Bilinmiyor")),
            "pozisyon": poz,
            "yas": int(str(row.get("Age", "25")).split("-")[0]),
            "uyruk": str(row.get("Nation", "")).replace("eng ", "").title(),
            "gol": int(row.get("Gls", 0)),
            "asist": int(row.get("Ast", 0)),
            "mac": int(row.get("MP", 0)),
            "dakika": int(row.get("Min", 0)),
            "pasBasarisi": round(float(row.get("Cmp%", 75)), 1),
            "dribling": round(float(row.get("Succ", 1)) * 10, 1),
            "topKazanma": round(float(row.get("TklW", 2)) * 5, 1),
            "havaTopu": round(float(row.get("Won%", 50)), 1),
            "sutsayisi": int(row.get("Sh", 0)),
            "sariKart": int(row.get("CrdY", 0)),
            "kirmKart": int(row.get("CrdR", 0)),
            "transferDegeri": 0,
            "sozlesmeBitis": 2026,
            "resim": avatar_url(isim, poz),
        }
        oyuncular.append(oyuncu)

    return oyuncular


# ── Çalıştır ───────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    kaggle_modu = "--kaggle" in sys.argv

    if kaggle_modu:
        print("📂 Kaggle modu aktif")
        oyuncular = kaggle_alternatif()
    else:
        oyuncular = veri_cek()

    if not oyuncular:
        print("❌ Veri alınamadı. Mevcut players.json korunuyor.")
        sys.exit(1)

    # Minimum maç filtresi (çok az oynayan oyuncuları çıkar)
    oyuncular = [o for o in oyuncular if o["mac"] >= 5]
    print(f"🔍 Filtreleme sonrası: {len(oyuncular)} oyuncu")

    cikti_yolu = os.path.normpath(CIKTI_DOSYA)
    with open(cikti_yolu, "w", encoding="utf-8") as f:
        json.dump(oyuncular, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Tamamlandı! {len(oyuncular)} oyuncu → {cikti_yolu}")
    print("   Uygulamayı yeniden başlat: npm run dev")
