import httpx
import pandas as pd
import json
from pathlib import Path

def collect_worldpop():
    output_dir = Path("raw_population")
    output_dir.mkdir(parents=True, exist_ok=True)
    countries = ["USA", "BRA", "IND", "CHN", "NGA", "ZAF", "EGY", "DEU", "FRA", "GBR"]
    for country in countries:
        url = f"https://www.worldpop.org/rest/data/stats?dataset=wpgppop&year=2020&geojson={{\"type\":\"FeatureCollection\",\"features\":[{{\"type\":\"Feature\",\"properties\":{{\"ISO3\":\"{country}\"}},\"geometry\":null}}]}}"
        try:
            with httpx.Client(timeout=30) as client:
                response = client.get(url)
                response.raise_for_status()
                data = response.json()
            out_path = output_dir / f"{country}.json"
            out_path.write_text(json.dumps(data, indent=2))
            print(f"✓ WorldPop {country} saved")
        except Exception as e:
            print(f"✗ WorldPop {country} failed: {e}")
