// API service for fetching ancient population data from Pleiades
export interface PleiadesPlace {
	id: string;
	title: string;
	description?: string;
	representativePoint?: {
		coordinates: [number, number];
	};
	bbox?: [number, number, number, number];
	temporalBounds?: {
		start?: {
			year?: number;
		};
		end?: {
			year?: number;
		};
	};
	names?: Array<{
		romanized?: string;
		language?: string;
	}>;
	placeTypes?: string[];
	culturalContext?: string[];
}

export interface PopulationSettlement {
	id: string;
	name: string;
	coordinates: [number, number];
	populationType: "Roman" | "Jewish" | "Mixed" | "Other";
	estimatedPopulation: number;
	dateRange: {
		start: number; // BCE/CE year
		end: number;
	};
	confidence: "high" | "medium" | "low";
	source: string;
}

export interface PopulationData {
	group: string;
	population: number;
	percentage: number;
	region: string;
	growth: number;
	settlements: PopulationSettlement[];
}

// Cache for API responses
const cache = new Map<string, any>();

// Base API URLs
const PLEIADES_BASE_URL = "https://pleiades.stoa.org";
const PLEIADES_PLACES_URL = `${PLEIADES_BASE_URL}/places`;

// Hardcoded major settlements data as fallback
const MAJOR_SETTLEMENTS: PopulationSettlement[] = [
	// Roman settlements
	{
		id: "rome",
		name: "Rome",
		coordinates: [41.9028, 12.4964],
		populationType: "Roman",
		estimatedPopulation: 1000000,
		dateRange: { start: -100, end: 200 },
		confidence: "high",
		source: "Historical records",
	},
	{
		id: "constantinople",
		name: "Constantinople",
		coordinates: [41.0082, 28.9784],
		populationType: "Roman",
		estimatedPopulation: 500000,
		dateRange: { start: 100, end: 400 },
		confidence: "high",
		source: "Historical records",
	},
	{
		id: "alexandria",
		name: "Alexandria",
		coordinates: [31.2001, 29.9187],
		populationType: "Mixed",
		estimatedPopulation: 300000,
		dateRange: { start: -50, end: 200 },
		confidence: "high",
		source: "Historical records",
	},
	{
		id: "antioch",
		name: "Antioch",
		coordinates: [36.2021, 36.1613],
		populationType: "Mixed",
		estimatedPopulation: 250000,
		dateRange: { start: -50, end: 200 },
		confidence: "high",
		source: "Historical records",
	},
	{
		id: "carthage",
		name: "Carthage",
		coordinates: [36.8519, 10.3308],
		populationType: "Roman",
		estimatedPopulation: 200000,
		dateRange: { start: -50, end: 150 },
		confidence: "medium",
		source: "Archaeological evidence",
	},
	{
		id: "ephesus",
		name: "Ephesus",
		coordinates: [37.9411, 27.3414],
		populationType: "Mixed",
		estimatedPopulation: 150000,
		dateRange: { start: -50, end: 200 },
		confidence: "high",
		source: "Historical records",
	},
	{
		id: "corinth",
		name: "Corinth",
		coordinates: [37.9059, 22.8797],
		populationType: "Roman",
		estimatedPopulation: 100000,
		dateRange: { start: -50, end: 150 },
		confidence: "medium",
		source: "Archaeological evidence",
	},
	{
		id: "athens",
		name: "Athens",
		coordinates: [37.9838, 23.7275],
		populationType: "Roman",
		estimatedPopulation: 80000,
		dateRange: { start: -50, end: 200 },
		confidence: "medium",
		source: "Historical records",
	},
	{
		id: "thessalonica",
		name: "Thessalonica",
		coordinates: [40.6401, 22.9444],
		populationType: "Mixed",
		estimatedPopulation: 70000,
		dateRange: { start: -50, end: 200 },
		confidence: "medium",
		source: "Historical records",
	},
	{
		id: "damascus",
		name: "Damascus",
		coordinates: [33.5138, 36.2765],
		populationType: "Mixed",
		estimatedPopulation: 60000,
		dateRange: { start: -50, end: 200 },
		confidence: "medium",
		source: "Historical records",
	},
	// Jewish settlements
	{
		id: "jerusalem",
		name: "Jerusalem",
		coordinates: [31.7683, 35.2137],
		populationType: "Jewish",
		estimatedPopulation: 80000,
		dateRange: { start: -50, end: 200 },
		confidence: "high",
		source: "Historical records",
	},
	{
		id: "bethlehem",
		name: "Bethlehem",
		coordinates: [31.7054, 35.2024],
		populationType: "Jewish",
		estimatedPopulation: 5000,
		dateRange: { start: -50, end: 200 },
		confidence: "medium",
		source: "Historical records",
	},
	{
		id: "nazareth",
		name: "Nazareth",
		coordinates: [32.6996, 35.3035],
		populationType: "Jewish",
		estimatedPopulation: 3000,
		dateRange: { start: -50, end: 200 },
		confidence: "medium",
		source: "Historical records",
	},
	{
		id: "capernaum",
		name: "Capernaum",
		coordinates: [32.8805, 35.5731],
		populationType: "Jewish",
		estimatedPopulation: 2000,
		dateRange: { start: -50, end: 200 },
		confidence: "medium",
		source: "Archaeological evidence",
	},
	{
		id: "tiberias",
		name: "Tiberias",
		coordinates: [32.794, 35.532],
		populationType: "Jewish",
		estimatedPopulation: 15000,
		dateRange: { start: 20, end: 200 },
		confidence: "high",
		source: "Historical records",
	},
	{
		id: "sepphoris",
		name: "Sepphoris",
		coordinates: [32.7469, 35.2794],
		populationType: "Jewish",
		estimatedPopulation: 12000,
		dateRange: { start: -50, end: 200 },
		confidence: "medium",
		source: "Archaeological evidence",
	},
	{
		id: "jericho",
		name: "Jericho",
		coordinates: [31.8594, 35.4607],
		populationType: "Jewish",
		estimatedPopulation: 8000,
		dateRange: { start: -50, end: 200 },
		confidence: "medium",
		source: "Historical records",
	},
	{
		id: "hebron",
		name: "Hebron",
		coordinates: [31.5326, 35.0998],
		populationType: "Jewish",
		estimatedPopulation: 6000,
		dateRange: { start: -50, end: 200 },
		confidence: "medium",
		source: "Historical records",
	},
	{
		id: "safed",
		name: "Safed",
		coordinates: [32.9646, 35.496],
		populationType: "Jewish",
		estimatedPopulation: 4000,
		dateRange: { start: -50, end: 200 },
		confidence: "low",
		source: "Historical records",
	},
	{
		id: "tiberias-galilee",
		name: "Galilee Region",
		coordinates: [32.794, 35.532],
		populationType: "Jewish",
		estimatedPopulation: 50000,
		dateRange: { start: -50, end: 200 },
		confidence: "medium",
		source: "Historical estimates",
	},
];

// Helper function to convert BCE/CE years
export const convertYear = (year: number): number => {
	// Negative years are BCE, positive are CE
	return year;
};

// Helper function to check if a year is within a date range
export const isYearInRange = (
	year: number,
	startYear: number,
	endYear: number
): boolean => {
	return year >= startYear && year <= endYear;
};

// Helper function to categorize population type based on place data
const categorizePopulationType = (
	place: PleiadesPlace
): "Roman" | "Jewish" | "Mixed" | "Other" => {
	const names =
		place.names?.map((n) => n.romanized?.toLowerCase() || "").join(" ") || "";
	const description = place.description?.toLowerCase() || "";
	const culturalContext = place.culturalContext?.join(" ").toLowerCase() || "";

	const text = `${names} ${description} ${culturalContext}`;

	if (text.includes("roman") || text.includes("rome")) {
		return "Roman";
	}
	if (
		text.includes("jewish") ||
		text.includes("juda") ||
		text.includes("hebrew")
	) {
		return "Jewish";
	}
	if (
		(text.includes("roman") && text.includes("jewish")) ||
		text.includes("mixed") ||
		text.includes("diverse")
	) {
		return "Mixed";
	}

	return "Other";
};

// Helper function to estimate population based on settlement characteristics
const estimatePopulation = (place: PleiadesPlace): number => {
	// This is a simplified estimation - in a real app, you'd have more sophisticated logic
	const description = place.description?.toLowerCase() || "";

	if (
		description.includes("major") ||
		description.includes("capital") ||
		description.includes("large")
	) {
		return Math.floor(Math.random() * 200000) + 100000; // 100k-300k
	}
	if (description.includes("city") || description.includes("urban")) {
		return Math.floor(Math.random() * 50000) + 10000; // 10k-60k
	}
	if (description.includes("town") || description.includes("settlement")) {
		return Math.floor(Math.random() * 10000) + 1000; // 1k-11k
	}

	return Math.floor(Math.random() * 5000) + 500; // 500-5.5k
};

// Fetch place data from Pleiades API
export const fetchPleiadesPlace = async (
	placeId: string
): Promise<PleiadesPlace | null> => {
	const cacheKey = `pleiades_place_${placeId}`;

	if (cache.has(cacheKey)) {
		return cache.get(cacheKey);
	}

	try {
		const response = await fetch(`${PLEIADES_PLACES_URL}/${placeId}/json`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		cache.set(cacheKey, data);
		return data;
	} catch (error) {
		console.error(`Error fetching Pleiades place ${placeId}:`, error);
		return null;
	}
};

// Search for places in a date range
export const searchPleiadesPlaces = async (
	startYear: number,
	endYear: number,
	populationTypes: string[]
): Promise<PopulationSettlement[]> => {
	try {
		// For now, we'll use the hardcoded data and filter it
		// In a full implementation, you'd make API calls to search Pleiades

		const filteredSettlements = MAJOR_SETTLEMENTS.filter((settlement) => {
			// Check if settlement overlaps with the date range
			const hasDateOverlap =
				isYearInRange(settlement.dateRange.start, startYear, endYear) ||
				isYearInRange(settlement.dateRange.end, startYear, endYear) ||
				(settlement.dateRange.start <= startYear &&
					settlement.dateRange.end >= endYear);

			// Check if population type matches selected types
			const matchesPopulationType =
				populationTypes.length === 0 ||
				populationTypes.includes(settlement.populationType);

			return hasDateOverlap && matchesPopulationType;
		});

		return filteredSettlements;
	} catch (error) {
		console.error("Error searching Pleiades places:", error);
		return [];
	}
};

// Get population data for selected groups and date range
export const getPopulationData = async (
	selectedGroups: string[],
	startYear: number,
	endYear: number,
	currentYear: number
): Promise<PopulationData[]> => {
	try {
		// Map population groups to Pleiades categories
		const populationTypeMap: { [key: string]: string[] } = {
			"Ancient Roman": ["Roman"],
			Jewish: ["Jewish"],
			"Ancient Greek": ["Other"], // Would need Greek-specific data
			Byzantine: ["Roman"], // Byzantine as continuation of Roman
			Christian: ["Mixed"], // Early Christian communities
			Muslim: ["Other"], // Would need Islamic-era data
		};

		const populationTypes = selectedGroups
			.map((group) => populationTypeMap[group] || ["Other"])
			.flat()
			.filter((type, index, arr) => arr.indexOf(type) === index); // Remove duplicates

		const allSettlements = await searchPleiadesPlaces(
			startYear,
			endYear,
			populationTypes
		);

		// Filter settlements to only include those active at the current year
		const currentSettlements = allSettlements.filter((settlement) =>
			isYearInRange(
				currentYear,
				settlement.dateRange.start,
				settlement.dateRange.end
			)
		);

		// Group settlements by population type and calculate totals
		const groupData: { [key: string]: PopulationSettlement[] } = {};

		currentSettlements.forEach((settlement) => {
			const group =
				settlement.populationType === "Roman"
					? "Ancient Roman"
					: settlement.populationType === "Jewish"
					? "Jewish"
					: "Other";

			if (!groupData[group]) {
				groupData[group] = [];
			}
			groupData[group].push(settlement);
		});

		// Calculate population data for each group
		const totalPopulation = currentSettlements.reduce(
			(sum, settlement) => sum + settlement.estimatedPopulation,
			0
		);

		return selectedGroups.map((group) => {
			const groupSettlements = groupData[group] || [];
			const population = groupSettlements.reduce(
				(sum, settlement) => sum + settlement.estimatedPopulation,
				0
			);

			return {
				group,
				population,
				percentage:
					totalPopulation > 0 ? (population / totalPopulation) * 100 : 0,
				region:
					groupSettlements.length > 0 ? groupSettlements[0].name : "Unknown",
				growth: 0, // Would need historical data to calculate growth
				settlements: groupSettlements,
			};
		});
	} catch (error) {
		console.error("Error getting population data:", error);
		return [];
	}
};

// Get settlements for map display
export const getSettlementsForMap = async (
	selectedGroups: string[],
	startYear: number,
	endYear: number,
	currentYear?: number
): Promise<PopulationSettlement[]> => {
	try {
		const populationTypeMap: { [key: string]: string[] } = {
			"Ancient Roman": ["Roman"],
			Jewish: ["Jewish"],
			"Ancient Greek": ["Other"],
			Byzantine: ["Roman"],
			Christian: ["Mixed"],
			Muslim: ["Other"],
		};

		const populationTypes = selectedGroups
			.map((group) => populationTypeMap[group] || ["Other"])
			.flat()
			.filter((type, index, arr) => arr.indexOf(type) === index);

		const allSettlements = await searchPleiadesPlaces(
			startYear,
			endYear,
			populationTypes
		);

		// If currentYear is provided, filter settlements to only show those active at that year
		if (currentYear !== undefined) {
			return allSettlements.filter((settlement) =>
				isYearInRange(
					currentYear,
					settlement.dateRange.start,
					settlement.dateRange.end
				)
			);
		}

		return allSettlements;
	} catch (error) {
		console.error("Error getting settlements for map:", error);
		return [];
	}
};
