"""
players.csv'deki transfer değerlerini data/players.json'a ekler.
İsim eşleştirmesi yapar.

Çalıştırma: python scripts/add_transfer_values.py
"""

import csv
import json
import os

PLAYERS_CSV = os.path.join(os.path.dirname(__file__), "players.csv")
JSON_DOSYA = os.path.join(os.path.dirname(__file__), "..", "data", "players.json")

# 1. Transfermarkt'tan isim → değer map'i oluştur
tm_degerler = {}
with open(PLAYERS_CSV, encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        isim = row.get("name", "").strip().lower()
        deger_raw = row.get("market_value_in_eur", "0")
        try:
            deger = int(float(deger_raw)) // 1_000_000  # EUR → Milyon EUR
        except:
            deger = 0
        if isim and deger > 0:
            tm_degerler[isim] = deger

print(f"📊 Transfermarkt'tan {len(tm_degerler)} oyuncu değeri yüklendi")

# 2. players.json'ı güncelle
with open(JSON_DOSYA, encoding="utf-8") as f:
    oyuncular = json.load(f)

eslesen = 0
for oyuncu in oyuncular:
    isim_kucuk = oyuncu["isim"].strip().lower()
    if isim_kucuk in tm_degerler:
        oyuncu["transferDegeri"] = tm_degerler[isim_kucuk]
        eslesen += 1

print(f"✅ {eslesen} / {len(oyuncular)} oyuncu eşleşti")
print(f"❌ {len(oyuncular) - eslesen} oyuncu eşleşmedi (isim farkı olabilir)")

with open(JSON_DOSYA, "w", encoding="utf-8") as f:
    json.dump(oyuncular, f, ensure_ascii=False, indent=2)

print(f"\n💾 Kaydedildi → {JSON_DOSYA}")

# Örnek eşleşenler
ornekler = [o for o in oyuncular if o["transferDegeri"] > 0][:5]
print("\nÖrnek eşleşmeler:")
for o in ornekler:
    print(f"  {o['isim']} → €{o['transferDegeri']}M")
