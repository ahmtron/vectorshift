# VectorShift — Refined Implementation Plan

> **Design Read (per `design-taste-frontend` skill):** Reading this as a **data journalism / climate health intelligence platform** for public health officials, researchers, and journalists — with a serious editorial/dark-data aesthetic language, leaning toward a custom design system built on Next.js + Tailwind + shadcn/ui + MapLibre GL JS (using free CartoDB vector basemaps), with restrained but purposeful motion (`DESIGN_VARIANCE: 7`, `MOTION_INTENSITY: 6`, `VISUAL_DENSITY: 5`).

---

## Project Summary

**VectorShift** is a global climate-health intelligence platform that maps how rising temperatures expand the geographic range of disease-carrying vectors (mosquitoes, ticks, sandflies) into new regions. It transforms NASA climate data, WHO disease surveillance records, and published vector biology research into an interactive, beautiful, decision-support tool.

**Core value proposition:** *Make the invisible visible — show where the next epidemic risk is quietly building, before the first person gets sick.*

---

## Updated Architecture Summary (Local Development Focus)

| Layer | Technology | Status / Key Options |
|---|---|---|
| Frontend | Next.js 14 App Router + TypeScript | Local `npm run dev` |
| Styling | Tailwind CSS 3.4 + shadcn/ui | Local components |
| Map | **MapLibre GL JS** + **CartoDB Dark Matter GL style** | **100% Free, No Credit Card Required** |
| Charts | Recharts 2.x + D3.js v7 | Local charts |
| Animation | Framer Motion 11+ | Local transitions |
| State | Zustand 4+ | Local store |
| Database | PostgreSQL 15 + PostGIS via Supabase | Supabase Local / Free DB (Connected) |
| Storage | Supabase Storage | GeoJSON uploads |
| AI | **Groq API** (`llama-3.3-70b-versatile`) | **Key provided in keys.txt** |
| Rate Limiting | **Upstash Redis** | **Key provided in keys.txt** |
| ETL Pipeline | Python 3.11 | Local execution |

---

## Maps: Mapbox Alternative (100% Free & No Credit Card)

To bypass Mapbox's credit card billing requirement, we will use **MapLibre GL JS** (the open-source community fork of Mapbox GL JS) paired with **CARTO’s Dark Matter Vector Style**.

### Why this is the best choice:
1. **No Account or Credit Card Needed:** MapLibre is open-source and free. CARTO's basemap styles are hosted publicly and do not require signup or access tokens.
2. **High Performance Vector Maps:** By using CARTO's vector GL style instead of old-school raster maps, the map remains sharp at all zoom levels, renders quickly, and handles our custom GeoJSON overlays seamlessly.
3. **Compatible with Next.js/React:** `react-map-gl` has built-in support for MapLibre, allowing us to drop it in as a direct replacement.

### Setup Instructions (Local Dev):
1. Install MapLibre GL JS and its React wrapper:
   ```bash
   npm install maplibre-gl react-map-gl
   ```
2. In the Next.js config (`next.config.js`), alias `mapbox-gl` to `maplibre-gl` to keep imports clean:
   ```javascript
   webpack: (config) => {
     config.resolve.alias = {
       ...config.resolve.alias,
       'mapbox-gl': 'maplibre-gl',
     }
     return config
   }
   ```
3. Use the CartoDB Dark Matter vector style URL directly in the map:
   - **Style URL:** `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`
   - **Required Attribution:** `© OpenStreetMap contributors, © CARTO`

---

## Groq API & Upstash Setup

### 1. Selected Model: `llama-3.3-70b-versatile`
*   **Why:** Llama 3.1 is deprecated on the Groq API. The newer **`llama-3.3-70b-versatile`** is the current flagship text model on Groq. It features a 128K context window, excellent tool usage, and is highly optimized for SQL context reasoning.
*   **Alternative Speed Model:** `llama-3.3-70b-specdec` (speculative decoding) can be used to achieve ultra-fast token generation if needed, but the standard `versatile` model is more stable.
*   **Configuration:** The Groq API key from `keys.txt` will be placed in `.env.local`:
    ```env
    GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxx
    ```

### 2. Upstash Rate Limiting
*   **Why:** Serverless rate limiting for the AI endpoint to prevent API spam and stay within Groq free tier limits.
*   **Configuration:** The Upstash REST credentials from `keys.txt` will be placed in `.env.local`:
    ```env
    UPSTASH_REDIS_REST_URL=gsk_xxxxxxxxxxxxxxxxxxxxxxxxx
    UPSTASH_REDIS_REST_TOKEN=gsk_xxxxxxxxxxxxxxxxxxxxxxxxx
    ```

---

## Data Collection Guide & Step-by-Step Settings

### 1. WHO GHO (Global Health Observatory)
*   **Where the Data is:** The GHO has shifted to a modern **OData API** at `https://ghoapi.azureedge.net/api/`. This API is fully open, has no authentication, and is best collected programmatically in Python.
*   **Surveillance Data Coverage:**
    - **Malaria:** Use indicator code `MALARIA_CONF_CASES` (Confirmed malaria cases).
    - **Leishmaniasis:** Use indicator codes `LEISH_CUTANEOUS` (Cutaneous cases) and `LEISH_VISCERAL` (Visceral cases).
    - **Dengue:** Use indicator `DENVFEVER_NUMBER` (Reported number of dengue cases).
    - **Zika, Chikungunya, and Lyme Disease:** These are **not** standard global time-series GHO indicators. Zika and Chikungunya are reported via regional partners (like PAHO) and outbreak notices. Lyme disease is managed by national bodies (like CDC and ECDC).
*   **Actionable Guidance:**
    - Since Zika, Chikungunya, and Lyme disease cases are not tracked in WHO GHO, we will use **GBIF vector occurrence records** as the primary scientific validation of presence, and pre-seed/mock clinical case numbers where surveillance reports are missing at the country level.
    - Write a Python script (`etl/collectors/who_gho.py`) to query:
      `https://ghoapi.azureedge.net/api/{INDICATOR_CODE}`
      Filter by country (using ISO codes) and save to CSV.

### 2. World Bank Climate Change Knowledge Portal (CMIP6 Projections)
For future projections, go to [climateknowledgeportal.worldbank.org](https://climateknowledgeportal.worldbank.org) → **Download Data** and select the following options:

1.  **Global Countries vs Collections:** Select **Global Countries** (pre-calculated country averages).
2.  **Collections:** Select **CMIP6 x0.25** (latest downscaled IPCC AR6 models).
3.  **Data Type:** Select **Time Series** (provides year-by-year forecasts, needed for the time slider).
4.  **Variable:** We need three downloads:
    - `tas` (Mean Temperature) — needed for average suitability.
    - `tasmin` (Minimum Temperature) — crucial for winter survival/overwintering.
    - `pr` (Precipitation) — needed to calculate breeding season rain months.
5.  **Product:** Select **climatology** (actual forecasted values, not anomalies).
6.  **Aggregation:** Select **monthly** (we need monthly resolution to identify the coldest month and count wet months).
7.  **Period:** Select **2020–2050** (covers our MVP forecast timeline).
8.  **Percentile:** Select **median** (the multi-model ensemble median is the most stable scientific baseline).
9.  **Scenario:** Download three scenarios separately to support the UI scenario switch:
    - **SSP1-2.6** (`ssp126`): Optimistic low-emissions scenario.
    - **SSP2-4.5** (`ssp245`): Moderate middle-path scenario.
    - **SSP5-8.5** (`ssp585`): High-emissions worst-case scenario.

### 3. Global Health Security Index (GHSI)
*   **Verification:** The file you downloaded (`Global_Health_Security_Index_2021_vFINAL (April 2022 v2).xlsm`) is the **correct and latest global dataset**.
*   **Why:** The GHS Index has only been published in 2019 and 2021. There is no 2023, 2024, or 2025 global edition.
*   **How to use:** Save this Excel file to `etl/raw_health/ghs_index_2021.xlsm`. The python processor will extract `Overall Score` and `Health System` capacity (Category 4) using `pandas`.

### 4. Natural Earth Data
To render borders on the map, download files under **Cultural Vectors**:
1.  **Scale Selection:**
    - Download **1:110m Cultural Vectors** (highly optimized for fast world views, keeping files under 3MB).
    - Download **1:50m Cultural Vectors** (better detail for regional zoom views).
    - *Avoid 1:10m* as files are too large and will cause map lag.
2.  **Category:** Cultural.
3.  **Specific Dataset:** **Admin 0 – Countries**.
4.  **Steps:**
    - Go to [naturalearthdata.com](https://www.naturalearthdata.com) → Downloads.
    - Click **1:110m Cultural Vectors** → Scroll to **Admin 0 - Countries** → Click **Download countries**.
    - Click **1:50m Cultural Vectors** → Scroll to **Admin 0 - Countries** → Click **Download countries**.
    - Place the downloaded ZIPs in `etl/natural_earth/` and extract them.

### 5. WorldPop (Population Data)
*   **Recommendation:** To avoid downloading gigabytes of raster population maps, we recommend using the **World Bank API for total population** (`SP.POP.TOTL`) which is free, keyless, and returns country-level historical values in a simple JSON structure.
*   **If WorldPop is required:** Use the WorldPop REST API `stats` service in Python to fetch population stats dynamically using country coordinates:
    `https://www.worldpop.org/rest/data/stats?dataset=wpgppop&year={YEAR}&geojson={GEOJSON}`

### 6. GBIF (Global Biodiversity Information Facility)
*   **Where to Get It:** Use GBIF's public, free, keyless REST API.
*   **Method:** Fetch occurrence coordinate points for the 4 primary disease vectors:
    - *Aedes aegypti* (Dengue/Zika vector): TaxonKey `1651891`
    - *Anopheles gambiae* (Malaria vector): TaxonKey `1650518`
    - *Ixodes ricinus* (Lyme vector): TaxonKey `2182588`
    - *Phlebotomus papatasi* (Leishmaniasis vector): TaxonKey `5981170`
*   **API Query Structure:**
    `https://api.gbif.org/v1/occurrence/search?taxonKey={TAXON_KEY}&hasCoordinate=true&limit=1000`
*   **Actionable Guidance:** Write a Python script (`etl/collectors/gbif.py`) to query this URL, extract the `decimalLatitude`, `decimalLongitude`, and `year`, and save them to a CSV file.

---

## Additional Datasets Recommended to Improve the Project

To make VectorShift a truly premium, science-backed resource, we should add these two free datasets:

1.  **Average Elevation by Country (CIA World Factbook / Kaggle):**
    - **Why:** The suitability algorithm for dengue (< 2,000m) and malaria (< 2,500m) requires elevation. Since NASA POWER doesn't supply elevation, we must download the *List of Countries by Average Elevation* CSV (available on Kaggle/Wikipedia) to populate the `countries.altitude_median` column.
2.  **World Bank Socioeconomic Indicators:**
    - **Why:** To make the **Vulnerability Index** mathematically sound, we should combine the biological suitability risk with the country's poverty headcount ratio (`SI.POV.NAHC`) and GDP per capita (`NY.GDP.PCAP.KD`). Poorer countries are less resilient to vector-borne disease expansion.

---

## Updated Implementation Order (Local Focus)

```
Phase 0  (Days  1- 3): Next.js Scaffold + Config (setup MapLibre, install dependencies)
Phase 1  (Days  4- 6): Supabase Schema, postgis setup, and seeding
Phase 2  (Days  7-18): ETL Pipeline (Python script fetching WHO GHO, WB CMIP6, GBIF API)
Phase 3  (Days 19-24): Next.js API Routes (using Groq Llama 3.3, Upstash rate limit)
Phase 4  (Days 25-27): Zustand State Management
Phase 5  (Days 28-40): Explorer Page (Interactive MapLibre Map, Time Slider, Panels)
Phase 6  (Days 41-50): Statically Generated Country Profile Pages (ISR)
Phase 7  (Days 51-57): Compare & Trends Pages
Phase 8  (Days 58-65): Data Explorer (CSV download) & AI Assistant
Phase 9  (Days 66-78): Landing Page with Scrollytelling (animated MapLibre map on scroll)
Phase 10 (Days 79-82): Static Methodology and About Pages
Phase 11 (Days 83-90): Polish & Performance Audit (Local test)
Phase 12 (Days 91-98): Unit / E2E Local Testing
```
