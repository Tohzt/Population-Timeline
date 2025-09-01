import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./WorldMap.css";

interface Region {
	id: string;
	name: string;
	center: [number, number];
	zoom: number;
	geoJson?: any;
}

interface WorldMapProps {
	highlightedRegions?: string[];
	onRegionClick?: (regionId: string) => void;
}

// Component to handle map view changes
const MapController: React.FC<{
	selectedRegion: Region | null;
	onRegionSelect: (region: Region | null) => void;
}> = ({ selectedRegion, onRegionSelect }) => {
	const map = useMap();

	useEffect(() => {
		if (selectedRegion) {
			map.setView(selectedRegion.center, selectedRegion.zoom);
		} else {
			map.setView([20, 0], 2); // World view
		}
	}, [selectedRegion, map]);

	return null;
};

const WorldMap: React.FC<WorldMapProps> = ({
	highlightedRegions = [],
	onRegionClick,
}) => {
	const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
	const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

	// Define major regions with their centers and zoom levels
	const regions: Region[] = [
		{
			id: "north-america",
			name: "North America",
			center: [45, -100],
			zoom: 4,
		},
		{
			id: "south-america",
			name: "South America",
			center: [-15, -60],
			zoom: 4,
		},
		{
			id: "europe",
			name: "Europe",
			center: [54, 15],
			zoom: 4,
		},
		{
			id: "africa",
			name: "Africa",
			center: [0, 20],
			zoom: 4,
		},
		{
			id: "asia",
			name: "Asia",
			center: [35, 100],
			zoom: 4,
		},
		{
			id: "australia",
			name: "Australia",
			center: [-25, 135],
			zoom: 4,
		},
	];

	const handleRegionClick = (regionId: string) => {
		const region = regions.find((r) => r.id === regionId);
		if (region) {
			setSelectedRegion(region);
		}
		if (onRegionClick) {
			onRegionClick(regionId);
		}
	};

	const handleBackToWorld = () => {
		setSelectedRegion(null);
	};

	const getRegionStyle = (regionId: string) => {
		const isHighlighted = highlightedRegions.includes(regionId);
		const isHovered = hoveredRegion === regionId;

		return {
			fillColor: isHighlighted ? "#ff6b6b" : isHovered ? "#74c0fc" : "#e9ecef",
			weight: 2,
			opacity: 1,
			color: "#495057",
			fillOpacity: 0.7,
		};
	};

	return (
		<div className="world-map-container">
			<h2>World Population Timeline</h2>

			{selectedRegion && (
				<div className="region-header">
					<button className="back-button" onClick={handleBackToWorld}>
						← Back to World View
					</button>
					<h3>{selectedRegion.name}</h3>
				</div>
			)}

			<div className="map-wrapper">
				<MapContainer
					center={[20, 0]}
					zoom={2}
					style={{ height: "500px", width: "100%" }}
					className="world-map"
				>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					/>

					<MapController
						selectedRegion={selectedRegion}
						onRegionSelect={setSelectedRegion}
					/>

					{/* Add clickable regions */}
					{regions.map((region) => (
						<div key={region.id}>
							{/* This would be replaced with actual GeoJSON data for each region */}
						</div>
					))}
				</MapContainer>
			</div>

			<div className="region-legend">
				<h3>Regions</h3>
				<div className="legend-items">
					{regions.map((region) => (
						<div
							key={region.id}
							className={`legend-item ${
								highlightedRegions.includes(region.id) ? "highlighted" : ""
							}`}
							onClick={() => handleRegionClick(region.id)}
							onMouseEnter={() => setHoveredRegion(region.id)}
							onMouseLeave={() => setHoveredRegion(null)}
						>
							<div
								className="legend-color"
								style={{
									backgroundColor: getRegionStyle(region.id).fillColor,
								}}
							/>
							<span>{region.name}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default WorldMap;
