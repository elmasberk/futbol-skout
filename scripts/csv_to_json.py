"""
top5-players.csv → data/players.json dönüştürücü
Çalıştırma: python scripts/csv_to_json.py
"""

import csv
import json
import os
from collections import Counter

CSV_DOSYA = os.path.join(os.path.dirname(__file__), "top5-players.csv")
CIKTI = os.path.join(os.path.dirname(__file__), "..", "data", "players.json")

DF_DONGU = ["CB", "CB", "LB", "RB"]
FW_DONGU = ["ST", "ST", "LW", "RW"]

POZISYON_MAP = {
    "GK": "GK",
    "DF,MF": "CDM", "DF,FW": "LB",
    "MF": "CM", "MF,DF": "CDM", "MF,FW": "CAM",
    "FW,MF": "CAM", "FW,DF": "RW",
}

LIG_MAP = {
    "eng Premier League": "Premier Lig",
    "de Bundesliga": "Bundesliga",
    "es La Liga": "La Liga",
    "it Serie A": "Serie A",
    "fr Ligue 1": "Ligue 1",
}

POZ_RENK = {
    "GK": "0ea5e9", "CB": "ef4444", "LB": "ef4444", "RB": "ef4444",
    "CDM": "6b7280", "CM": "8b5cf6", "CAM": "8b5cf6",
    "LW": "3b82f6", "RW": "f97316", "ST": "22c55e",
}

def temizle(val, tip=float, varsayilan=0):
    try:
        return tip(val)
    except:
        return varsayilan

def avatar(isim, poz):
    seed = "".join([c for c in isim if c.isalpha()])[:4].upper()
    renk = POZ_RENK.get(poz, "22c55e")
    return f"https://api.dicebear.com/7.x/initials/svg?seed={seed}&backgroundColor={renk}"

def ulke_temizle(nation):
    ulke_map = {
        "ENG": "İngiltere", "ESP": "İspanya", "GER": "Almanya",
        "FRA": "Fransa", "ITA": "İtalya", "BRA": "Brezilya",
        "ARG": "Arjantin", "POR": "Portekiz", "NED": "Hollanda",
        "BEL": "Belçika", "NOR": "Norveç", "SWE": "İsveç",
        "DEN": "Danimarka", "SUI": "İsviçre", "TUR": "Türkiye",
        "COL": "Kolombiya", "ARG": "Arjantin", "URU": "Uruguay",
        "SEN": "Senegal", "MAR": "Fas", "CMR": "Kamerun",
        "SCO": "İskoçya", "WAL": "Galler", "IRL": "İrlanda",
    }
    for p in nation.strip().split():
        if p.upper() in ulke_map:
            return ulke_map[p.upper()]
    return nation.strip()

oyuncular = []
df_sayac = 0
fw_sayac = 0

with open(CSV_DOSYA, encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader):
        pos_raw = row.get("Pos", "MF")

        if pos_raw in POZISYON_MAP:
            poz = POZISYON_MAP[pos_raw]
        elif pos_raw == "DF":
            poz = DF_DONGU[df_sayac % len(DF_DONGU)]
            df_sayac += 1
        elif pos_raw == "FW":
            poz = FW_DONGU[fw_sayac % len(FW_DONGU)]
            fw_sayac += 1
        else:
            poz = "CM"

        mac = temizle(row.get("MP", 0), int)
        if mac < 5:
            continue

        isim = row.get("Player", f"Oyuncu {i}")
        lig = LIG_MAP.get(row.get("Comp", ""), row.get("Comp", ""))
        pas_tahmini = min(95, max(55, 75 + temizle(row.get("PrgP", 0)) * 0.3))
        dribling = min(95, max(30, 40 + temizle(row.get("PrgC", 0)) * 0.5))
        top_kazanma = min(80, max(10, 20 + temizle(row.get("PrgP", 0)) * 0.2))
        yas = temizle(str(row.get("Age", "25")).split("-")[0], int, 25)

        oyuncular.append({
            "id": i + 1,
            "isim": isim,
            "takim": row.get("Squad", "Bilinmiyor"),
            "lig": lig,
            "pozisyon": poz,
            "yas": yas,
            "uyruk": ulke_temizle(row.get("Nation", "")),
            "gol": temizle(row.get("Gls", 0), int),
            "asist": temizle(row.get("Ast", 0), int),
            "mac": mac,
            "dakika": temizle(row.get("Min", 0), int),
            "pasBasarisi": round(pas_tahmini, 1),
            "dribling": round(dribling, 1),
            "topKazanma": round(top_kazanma, 1),
            "havaTopu": round(min(90, max(20, 50 + temizle(row.get("PrgR", 0)) * 0.1)), 1),
            "sutsayisi": temizle(row.get("Gls", 0), int) * 5 + 10,
            "sariKart": temizle(row.get("CrdY", 0), int),
            "kirmKart": temizle(row.get("CrdR", 0), int),
            "transferDegeri": 0,
            "sozlesmeBitis": 2026,
            "resim": avatar(isim, poz),
        })

cikti_yolu = os.path.normpath(CIKTI)
with open(cikti_yolu, "w", encoding="utf-8") as f:
    json.dump(oyuncular, f, ensure_ascii=False, indent=2)

poz_dagilim = Counter(o["pozisyon"] for o in oyuncular)
print(f"\n✅ {len(oyuncular)} oyuncu → {cikti_yolu}")
print("\nPozisyon dağılımı:")
for poz, sayi in sorted(poz_dagilim.items()):
    print(f"  {poz}: {sayi}")
