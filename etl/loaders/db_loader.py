import pandas as pd
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

def load_all_data(climate_df, projections_df, scores_df, scores_proj_df, vulnerability_df, global_stats_df):
    client = get_client()
    print("Loading data to Supabase...")
    for table, df in [
        ("climate_data", climate_df),
        ("suitability_scores", scores_df),
        ("vulnerability_index", vulnerability_df),
        ("global_stats_cache", global_stats_df),
    ]:
        if df.empty:
            continue
        records = df.replace({float('nan'): None}).to_dict("records")
        chunk_size = 500
        for i in range(0, len(records), chunk_size):
            chunk = records[i:i + chunk_size]
            try:
                client.table(table).upsert(chunk).execute()
                print(f"  ✓ {table}: {len(chunk)} rows loaded")
            except Exception as e:
                print(f"  ✗ {table} chunk {i} failed: {e}")
    print("Data load complete")
