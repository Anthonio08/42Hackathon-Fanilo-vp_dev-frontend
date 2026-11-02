"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapMarker = {
  id: string | number;
  position: [number, number];
  label: string;
  description?: string;
  color: string;
  size?: number;
};   

function createPinIcon(color: string, size = 32) {
	const html = `
		<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.3}"
			viewBox="0 0 24 31" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,.5));">
		<path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 19 12 19s12-10 12-19C24 5.4 18.6 0 12 0z"
				fill="${color}" stroke="white" stroke-width="1.5"/>
		<circle cx="12" cy="12" r="4.5" fill="white"/>
		</svg>`;

	return L.divIcon({
		html,
		className: "",
		iconSize: [size, size * 1.3],
		iconAnchor: [size / 2, size * 1.3],
		popupAnchor: [0, -size * 1.2],
		tooltipAnchor: [size / 2, -size * 0.6],
	});
}

const MARKERS: MapMarker[] = [
	{ id: 1, position: [51.505, -0.09], label: "Point rouge", color: "#e11d48" },
	{ id: 2, position: [51.51, -0.1], label: "Point bleu", color: "#2563eb" },
	{ id: 3, position: [51.5, -0.12], label: "Point vert", color: "#16a34a" },
	{ id: 4, position: [51.515, -0.08], label: "Point orange", color: "#f97316", size: 40 },
	{ id: 5, position: [51.498, -0.07], label: "Point violet", color: "#9333ea" },
	{ id: 6, position: [51.52, -0.11], label: "Point jaune", color: "#eab308", description: "Avec une description" },
];

type Props = {
	markers?: MapMarker[];
	center?: [number, number];
	zoom?: number;
};

export function SatelliteMap({
	markers = MARKERS,
	center = [51.505, -0.09],
	zoom = 13,
}: Props) {
	const icons = useMemo(
		() => new Map(markers.map((m) => [m.id, createPinIcon(m.color, m.size)])),
		[markers]
	);

	return (
		<MapContainer center={center} zoom={zoom} maxZoom={18} style={{ height: "50vh", width: "100%" }}>
			<TileLayer
				url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
				attribution="Tiles &copy; Esri"
				maxZoom={18}
			/>

			{markers.map((m) => (
				<Marker key={m.id} position={m.position} icon={icons.get(m.id)!}>
					<Tooltip>{m.label}</Tooltip>
					<Popup>
						<strong>{m.label}</strong>
						{m.description && <p style={{ margin: "4px 0 0" }}>{m.description}</p>}
					</Popup>
				</Marker>
			))}
		</MapContainer>
	);
}