import React, { useState } from "react";
import "./App.css";
import AdvancedWorldMap from "./components/AdvancedWorldMap";

function App() {
	const [highlightedRegions, setHighlightedRegions] = useState<string[]>([]);

	const handleRegionClick = (regionId: string) => {
		setHighlightedRegions((prev) => {
			if (prev.includes(regionId)) {
				return prev.filter((id) => id !== regionId);
			} else {
				return [...prev, regionId];
			}
		});
	};

	return (
		<div className="App">
			<AdvancedWorldMap
				highlightedRegions={highlightedRegions}
				onRegionClick={handleRegionClick}
			/>
		</div>
	);
}

export default App;
