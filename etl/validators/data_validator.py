import pandas as pd

def validate_all(climate_df, scores_df, vulnerability_df):
    errors = []
    if climate_df.empty:
        errors.append("Climate data is empty")
    if scores_df.empty:
        errors.append("Suitability scores are empty")
    if vulnerability_df.empty:
        errors.append("Vulnerability index is empty")
    if not scores_df["suitability_score"].between(0, 1).all():
        errors.append("Suitability scores out of range")
    if not vulnerability_df["vulnerability_score"].between(0, 10).all():
        errors.append("Vulnerability scores out of range")
    if errors:
        print("VALIDATION FAILED:")
        for e in errors:
            print(f"  - {e}")
        return False
    print("✓ Validation passed")
    return True
