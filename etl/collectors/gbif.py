import httpx
import pandas as pd
from pathlib import Path
from config.data_sources import GBIF_BASE, GBIF_TAXA

def collect_occurrences():
    output_dir = Path("raw_vectors")
    output_dir.mkdir(parents=True, exist_ok=True)
    for disease, taxon_key in GBIF_TAXA.items():
        url = f"{GBIF_BASE}?taxonKey={taxon_key}&hasCoordinate=true&limit=1000"
        try:
            with httpx.Client(timeout=30) as client:
                response = client.get(url)
                response.raise_for_status()
                data = response.json()
            results = data.get("results", [])
            df = pd.DataFrame(results)
            if not df.empty:
                df = df[["decimalLatitude", "decimalLongitude", "year", "gbifID", "species"]]
                out_path = output_dir / f"{disease}.csv"
                df.to_csv(out_path, index=False)
                print(f"✓ GBIF {disease}: {len(df)} records")
            else:
                print(f"⚠ GBIF {disease}: no results")
        except Exception as e:
            print(f"✗ GBIF {disease} failed: {e}")
