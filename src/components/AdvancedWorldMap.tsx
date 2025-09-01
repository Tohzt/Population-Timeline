import React, { useState } from "react";
import {
	MapContainer,
	TileLayer,
	GeoJSON,
	useMap,
	Polygon,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./WorldMap.css";

interface WorldMapProps {
	highlightedRegions?: string[];
	onRegionClick?: (regionId: string) => void;
}

interface PopulationData {
	group: string;
	population: number;
	percentage: number;
	region: string;
	growth: number;
}

const AdvancedWorldMap: React.FC<WorldMapProps> = ({
	highlightedRegions = [],
	onRegionClick,
}) => {
	const [startYear, setStartYear] = useState(-50); // 50 BC
	const [endYear, setEndYear] = useState(100); // 100 CE
	const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
	const [showGroups, setShowGroups] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [currentTimelineDate, setCurrentTimelineDate] = useState("1500");

	// Comprehensive list of population groups (alphabetically ordered)
	const populationGroups = [
		"Aboriginal Australian",
		"African American",
		"Albanian",
		"American",
		"Amhara",
		"Ancient Egyptian",
		"Ancient Greek",
		"Ancient Roman",
		"Arab",
		"Argentine",
		"Armenian",
		"Ashanti",
		"Assyrian",
		"Australian",
		"Aztec",
		"Azerbaijani",
		"Bantu",
		"Basque",
		"Belarusian",
		"Bengali",
		"Berber",
		"Bosnian",
		"Brazilian",
		"British",
		"Bulgarian",
		"Buddhist",
		"Burmese",
		"Byzantine",
		"Cambodian",
		"Canadian",
		"Catalan",
		"Chilean",
		"Chinese",
		"Christian",
		"Colombian",
		"Croatian",
		"Cuban",
		"Czech",
		"Danish",
		"Dutch",
		"Ecuadorian",
		"English",
		"Estonian",
		"Fijian",
		"Filipino",
		"Finnish",
		"French",
		"Fulani",
		"Georgian",
		"German",
		"Greek",
		"Guatemalan",
		"Haitian",
		"Hausa",
		"Hawaiian",
		"Hindu",
		"Hmong",
		"Honduran",
		"Hungarian",
		"Igbo",
		"Inca",
		"Indian",
		"Indonesian",
		"Iranian",
		"Iraqi",
		"Irish",
		"Israeli",
		"Italian",
		"Japanese",
		"Jewish",
		"Jordanian",
		"Kikuyu",
		"Korean",
		"Kurdish",
		"Laotian",
		"Latvian",
		"Lebanese",
		"Lithuanian",
		"Macedonian",
		"Maasai",
		"Malay",
		"Mandinka",
		"Maori",
		"Maya",
		"Mexican",
		"Moldovan",
		"Mongol",
		"Muslim",
		"Nepali",
		"Nicaraguan",
		"Norwegian",
		"Oromo",
		"Ottoman",
		"Pakistani",
		"Palestinian",
		"Panamanian",
		"Papua New Guinean",
		"Paraguayan",
		"Peruvian",
		"Persian",
		"Phoenician",
		"Polish",
		"Portuguese",
		"Puerto Rican",
		"Romanian",
		"Russian",
		"Samoan",
		"Salvadoran",
		"Scottish",
		"Serbian",
		"Sikh",
		"Slovak",
		"Slovenian",
		"Somali",
		"Spanish",
		"Swahili",
		"Swedish",
		"Swiss",
		"Syrian",
		"Taoist",
		"Thai",
		"Tibetan",
		"Tongan",
		"Turkish",
		"Ukrainian",
		"Uruguayan",
		"Venezuelan",
		"Vietnamese",
		"Viking",
		"Welsh",
		"Yemeni",
		"Yoruba",
		"Zulu",
	];

	// Generate placeholder population data with zeros
	const generatePlaceholderData = (): PopulationData[] => {
		return selectedGroups.map((group, index) => ({
			group,
			population: 0,
			percentage: 0,
			region: "Unknown",
			growth: 0,
		}));
	};

	// Color palette for groups
	const groupColors = [
		"#ff6b6b",
		"#4ecdc4",
		"#45b7d1",
		"#96ceb4",
		"#feca57",
		"#ff9ff3",
		"#54a0ff",
		"#5f27cd",
		"#00d2d3",
		"#ff9f43",
		"#10ac84",
		"#ee5a24",
		"#2f3542",
		"#3742fa",
		"#ff6348",
		"#2ed573",
		"#1e90ff",
		"#ffa502",
		"#ff3838",
		"#ff9f43",
	];

	const getGroupColor = (groupIndex: number) => {
		return groupColors[groupIndex % groupColors.length];
	};

	const handleGroupToggle = (group: string) => {
		setSelectedGroups((prev) =>
			prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
		);
	};

	const handleSearch = () => {
		setIsSearching(true);
		setShowGroups(false);
		setCurrentTimelineDate(startYear.toString()); // Set to start year
	};

	const handleStop = () => {
		setIsSearching(false);
		setShowGroups(false);
		setSelectedGroups([]);
		setCurrentTimelineDate("1500");
	};

	const handleTimelineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setCurrentTimelineDate(event.target.value);
	};

	const formatYearForDisplay = (year: number) => {
		if (year < 0) {
			return `${Math.abs(year)} BC`;
		}
		return `${year} CE`;
	};

	const getStartYear = () => startYear;
	const getEndYear = () => endYear;

	const placeholderData = generatePlaceholderData();

	return (
		<div className="world-map-container">
			<h2>World Population Timeline</h2>

			<div className="controls-panel">
				<div className="controls-row">
					<div className="control-group">
						<label htmlFor="startYear">Start Year:</label>
						<input
							id="startYear"
							type="number"
							value={startYear}
							onChange={(e) => setStartYear(parseInt(e.target.value))}
							min="-3000"
							max="2024"
							placeholder="e.g., -50 for 50 BC"
						/>
					</div>

					<div className="control-group">
						<label htmlFor="endYear">End Year:</label>
						<input
							id="endYear"
							type="number"
							value={endYear}
							onChange={(e) => setEndYear(parseInt(e.target.value))}
							min="-3000"
							max="2024"
							placeholder="e.g., 100 for 100 CE"
						/>
					</div>

					<button
						className="toggle-groups-button"
						onClick={() => setShowGroups(!showGroups)}
					>
						{showGroups ? "Hide Groups" : "Show Groups"}
					</button>

					<button className="search-button" onClick={handleSearch}>
						Search Population Data
					</button>
				</div>

				{showGroups && (
					<div className="groups-section">
						<h3>Select Population Groups</h3>
						<div className="groups-grid">
							{populationGroups.map((group) => (
								<button
									key={group}
									className={`group-button ${
										selectedGroups.includes(group) ? "selected" : ""
									}`}
									onClick={() => handleGroupToggle(group)}
								>
									{group}
								</button>
							))}
						</div>
					</div>
				)}
			</div>

			{isSearching && (
				<div className="timeline-panel">
					<div className="timeline-controls">
						<div className="timeline-info">
							<strong>Current Year: {currentTimelineDate}</strong>
						</div>
						<div className="timeline-slider-container">
							<input
								type="range"
								min={getStartYear()}
								max={getEndYear()}
								value={currentTimelineDate}
								onChange={handleTimelineChange}
								className="timeline-slider"
							/>
							<div className="timeline-labels">
								<span>{getStartYear()}</span>
								<span>{getEndYear()}</span>
							</div>
						</div>
					</div>

					<div className="results-table-container">
						<h3>Population Data - Year {currentTimelineDate}</h3>
						<div className="results-table-wrapper">
							<table className="results-table">
								<thead>
									<tr>
										<th>Population Group</th>
										<th>Population</th>
										<th>Percentage</th>
										<th>Primary Region</th>
										<th>Growth Rate (%)</th>
									</tr>
								</thead>
								<tbody>
									{placeholderData.map((data, index) => (
										<tr key={index}>
											<td>
												<div className="group-cell">
													<div
														className="group-color-indicator"
														style={{ backgroundColor: getGroupColor(index) }}
													></div>
													<span>{data.group}</span>
												</div>
											</td>
											<td>{data.population.toLocaleString()}</td>
											<td>{data.percentage}%</td>
											<td>{data.region}</td>
											<td
												className={data.growth >= 0 ? "positive" : "negative"}
											>
												{data.growth >= 0 ? "+" : ""}
												{data.growth}%
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					<div className="stop-button-container">
						<button className="stop-button" onClick={handleStop}>
							Stop Search
						</button>
					</div>
				</div>
			)}

			<div className="map-wrapper">
				<MapContainer
					center={[20, 0]}
					zoom={2}
					style={{ height: "500px", width: "100%" }}
					className="world-map"
					zoomControl={true}
					scrollWheelZoom={true}
				>
					<TileLayer
						url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
					/>
				</MapContainer>
			</div>

			<div className="info-panel">
				<h3>Population Timeline Search</h3>
				<p>
					Select a date range and population groups to explore historical
					population movements and distributions throughout history.
				</p>
				<div className="search-info">
					<strong>Current Search:</strong>
					<br />
					{selectedGroups.length > 0 ? (
						<>
							{selectedGroups.join(", ")} from {formatYearForDisplay(startYear)}{" "}
							to {formatYearForDisplay(endYear)}
						</>
					) : (
						"No groups selected"
					)}
				</div>
			</div>
		</div>
	);
};

export default AdvancedWorldMap;
