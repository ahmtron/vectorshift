NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/monthly/country"
NASA_PARAMETERS = "T2M,T2M_MIN,T2M_MAX,RH2M,PRECTOTCORR"

WHO_GHO_BASE = "https://ghoapi.azureedge.net/api"

WORLD_BANK_BASE = "https://api.worldbank.org/v2/country/all/indicator"

CMIP6_BASE = "https://cckpapi.worldbank.org/cckp/v1"

CMIP6_URLS = {
  "SSP1-2.6": {
    "tas": "https://cckpapi.worldbank.org/cckp/v1/cmip6-x0.25_timeseries_tas_timeseries_monthly_2015-2100_mean_ssp126_access-cm2_r1i1p1f1_mean/global_countries?_format=json",
    "tasmin": "https://cckpapi.worldbank.org/cckp/v1/cmip6-x0.25_timeseries_tasmin_timeseries_monthly_2015-2100_mean_ssp126_access-cm2_r1i1p1f1_mean/global_countries?_format=json",
    "pr": "https://cckpapi.worldbank.org/cckp/v1/cmip6-x0.25_timeseries_pr_timeseries_monthly_2015-2100_mean_ssp126_access-cm2_r1i1p1f1_mean/global_countries?_format=json",
  },
  "SSP2-4.5": {
    "tas": "https://cckpapi.worldbank.org/cckp/v1/cmip6-x0.25_timeseries_tas_timeseries_monthly_2015-2100_mean_ssp245_access-cm2_r1i1p1f1_mean/global_countries?_format=json",
    "tasmin": "https://cckpapi.worldbank.org/cckp/v1/cmip6-x0.25_timeseries_tasmin_timeseries_monthly_2015-2100_mean_ssp245_access-cm2_r1i1p1f1_mean/global_countries?_format=json",
    "pr": "https://cckpapi.worldbank.org/cckp/v1/cmip6-x0.25_timeseries_pr_timeseries_monthly_2015-2100_mean_ssp245_access-cm2_r1i1p1f1_mean/global_countries?_format=json",
  },
  "SSP5-8.5": {
    "tas": "https://cckpapi.worldbank.org/cckp/v1/cmip6-x0.25_timeseries_tas_timeseries_monthly_2015-2100_mean_ssp585_access-cm2_r1i1p1f1_mean/global_countries?_format=json",
    "tasmin": "https://cckpapi.worldbank.org/cckp/v1/cmip6-x0.25_timeseries_tasmin_timeseries_monthly_2015-2100_mean_ssp585_access-cm2_r1i1p1f1_mean/global_countries?_format=json",
    "pr": "https://cckpapi.worldbank.org/cckp/v1/cmip6-x0.25_timeseries_pr_timeseries_monthly_2015-2100_mean_ssp585_access-cm2_r1i1p1f1_mean/global_countries?_format=json",
  },
}

GBIF_BASE = "https://api.gbif.org/v1/occurrence/search"
GBIF_TAXA = {
  "dengue": 1652050,
  "malaria": 1652061,
  "lyme": 5874905,
  "leishmaniasis": 4394685,
}

WORLDPOP_BASE = "https://www.worldpop.org/rest/data/stats"

RAW_DIRS = {
  "nasa": "raw_climate/nasa",
  "who": "raw_disease/who",
  "world_bank": "raw_health/wb",
  "projections": "raw_projections",
  "vectors": "raw_vectors",
  "population": "raw_population",
}
