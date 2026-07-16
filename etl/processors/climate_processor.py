import pandas as pd
import json
from pathlib import Path
from config.diseases import DISEASE_PARAMETERS

def process_all_climate():
    raw_dir = Path("raw_climate/nasa")
    records = []
    for file in raw_dir.glob("*.json"):
        iso3 = file.stem
        data = json.loads(file.read_text())
        for year, months in data.get("properties", {}).get("parameter", {}).items():
            record = {"country_iso3": iso3, "year": int(year)}
            for month, values in months.items():
                record[f"temp_{month}"] = values.get("T2M")
                record[f"temp_min_{month}"] = values.get("T2M_MIN")
                record[f"humidity_{month}"] = values.get("RH2M")
                record[f"precip_{month}"] = values.get("PRECTOTCORR")
            records.append(record)
    df = pd.DataFrame(records)
    df.to_csv("processed_climate.csv", index=False)
    print(f"✓ Processed {len(df)} climate records")
    return df, pd.DataFrame()
