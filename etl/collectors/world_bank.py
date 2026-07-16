import httpx
import pandas as pd
from pathlib import Path
from config.data_sources import WORLD_BANK_BASE

def collect_world_bank_data():
    indicators = {
        "hospital_beds": "SH.MED.BEDS.ZS",
        "physicians": "SH.MED.PHYS.ZS",
        "health_expenditure": "SH.XPD.CHEX.PC.CD",
        "population": "SP.POP.TOTL",
    }
    output_dir = Path("raw_health/wb")
    output_dir.mkdir(parents=True, exist_ok=True)
    for name, indicator in indicators.items():
        url = f"{WORLD_BANK_BASE}/{indicator}?format=json&per_page=500&date=2000:2023"
        try:
            with httpx.Client(timeout=30) as client:
                response = client.get(url)
                response.raise_for_status()
                data = response.json()
            if len(data) > 1 and isinstance(data[1], list):
                df = pd.DataFrame(data[1])
                out_path = output_dir / f"{name}.csv"
                df.to_csv(out_path, index=False)
                print(f"✓ World Bank {name} saved ({len(df)} rows)")
            else:
                print(f"⚠ World Bank {name}: unexpected format")
        except Exception as e:
            print(f"✗ World Bank {name} failed: {e}")
