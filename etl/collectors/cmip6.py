import httpx
import pandas as pd
import asyncio
import json
from pathlib import Path
from config.data_sources import CMIP6_URLS

SCENARIOS = ["SSP1-2.6", "SSP2-4.5", "SSP5-8.5"]
VARIABLES = ["tas", "tasmin", "pr"]

async def fetch_url(client: httpx.AsyncClient, url: str, label: str) -> dict | None:
    for attempt in range(3):
        try:
            resp = await client.get(url, timeout=60)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            if attempt == 2:
                print(f"  ✗ {label} failed: {e}")
                return None
            await asyncio.sleep(5)

async def collect_projections():
    output_dir = Path("raw_projections")
    output_dir.mkdir(parents=True, exist_ok=True)
    async with httpx.AsyncClient() as client:
        for scenario in SCENARIOS:
            scenario_dir = output_dir / scenario
            scenario_dir.mkdir(exist_ok=True)
            for variable in VARIABLES:
                url = CMIP6_URLS[scenario][variable]
                print(f"Fetching {scenario} / {variable}...")
                data = await fetch_url(client, url, f"{scenario}/{variable}")
                if data is None:
                    continue
                out_path = scenario_dir / f"{variable}.json"
                out_path.write_text(json.dumps(data, indent=2))
                print(f"  ✓ {scenario}/{variable} saved")
