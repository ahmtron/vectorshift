import pandas as pd

def calculate_global_stats(scores_df):
    rows = []
    for (year, disease), group in scores_df.groupby(["year", "disease_slug"]):
        high = (group["suitability_score"] >= 0.6).sum()
        moderate = ((group["suitability_score"] >= 0.4) & (group["suitability_score"] < 0.6)).sum()
        newly = group["is_newly_at_risk"].sum()
        avg = group["suitability_score"].mean()
        rows.append({
            "year": year,
            "disease_slug": disease,
            "scenario": None,
            "countries_high_risk": int(high),
            "countries_moderate_risk": int(moderate),
            "countries_newly_at_risk": int(newly),
            "total_population_at_risk": 0,
            "avg_global_suitability": round(avg, 3),
            "by_region": {},
        })
    df = pd.DataFrame(rows)
    df.to_csv("global_stats.csv", index=False)
    print(f"✓ Calculated {len(df)} global stats rows")
    return df
