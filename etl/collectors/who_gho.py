import httpx
import pandas as pd
from pathlib import Path
from config.data_sources import WHO_GHO_BASE

def collect_who_data():
    indicators = {
        "dengue": "DENVFEVER_NUMBER",
        "malaria": "MALARIA_CONF_CASES",
        "leishmaniasis_cutaneous": "LEISH_CUTANEOUS",
        "leishmaniasis_visceral": "LEISH_VISCERAL",
    }
    output_dir = Path("raw_disease/who")
    output_dir.mkdir(parents=True, exist_ok=True)
    for disease, indicator in indicators.items():
        url = f"{WHO_GHO_BASE}/{indicator}?$format=json"
        try:
            with httpx.Client(timeout=30) as client:
                response = client.get(url)
                response.raise_for_status()
                data = response.json()
            df = pd.DataFrame(data)
            out_path = output_dir / f"{disease}.csv"
            df.to_csv(out_path, index=False)
            print(f"✓ WHO {disease} data saved ({len(df)} rows)")
        except Exception as e:
            print(f"✗ WHO {disease} failed: {e}")
