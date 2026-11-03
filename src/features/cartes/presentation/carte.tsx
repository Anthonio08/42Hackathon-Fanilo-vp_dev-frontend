"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { IncidentPoint } from "../domain/data";

export type MapType = "satellite" | "streets";

const TILE_LAYERS: Record<
  MapType,
  { url: string; attribution: string; maxZoom: number }
> = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, USGS, Maxar",
    maxZoom: 18,
  },
  streets: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    maxZoom: 19,
  },
};

function createPinIcon(color: string, isHigh = false, isSelected = false, size = 32) {
  const finalSize = isSelected ? size * 1.25 : size;
  const pulseHtml = isHigh
    ? `<span style="position: absolute; top: -6px; left: -6px; width: ${finalSize + 12}px; height: ${finalSize + 12}px; border-radius: 50%; background: ${color}; opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
    : "";

  const html = `
    <div style="position: relative; width: ${finalSize}px; height: ${finalSize * 1.3}px;">
      ${pulseHtml}
      <svg xmlns="http://www.w3.org/2000/svg" width="${finalSize}" height="${finalSize * 1.3}"
        viewBox="0 0 24 31" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,.45)); position: relative; z-index: 2;">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 19 12 19s12-10 12-19C24 5.4 18.6 0 12 0z"
          fill="${color}" stroke="${isSelected ? '#ffffff' : 'rgba(255,255,255,0.9)'}" stroke-width="${isSelected ? '2.5' : '1.5'}"/>
        <circle cx="12" cy="12" r="4.5" fill="white"/>
      </svg>
    </div>`;

  return L.divIcon({
    html,
    className: "custom-map-pin",
    iconSize: [finalSize, finalSize * 1.3],
    iconAnchor: [finalSize / 2, finalSize * 1.3],
    popupAnchor: [0, -finalSize * 1.2],
    tooltipAnchor: [finalSize / 2, -finalSize * 0.6],
  });
}

function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);

  return null;
}

interface SatelliteMapProps {
  markers: IncidentPoint[];
  center?: [number, number];
  zoom?: number;
  mapType?: MapType;
  selectedMarkerId?: string | null;
  onSelectMarker?: (marker: IncidentPoint) => void;
  onConfirmIncident?: (id: string) => void;
}

export function SatelliteMap({
  markers,
  center = [-18.8792, 47.5079],
  zoom = 14,
  mapType = "satellite",
  selectedMarkerId = null,
  onSelectMarker,
  onConfirmIncident,
}: SatelliteMapProps) {
  const layer = TILE_LAYERS[mapType] || TILE_LAYERS.satellite;

  const icons = useMemo(() => {
    const map = new Map<string, L.DivIcon>();
    markers.forEach((m) => {
      const isHigh = m.severity === "high";
      const isSelected = m.id === selectedMarkerId;
      map.set(m.id, createPinIcon(m.color, isHigh, isSelected));
    });
    return map;
  }, [markers, selectedMarkerId]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      maxZoom={layer.maxZoom}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", minHeight: "560px" }}
      className="z-0"
    >
      <TileLayer
        key={mapType}
        url={layer.url}
        attribution={layer.attribution}
        maxZoom={layer.maxZoom}
      />

      <MapController center={center} zoom={zoom} />

      {markers.map((m) => {
        const icon = icons.get(m.id);
        return (
          <Marker
            key={m.id}
            position={m.position}
            icon={icon!}
            eventHandlers={{
              click: () => onSelectMarker?.(m),
            }}
          >
            <Tooltip direction="top" offset={[0, -25]} opacity={0.95}>
              <div className="text-xs font-bold text-gray-900">
                {m.label}
              </div>
              <div className="text-[10px] text-gray-500">
                {m.district} &middot; {m.time}
              </div>
            </Tooltip>

            <Popup className="custom-incident-popup">
              <div className="p-1 max-w-xs space-y-2 text-left">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: m.color }}
                  >
                    {m.category}
                  </span>

                  {m.severity === "high" && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700">
                      Critique
                    </span>
                  )}
                  {m.severity === "medium" && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-700">
                      Modéré
                    </span>
                  )}
                  {m.severity === "low" && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                      Faible
                    </span>
                  )}

                  {m.status === "verified" && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Vérifié
                    </span>
                  )}
                  {m.status === "pending" && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                      En cours
                    </span>
                  )}
                  {m.status === "resolved" && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                      Résolu
                    </span>
                  )}
                </div>

                {/* Titre */}
                <h4 className="text-sm font-bold text-gray-950 leading-snug">
                  {m.label}
                </h4>

                {/* Localisation & Date */}
                <p className="text-xs text-gray-600 font-medium">
                  📍 {m.district}
                </p>
                <p className="text-[11px] text-gray-400">
                  {m.time}
                </p>

                {/* Description */}
                <p className="text-xs text-gray-700 leading-relaxed border-t border-gray-100 pt-2">
                  {m.description}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs">
                  <span className="text-gray-500 text-[11px]">
                    {m.confirmations} témoins
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfirmIncident?.(m.id);
                    }}
                    className="inline-flex items-center gap-1 rounded bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 text-[11px] font-semibold transition"
                  >
                    +1 Confirmer
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
