"""
top5-players.csv → data/players.json dönüştürücü
Çalıştırma: python scripts/csv_to_json.py
"""

import csv
import json
import os

CSV_DOSYA = os.path.join(os.path.dirname(__file__), "top5-players.csv")
CIKTI = os.path.join(os.path.dirname(__file__), "..", "data", "players.json")

POZISYON_MAP = {
    "GK": "GK",
    "DF": "CB", "DF,MF": "CDM", "DF,FW": "LB",
    "MF": "CM", "MF,DF": "CDM", "MF,FW": "CAM",
    "FW": "ST", "FW,MF": "RW", "FW,DF": "ST",
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
    # "eng ENG" → "İngiltere" gibi çevir
    ulke_map = {
        "ENG": "İngiltere", "ESP": "İspanya", "GER": "Almanya",
        "FRA": "Fransa", "ITA": "İtalya", "BRA": "Brezilya",
        "ARG": "Arjantin", "POR": "Portekiz", "NED": "Hollanda",
        "BEL": "Belçika", "NOR": "Norveç", "SWE": "İsveç",
        "DEN": "Danimarka", "SUI": "İsviçre", "AUT": "Avusturya",
        "POL": "Polonya", "CRO": "Hırvatistan", "SEN": "Senegal",
        "CIV": "Fildişi Sahili", "CMR": "Kamerun", "MAR": "Fas",
        "URU": "Uruguay", "COL": "Kolombiya", "MEX": "Meksika",
        "USA": "ABD", "TUR": "Türkiye", "GRE": "Yunanistan",
        "SCO": "İskoçya", "WAL": "Galler", "IRL": "İrlanda",
    }
    parcalar = nation.strip().split()
    for p in parcalar:
        if p.upper() in ulke_map:
            return ulke_map[p.upper()]
    return nation.strip()

oyuncular = []
with open(CSV_DOSYA, encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader):
        pos_raw = row.get("Pos", "MF").split(",")[0]
        poz = POZISYON_MAP.get(row.get("Pos", "MF"), POZISYON_MAP.get(pos_raw, "CM"))
        
        mac = temizle(row.get("MP", 0), int)
        if mac < 5:
            continue  # Az oynayan oyuncuları atla

        isim = row.get("Player", f"Oyuncu {i}")
        lig_raw = row.get("Comp", "")
        lig = LIG_MAP.get(lig_raw, lig_raw)

        # Pas başarısı CSV'de yok, xG bazlı tahmin
        pas_tahmini = min(95, max(55, 75 + temizle(row.get("PrgP", 0)) * 0.3))
        # Dribling: PrgC (progressive carries) bazlı
        dribling = min(95, max(30, 40 + temizle(row.get("PrgC", 0)) * 0.5))
        # Top kazanma tahmini
        top_kazanma = min(80, max(10, 20 + temizle(row.get("PrgP", 0)) * 0.2))

        yas_raw = str(row.get("Age", "25"))
        yas = temizle(yas_raw.split("-")[0], int, 25)

        oyuncu = {
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
        }
        oyuncular.append(oyuncu)

cikti_yolu = os.path.normpath(CIKTI)
with open(cikti_yolu, "w", encoding="utf-8") as f:
    json.dump(oyuncular, f, ensure_ascii=False, indent=2)

print(f"✅ {len(oyuncular)} oyuncu → {cikti_yolu}")
