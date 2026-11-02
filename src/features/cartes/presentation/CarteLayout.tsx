"use client"

import { MapPin } from "lucide-react";
import { SatelliteMap } from "./carte";
import { points } from "../domain/data";


const categories = [
  { name: "Tous", color: "#6b7280" },
  { name: "Sécurité", color: "#e11d48" },
  { name: "Transport", color: "#2563eb" },
  { name: "Météo", color: "#f59e0b" },
  { name: "Événement", color: "#8b5cf6" },
  { name: "Santé", color: "#10b981" },
  { name: "Autres", color: "#6b7280" },
] as const;  

const categories1 = [
  { name: "Sécurité", color: "bg-rose-600" },
  { name: "Transport", color: "bg-blue-600" },
  { name: "Météo", color: "bg-amber-500" },
  { name: "Événement", color: "bg-violet-500" },
  { name: "Santé", color: "bg-emerald-500" },
  { name: "Autres", color: "bg-gray-500" },
] as const;   

export function CarteLayout() {
	return (
		<div className="flex flex-col items-center gap-6 w-full max-w-7xl mx-auto px-4 py-8">
			<div className="space-y-2">
				<div className="inline-flex items-center gap-2 rounded-full px-4 py-2">
					<MapPin size={18} className="text-rose-600" />
					<h1 className="text-xl font-bold text-gray-900">
						Carte des incidents
					</h1>
				</div>
				<p className="text-sm text-gray-500">
					Suivez les incidents en temps réel autour de vous
				</p>
			</div>
			<div className=" flex w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200">
				<SatelliteMap
					markers={points.map((p) => ({ ...p, position: [...p.position] }))}
					center={[-18.8792, 47.5079]}
					zoom={12}
				/>
				<div className="m-5 p-4">
					<h2 className="relative inline-block pb-1 mb-5 text-lg font-bold text-gray-950 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-5 after:border-b-2 after:border-red-600">Filtres</h2>
					<ul>
						{
							categories.map((value, index) => (
								<li
									key={index}
									className="relative flex items-center justify-between"
								>
									<div className="flex items-start gap-2">
										<input 
											type="checkbox" 
											className="mt-1.25 w-3 h-3 inline-block shrink-0 checked:bg-red-500 accent-red-500"
										/>
										<div>
											<p className="text-md">{value.name}</p>
										</div>
									</div>
								</li>
							))
						}
					</ul>
					<button type="button" className="bg-red-600 w-full text-white p-2 rounded-md mt-5">
						Actualiser
					</button>
				</div>
			</div>
			<div className=" flex">
					<ul className="flex">
						{
							categories1.map((incident, index) => (
								<li
									key={index}
									className="relative flex items-center justify-between pb-2 mt-5"
								>
									<div className="flex items-start gap-2 m-2 bg-gray-200 p-2 rounded-md">
										<span
											className={`mt-1.25 inline-block h-2 w-2 shrink-0 rounded-full ${incident.color}`}
										/>
										<div>
											<p className="text-sm font-medium">
												{incident.name}
											</p>
										</div>
									</div>
								</li>
							))
						}
					</ul>
				</div>
		</div>
	);
}   