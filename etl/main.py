import sys
import asyncio
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

def run_full_etl():
    logger.info("=" * 60)
    logger.info("VECTORSHIFT ETL PIPELINE STARTING")
    logger.info("=" * 60)
    try:
        logger.info("[PHASE 1] COLLECTING RAW DATA")
        from collectors.nasa_power import collect_all_countries
        from collectors.who_gho import collect_who_data
        from collectors.world_bank import collect_world_bank_data
        from collectors.cmip6 import collect_projections
        from collectors.gbif import collect_occurrences
        from collectors.worldpop import collect_worldpop
        collect_all_countries()
        collect_who_data()
        collect_world_bank_data()
        asyncio.run(collect_projections())
        collect_occurrences()
        collect_worldpop()
        logger.info("[PHASE 2] PROCESSING DATA")
        from processors.climate_processor import process_all_climate
        from processors.score_calculator import calculate_all_scores
        from processors.vulnerability_calc import calculate_vulnerability
        from processors.geojson_builder import build_countries_geojson
        from processors.global_stats import calculate_global_stats
        climate_df, _ = process_all_climate()
        scores_df = calculate_all_scores(climate_df)
        vulnerability_df = calculate_vulnerability(scores_df)
        build_countries_geojson()
        global_stats_df = calculate_global_stats(scores_df)
        logger.info("[PHASE 3] VALIDATING DATA")
        from validators.data_validator import validate_all
        if not validate_all(climate_df, scores_df, vulnerability_df):
            logger.error("VALIDATION FAILED. Aborting pipeline.")
            sys.exit(1)
        logger.info("[PHASE 4] LOADING TO DATABASE")
        from loaders.db_loader import load_all_data
        load_all_data(climate_df, pd.DataFrame(), scores_df, pd.DataFrame(), vulnerability_df, global_stats_df)
        from loaders.storage_loader import upload_geojson
        upload_geojson()
        logger.info("[PHASE 5] POST-PROCESSING")
        logger.info("ETL PIPELINE COMPLETE")
    except Exception as e:
        logger.error(f"ETL PIPELINE FAILED: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    run_full_etl()
