import geopandas as gpd
import json
from pathlib import Path

def build_countries_geojson():
    natural_earth_110m = Path("etl/natural_earth/50m_cultural/ne_50m_admin_0_countries.shp")
    natural_earth_50m = Path("etl/natural_earth/50m_cultural/ne_50m_admin_0_countries.shp")
    if not natural_earth_50m.exists():
        print("⚠ Natural Earth shapefile not found; skipping GeoJSON build")
        return
    gdf = gpd.read_file(natural_earth_50m)
    keep_cols = ["ISO_A3", "ISO_A2", "NAME", "geometry"]
    gdf = gdf[[c for c in keep_cols if c in gdf.columns]]
    gdf.geometry = gdf.geometry.simplify(tolerance=0.1, preserve_topology=True)
    out_path = Path("processed/countries.geojson")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    gdf.to_file(out_path, driver="GeoJSON", precision=4)
    size_mb = out_path.stat().st_size / 1e6
    print(f"✓ GeoJSON built: {out_path} ({size_mb:.1f} MB)")
