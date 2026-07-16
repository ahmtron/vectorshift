import httpx
import json
import time
from pathlib import Path
from config.countries import COUNTRIES
from config.data_sources import NASA_POWER_URL, NASA_PARAMETERS

def collect_country_climate(iso3: str, start: int = 1981, end: int = 2023) -> dict:
    params = {
        "parameters": NASA_PARAMETERS,
        "community": "AG",
        "country": iso3,
        "start": str(start),
        "end": str(end),
        "format": "JSON",
        "user": "vectorshift_research",
    }
    with httpx.Client(timeout=60) as client:
        response = client.get(NASA_POWER_URL, params=params)
        response.raise_for_status()
        return response.json()

def collect_all_countries():
    output_dir = Path("raw_climate/nasa")
    output_dir.mkdir(parents=True, exist_ok=True)
    failed = []
    for i, country in enumerate(COUNTRIES):
        iso3 = country["iso3"]
        output_file = output_dir / f"{iso3}.json"
        if output_file.exists():
            print(f"[{i+1}/{len(COUNTRIES)}] {iso3} — cached, skipping")
            continue
        print(f"[{i+1}/{len(COUNTRIES)}] Collecting {iso3}...")
        for attempt in range(3):
            try:
                data = collect_country_climate(iso3)
                output_file.write_text(json.dumps(data, indent=2))
                print(f"  ✓ {iso3} saved")
                time.sleep(1)
                break
            except Exception as e:
                if attempt == 2:
                    print(f"  ✗ {iso3} failed after 3 attempts: {e}")
                    failed.append(iso3)
                else:
                    time.sleep(5)
    if failed:
        Path("raw_climate/failed.txt").write_text("\n".join(failed))
    print(f"\nCollection complete. {len(COUNTRIES) - len(failed)}/{len(COUNTRIES)} successful.")
