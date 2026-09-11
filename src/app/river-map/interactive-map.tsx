"use client";

import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Map, {
  Source,
  Layer,
  Popup,
  NavigationControl,
  ScaleControl,
  FullscreenControl,
} from "react-map-gl/maplibre";
import type { MapRef, MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { GeoJSON } from "geojson";

interface InteractiveMapProps {
  mapRef: React.RefObject<MapRef | null>;
  initialViewState: { longitude: number; latitude: number; zoom: number };
  onLoad: () => void;
  onError: () => void;
  onClick: (e: MapLayerMouseEvent) => void;
  riverGeoJSON: GeoJSON;
  zonesGeoJSON: GeoJSON;
  reportsGeoJSON: GeoJSON;
  showHeatmap: boolean;
  selectedZone?: {
    longitude: number;
    latitude: number;
    id: string;
  } | null;
  selectedSourceGeoJSON?: GeoJSON;
  onDeselectZone: () => void;
  PopupContent?: React.ReactNode;
}

const MAP_STYLE =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ??
  "https://tiles.openfreemap.org/styles/liberty";

export function InteractiveMap({
  mapRef,
  initialViewState,
  onLoad,
  onError,
  onClick,
  riverGeoJSON,
  zonesGeoJSON,
  reportsGeoJSON,
  showHeatmap,
  selectedZone,
  selectedSourceGeoJSON,
  onDeselectZone,
  PopupContent,
}: InteractiveMapProps) {
  return (
    <Map
      ref={mapRef}
      mapLib={maplibregl}
      mapStyle={MAP_STYLE}
      initialViewState={initialViewState}
      onLoad={onLoad}
      onError={onError}
      onClick={onClick}
      interactiveLayerIds={["zones-layer"]}
      style={{ width: "100%", height: "100%" }}
    >
      <NavigationControl position="top-right" />
      <ScaleControl position="bottom-left" />
      <FullscreenControl position="top-right" />

      <Source id="river-path" type="geojson" data={riverGeoJSON}>
        <Layer
          id="river-line"
          type="line"
          paint={{
            "line-color": "#1e40af",
            "line-width": 3,
            "line-opacity": 0.8,
          }}
        />
      </Source>

      <Source
        id="zones-source"
        type="geojson"
        data={zonesGeoJSON}
        cluster
        clusterMaxZoom={14}
        clusterRadius={50}
      >
        <Layer
          id="clusters"
          type="circle"
          filter={["has", "point_count"]}
          paint={{
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#86efac",
              5,
              "#fde68a",
              15,
              "#fca5a5",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              5,
              30,
              15,
              40,
            ],
          }}
        />
        <Layer
          id="cluster-count"
          type="symbol"
          filter={["has", "point_count"]}
          layout={{
            "text-field": "{point_count_abbreviated}",
            "text-size": 12,
          }}
        />
        <Layer
          id="zones-layer"
          type="circle"
          filter={["!", ["has", "point_count"]]}
          paint={{
            "circle-color": [
              "match",
              ["get", "riskLevel"],
              "Low",
              "#16a34a",
              "Medium",
              "#eab308",
              "High",
              "#f97316",
              "Critical",
              "#dc2626",
              "#64748b",
            ],
            "circle-radius": 8,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
          }}
        />
        {showHeatmap && (
          <Layer
            id="zones-heatmap"
            type="heatmap"
            paint={{
              "heatmap-weight": [
                "interpolate",
                ["linear"],
                ["get", "waterQualityScore"],
                0,
                10,
                100,
                0,
              ],
              "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                1,
                15,
                3,
              ],
              "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(33,102,172,0)",
                0.2,
                "rgb(103,169,207)",
                0.4,
                "rgb(209,229,240)",
                0.6,
                "rgb(253,219,199)",
                0.8,
                "rgb(244,109,67)",
                1,
                "rgb(165,0,38)",
              ],
              "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                2,
                15,
                20,
              ],
            }}
          />
        )}
      </Source>

      <Source id="reports-source" type="geojson" data={reportsGeoJSON}>
        <Layer
          id="reports-layer"
          type="circle"
          paint={{
            "circle-color": "#0ea5e9",
            "circle-radius": 6,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
          }}
        />
      </Source>

      {selectedZone && (
        <>
          <Popup
            longitude={selectedZone.longitude}
            latitude={selectedZone.latitude}
            anchor="bottom"
            offset={20}
            onClose={onDeselectZone}
            className="!rounded-xl !shadow-lg"
          >
            {PopupContent}
          </Popup>
          {selectedSourceGeoJSON && (
            <Source
              id="selected-source"
              type="geojson"
              data={selectedSourceGeoJSON}
            >
              <Layer
                id="selected-layer"
                type="circle"
                paint={{
                  "circle-color": "rgba(255,255,255,0)",
                  "circle-radius": 18,
                  "circle-stroke-width": 3,
                  "circle-stroke-color": "#ffffff",
                }}
              />
            </Source>
          )}
        </>
      )}
    </Map>
  );
}
