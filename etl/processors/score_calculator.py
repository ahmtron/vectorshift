import pandas as pd
import numpy as np
from config.diseases import DISEASE_PARAMETERS

def calculate_temp_score(temp_mean, temp_min_coldest, params):
    t = params["temperature"]
    if temp_mean < t["min"] or temp_mean > t["max"]:
        temp_score = 0.0
    elif t["optimal_min"] <= temp_mean <= t["optimal_max"]:
        temp_score = 1.0
    elif temp_mean < t["optimal_min"]:
        temp_score = (temp_mean - t["min"]) / (t["optimal_min"] - t["min"])
    else:
        temp_score = (t["max"] - temp_mean) / (t["max"] - t["optimal_max"])
    if temp_min_coldest < t["winter_min"]:
        winter_score = 0.0
    elif temp_min_coldest > t["winter_min"] + 5:
        winter_score = 1.0
    else:
        winter_score = (temp_min_coldest - t["winter_min"]) / 5.0
    return round(max(0.0, min(1.0, temp_score)), 3), round(max(0.0, min(1.0, winter_score)), 3)

def calculate_humidity_score(humidity_mean, params):
    h = params["humidity"]
    if humidity_mean < h["min"]:
        return 0.0
    elif humidity_mean > h["min"] + 20:
        return 1.0
    return round((humidity_mean - h["min"]) / 20.0, 3)

def calculate_rain_score(suitable_months, params):
    required = params["precipitation"]["required_months"]
    if suitable_months < required:
        return 0.0
    return round(min(1.0, suitable_months / (required * 1.5)), 3)

def calculate_altitude_score(altitude_median, params):
    max_alt = params["altitude"]["max"]
    if altitude_median > max_alt:
        return 0.0
    elif altitude_median > max_alt * 0.8:
        return 0.5
    return 1.0

def calculate_suitable_months(monthly_precip, min_monthly):
    return sum(1 for p in monthly_precip if p >= min_monthly)

def calculate_suitability(climate_row, disease_slug):
    params = DISEASE_PARAMETERS[disease_slug]
    monthly_precip = [climate_row.get(f"precip_{m}", 0) or 0 for m in ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]]
    suitable_months = calculate_suitable_months(monthly_precip, params["precipitation"]["min_monthly"])
    temp_score, winter_score = calculate_temp_score(climate_row.get("temp_mean", 0), climate_row.get("temp_min_coldest", 0), params)
    humidity_score = calculate_humidity_score(climate_row.get("humidity_mean", 0), params)
    rain_score = calculate_rain_score(suitable_months, params)
    altitude_score = calculate_altitude_score(climate_row.get("altitude_median", 0), params)
    final_score = temp_score * 0.35 + winter_score * 0.25 + humidity_score * 0.20 + rain_score * 0.15 + altitude_score * 0.05
    final_score = round(max(0.0, min(1.0, final_score)), 3)
    if final_score >= 0.8: risk_level = "critical"
    elif final_score >= 0.6: risk_level = "high"
    elif final_score >= 0.4: risk_level = "moderate"
    elif final_score >= 0.2: risk_level = "low"
    else: risk_level = "none"
    return {
        "temp_score": temp_score,
        "winter_score": winter_score,
        "humidity_score": humidity_score,
        "rain_score": rain_score,
        "altitude_score": altitude_score,
        "suitability_score": final_score,
        "risk_level": risk_level,
        "suitable_months": suitable_months,
    }

def calculate_all_scores(climate_df, projection_df=None):
    results = []
    for _, row in climate_df.iterrows():
        for disease in DISEASE_PARAMETERS:
            scores = calculate_suitability(row.to_dict(), disease)
            results.append({
                "country_iso3": row["country_iso3"],
                "year": row["year"],
                "scenario": None,
                "disease_slug": disease,
                **scores,
            })
    df = pd.DataFrame(results)
    df = df.sort_values(["country_iso3", "disease_slug", "year"])
    df["score_change_1yr"] = df.groupby(["country_iso3", "disease_slug"])["suitability_score"].diff(1)
    df["score_change_5yr"] = df.groupby(["country_iso3", "disease_slug"])["suitability_score"].diff(5)
    scores_2000 = df[df["year"] == 2000][["country_iso3", "disease_slug", "suitability_score"]].rename(columns={"suitability_score": "score_2000"})
    df = df.merge(scores_2000, on=["country_iso3", "disease_slug"], how="left")
    df["score_change_since_2000"] = df["suitability_score"] - df["score_2000"]
    df.drop(columns=["score_2000"], inplace=True)
    def is_newly_at_risk(group):
        group = group.sort_values("year")
        recent = group[group["year"] >= group["year"].max() - 5]
        past = group[group["year"] < group["year"].max() - 5]
        if len(past) == 0:
            return pd.Series([False] * len(group), index=group.index)
        was_below = (past["suitability_score"] < 0.4).all()
        is_above = (recent["suitability_score"] >= 0.4).any()
        return pd.Series([was_below and is_above] * len(group), index=group.index)
    df["is_newly_at_risk"] = df.groupby(["country_iso3", "disease_slug"], group_keys=False).apply(is_newly_at_risk)
    df.to_csv("suitability_scores.csv", index=False)
    print(f"✓ Calculated {len(df)} suitability scores")
    return df
