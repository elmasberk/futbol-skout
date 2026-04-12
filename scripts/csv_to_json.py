import csv, json, os
from collections import Counter

CSV_DOSYA = os.path.join(os.path.dirname(__file__), "players_data-2024_2025.csv")
CIKTI = os.path.join(os.path.dirname(__file__), "..", "data", "players.json")

DF_DONGU = ["CB", "CB", "LB", "RB"]
FW_DONGU = ["ST", "ST", "LW", "RW"]
POZISYON_MAP = {
    "GK": "GK", "DF,MF": "CDM", "DF,FW": "LB",
    "MF": "CM", "MF,DF": "CDM", "MF,FW": "CAM",
    "FW,MF": "CAM", "FW,DF": "RW",
}
LIG_MAP = {
    "eng Premier League": "Premier Lig", "de Bundesliga": "Bundesliga",
    "es La Liga": "La Liga", "it Serie A": "Serie A", "fr Ligue 1": "Ligue 1",
}
POZ_RENK = {
    "GK": "0ea5e9", "CB": "ef4444", "LB": "ef4444", "RB": "ef4444",
    "CDM": "6b7280", "CM": "8b5cf6", "CAM": "8b5cf6",
    "LW": "3b82f6", "RW": "f97316", "ST": "22c55e",
}
ULKE_MAP = {
    "ENG": "İngiltere", "ESP": "İspanya", "GER": "Almanya", "FRA": "Fransa",
    "ITA": "İtalya", "BRA": "Brezilya", "ARG": "Arjantin", "POR": "Portekiz",
    "NED": "Hollanda", "BEL": "Belçika", "NOR": "Norveç", "SWE": "İsveç",
    "DEN": "Danimarka", "SUI": "İsviçre", "TUR": "Türkiye", "COL": "Kolombiya",
    "URU": "Uruguay", "SEN": "Senegal", "MAR": "Fas", "CMR": "Kamerun",
    "SCO": "İskoçya", "WAL": "Galler", "IRL": "İrlanda", "CRO": "Hırvatistan",
    "POL": "Polonya", "AUT": "Avusturya", "USA": "ABD", "CIV": "Fildişi Sahili",
}

def f(val, tip=float, d=0):
    try: return tip(val)
    except: return d

def avatar(isim, poz):
    seed = "".join([c for c in isim if c.isalpha()])[:4].upper()
    return f"https://api.dicebear.com/7.x/initials/svg?seed={seed}&backgroundColor={POZ_RENK.get(poz,'22c55e')}"

def ulke(nation):
    for p in nation.strip().split():
        if p.upper() in ULKE_MAP: return ULKE_MAP[p.upper()]
    return nation.strip()

oyuncular, df_s, fw_s = [], 0, 0

with open(CSV_DOSYA, encoding="utf-8") as file:
    for i, row in enumerate(csv.DictReader(file)):
        pos_raw = row.get("Pos", "MF")
        if pos_raw in POZISYON_MAP:
            poz = POZISYON_MAP[pos_raw]
        elif pos_raw == "DF":
            poz = DF_DONGU[df_s % 4]; df_s += 1
        elif pos_raw == "FW":
            poz = FW_DONGU[fw_s % 4]; fw_s += 1
        else:
            poz = "CM"

        mac = f(row.get("MP", 0), int)
        if mac < 5: continue

        prgP = f(row.get("PrgP", 0), int)
        prgC = f(row.get("PrgC", 0), int)
        prgR = f(row.get("PrgR", 0), int)

        oyuncular.append({
            "id": i + 1,
            "isim": row.get("Player", f"Oyuncu {i}"),
            "takim": row.get("Squad", "Bilinmiyor"),
            "lig": LIG_MAP.get(row.get("Comp", ""), row.get("Comp", "")),
            "pozisyon": poz,
            "yas": f(str(row.get("Age", "25")).split("-")[0], int, 25),
            "uyruk": ulke(row.get("Nation", "")),
            "gol": f(row.get("Gls", 0), int),
            "asist": f(row.get("Ast", 0), int),
            "mac": mac,
            "dakika": f(row.get("Min", 0), int),
            "xG": round(f(row.get("xG", 0)), 2),
            "xAG": round(f(row.get("xAG", 0)), 2),
            "npxG": round(f(row.get("npxG", 0)), 2),
            "prgC": prgC, "prgP": prgP, "prgR": prgR,
            "gls90": round(f(row.get("Gls_90", 0)), 2),
            "ast90": round(f(row.get("Ast_90", 0)), 2),
            "xG90": round(f(row.get("xG_90", 0)), 2),
            "xAG90": round(f(row.get("xAG_90", 0)), 2),
            "pasBasarisi": round(min(95, max(55, 75 + prgP * 0.3)), 1),
            "dribling": round(min(95, max(30, 40 + prgC * 0.5)), 1),
            "topKazanma": round(min(80, max(10, 20 + prgP * 0.2)), 1),
            "havaTopu": round(min(90, max(20, 50 + prgR * 0.1)), 1),
            "sutsayisi": f(row.get("Gls", 0), int) * 5 + 10,
            "sariKart": f(row.get("CrdY", 0), int),
            "kirmKart": f(row.get("CrdR", 0), int),
            "transferDegeri": 0,
            "sozlesmeBitis": 2026,
            "resim": avatar(row.get("Player", ""), poz),
        })

with open(os.path.normpath(CIKTI), "w", encoding="utf-8") as file:
    json.dump(oyuncular, file, ensure_ascii=False, indent=2)

print(f"✅ {len(oyuncular)} oyuncu kaydedildi")
