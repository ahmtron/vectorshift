from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def get_client():
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Supabase credentials missing")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_geojson():
    client = get_client()
    geojson_path = "processed/countries.geojson"
    try:
        with open(geojson_path, "rb") as f:
            client.storage.from_("geojson").upload("countries.geojson", f)
        print("✓ GeoJSON uploaded to Supabase Storage")
    except Exception as e:
        print(f"✗ GeoJSON upload failed: {e}")
