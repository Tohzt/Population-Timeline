import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { PopulationSettlement } from "../services/api";
import PopulationLegend from "./PopulationLegend";
import "leaflet/dist/leaflet.css";

interface SettlementMapProps {
	settlements: PopulationSettlement[];
	highlightedRegions?: string[];
	onRegionClick?: (regionId: string) => void;
}

const SettlementMap: React.FC<SettlementMapProps> = ({
	settlements,
	highlightedRegions = [],
	onRegionClick,
}) => {
	// Color mapping for population types
	const getPopulationTypeColor = (populationType: string): string => {
		switch (populationType) {
			case "Roman":
				return "#ff6b6b"; // Red
			case "Jewish":
				return "#4ecdc4"; // Teal
			case "Mixed":
				return "#45b7d1"; // Blue
			default:
				return "#96ceb4"; // Green
		}
	};

	// Calculate marker size based on population
	const getMarkerRadius = (population: number): number => {
		if (population >= 500000) return 20;
		if (population >= 100000) return 15;
		if (population >= 50000) return 12;
		if (population >= 10000) return 10;
		if (population >= 5000) return 8;
		return 6;
	};

	// Format population number
	const formatPopulation = (population: number): string => {
		if (population >= 1000000) {
			return `${(population / 1000000).toFixed(1)}M`;
		}
		if (population >= 1000) {
			return `${(population / 1000).toFixed(1)}K`;
		}
		return population.toString();
	};

	// Format date range
	const formatDateRange = (start: number, end: number): string => {
		const formatYear = (year: number) => {
			if (year < 0) return `${Math.abs(year)} BCE`;
			return `${year} CE`;
		};
		return `${formatYear(start)} - ${formatYear(end)}`;
	};

	return (
		<div className="settlement-map-container">
			<MapContainer
				center={[35, 25]} // Center on Mediterranean region
				zoom={4}
				style={{ height: "500px", width: "100%" }}
				className="settlement-map"
				zoomControl={true}
				scrollWheelZoom={true}
			>
				<TileLayer
					url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
				/>

				{settlements.map((settlement) => (
					<CircleMarker
						key={settlement.id}
						center={settlement.coordinates}
						radius={getMarkerRadius(settlement.estimatedPopulation)}
						fillColor={getPopulationTypeColor(settlement.populationType)}
						color={getPopulationTypeColor(settlement.populationType)}
						weight={2}
						opacity={0.8}
						fillOpacity={0.6}
						eventHandlers={{
							click: () => {
								if (onRegionClick) {
									onRegionClick(settlement.id);
								}
							},
						}}
					>
						<Popup>
							<div className="settlement-popup">
								<h3>{settlement.name}</h3>
								<div className="settlement-details">
									<p>
										<strong>Population:</strong>{" "}
										{formatPopulation(settlement.estimatedPopulation)}
									</p>
									<p>
										<strong>Type:</strong> {settlement.populationType}
									</p>
									<p>
										<strong>Period:</strong>{" "}
										{formatDateRange(
											settlement.dateRange.start,
											settlement.dateRange.end
										)}
									</p>
									<p>
										<strong>Confidence:</strong> {settlement.confidence}
									</p>
									<p>
										<strong>Source:</strong> {settlement.source}
									</p>
								</div>
							</div>
						</Popup>
					</CircleMarker>
				))}
			</MapContainer>

			<PopulationLegend settlements={settlements} visible={true} />
		</div>
	);
};

export default SettlementMap;
