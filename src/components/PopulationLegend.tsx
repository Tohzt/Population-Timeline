import React from "react";
import "./PopulationLegend.css";

interface PopulationLegendProps {
	settlements: any[];
	visible: boolean;
}

const PopulationLegend: React.FC<PopulationLegendProps> = ({
	settlements,
	visible,
}) => {
	if (!visible || settlements.length === 0) return null;

	// Get unique population types from settlements
	const populationTypes = Array.from(
		new Set(settlements.map((s) => s.populationType))
	).sort();

	const getPopulationTypeColor = (populationType: string): string => {
		switch (populationType) {
			case "Roman":
				return "#ff6b6b";
			case "Jewish":
				return "#4ecdc4";
			case "Mixed":
				return "#45b7d1";
			default:
				return "#96ceb4";
		}
	};

	const getPopulationTypeLabel = (populationType: string): string => {
		switch (populationType) {
			case "Roman":
				return "Roman Settlements";
			case "Jewish":
				return "Jewish Settlements";
			case "Mixed":
				return "Mixed Population";
			default:
				return "Other Settlements";
		}
	};

	return (
		<div className="population-legend">
			<h4>Population Types</h4>
			<div className="legend-items">
				{populationTypes.map((type) => (
					<div key={type} className="legend-item">
						<div
							className="legend-color"
							style={{ backgroundColor: getPopulationTypeColor(type) }}
						/>
						<span>{getPopulationTypeLabel(type)}</span>
					</div>
				))}
			</div>
			<div className="legend-size-info">
				<h5>Marker Size</h5>
				<div className="size-examples">
					<div className="size-example">
						<div className="size-dot large"></div>
						<span>500K+</span>
					</div>
					<div className="size-example">
						<div className="size-dot medium"></div>
						<span>50K-500K</span>
					</div>
					<div className="size-example">
						<div className="size-dot small"></div>
						<span>&lt;50K</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PopulationLegend;
