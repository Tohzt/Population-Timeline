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
	names?: string[];
	placeTypes?: string[];
}

// Interface for the actual Pleiades API response
export interface PleiadesApiResponse {
	id: string;
	title: string;
	description?: string;
	reprPoint?: [number, number]; // [longitude, latitude]
	bbox?: [number, number, number, number];
	names?: string[];
	placeTypes?: string[];
	type: string;
	uri?: string;
	creators?: Array<{
		username: string | null;
		name: string;
	}>;
	history?: Array<{
		comment: string;
		modifiedBy: string;
		modified: string;
	}>;
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

// Base API URLs - use the correct Pleiades API endpoints
const PLEIADES_BASE_URL = "https://pleiades.stoa.org";
const PLEIADES_PLACES_URL = `${PLEIADES_BASE_URL}/places`;

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
	// Handle names as simple strings, filtering out null/undefined values
	const names =
		place.names
			?.map((n) => {
				if (typeof n === "string") {
					return n.toLowerCase();
				}
				return "";
			})
			.join(" ") || "";

	const description = place.description?.toLowerCase() || "";
	const title = place.title?.toLowerCase() || "";

	const text = `${title} ${names} ${description}`;

	// Jewish settlements - check for Jewish-specific terms
	if (
		text.includes("jewish") ||
		text.includes("juda") ||
		text.includes("hebrew") ||
		text.includes("synagogue") ||
		text.includes("temple") ||
		text.includes("jerusalem") ||
		text.includes("bethlehem") ||
		text.includes("nazareth") ||
		text.includes("galilee") ||
		text.includes("judea") ||
		text.includes("samaria") ||
		text.includes("masada") ||
		text.includes("qumran") ||
		text.includes("essene") ||
		text.includes("pharisee") ||
		text.includes("sadducee")
	) {
		return "Jewish";
	}

	// Roman settlements - check for Roman-specific terms
	if (
		text.includes("roman") ||
		text.includes("rome") ||
		text.includes("imperial") ||
		text.includes("legion") ||
		text.includes("colonia") ||
		text.includes("forum") ||
		text.includes("amphitheater") ||
		text.includes("aqueduct") ||
		text.includes("bath") ||
		text.includes("temple") ||
		text.includes("basilica") ||
		text.includes("circus") ||
		text.includes("theater") ||
		text.includes("villa") ||
		text.includes("domus") ||
		text.includes("insula") ||
		text.includes("pompeii") ||
		text.includes("herculaneum") ||
		text.includes("ostia") ||
		text.includes("constantinople") ||
		text.includes("byzantium")
	) {
		return "Roman";
	}

	// Mixed settlements - places with both Roman and Jewish influence
	if (
		(text.includes("roman") && text.includes("jewish")) ||
		text.includes("mixed") ||
		text.includes("diverse") ||
		text.includes("cosmopolitan") ||
		text.includes("alexandria") || // Known for diverse population
		text.includes("antioch") || // Known for diverse population
		text.includes("ephesus") || // Known for diverse population
		text.includes("damascus") || // Known for diverse population
		text.includes("thessalonica") // Known for diverse population
	) {
		return "Mixed";
	}

	// Check place types for additional clues
	const placeTypes = place.placeTypes || [];
	if (placeTypes.includes("settlement") || placeTypes.includes("city")) {
		// If it's a major settlement in the Roman period, likely Roman
		if (text.includes("ancient") || text.includes("classical")) {
			return "Roman";
		}
	}

	return "Other";
};

// Helper function to get population from API data
const getPopulationFromApi = (place: PleiadesPlace, apiData?: any): number => {
	// Return 0 if no population data available from API
	return 0;
};

// Fetch place data from Pleiades API
export const fetchPleiadesPlace = async (
	placeId: string
): Promise<PleiadesApiResponse | null> => {
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
		// Use known place IDs to fetch major ancient cities
		const knownPlaceIds = [
			"423025", // Rome
			"687928", // Jerusalem
			"727070", // Alexandria
			"658430", // Antioch
			"599612", // Ephesus
		];

		const settlements: PopulationSettlement[] = [];

		// Fetch each place individually
		for (const placeId of knownPlaceIds) {
			try {
				const placeData = await fetchPleiadesPlace(placeId);
				if (placeData && placeData.reprPoint) {
					// Convert Pleiades place to our settlement format
					const pleiadesPlace: PleiadesPlace = {
						id: placeData.id,
						title: placeData.title,
						description: placeData.description,
						representativePoint: placeData.reprPoint
							? {
									coordinates: [placeData.reprPoint[1], placeData.reprPoint[0]],
							  }
							: undefined,
						bbox: placeData.bbox,
						temporalBounds: undefined, // We'll estimate based on the place
						names: placeData.names,
						placeTypes: undefined,
					};

					// Use default date range since API doesn't provide temporal data
					let placeStartYear = startYear;
					let placeEndYear = endYear;

					// Check if place overlaps with our date range
					const hasDateOverlap =
						isYearInRange(placeStartYear, startYear, endYear) ||
						isYearInRange(placeEndYear, startYear, endYear) ||
						(placeStartYear <= startYear && placeEndYear >= endYear);

					if (hasDateOverlap) {
						// Categorize population type
						const populationType = categorizePopulationType(pleiadesPlace);

						// Check if this population type matches what we're looking for
						const matchesPopulationType =
							populationTypes.length === 0 ||
							populationTypes.includes(populationType);

						if (matchesPopulationType && pleiadesPlace.representativePoint) {
							// Get population from API data
							const estimatedPopulation = getPopulationFromApi(
								pleiadesPlace,
								placeData
							);

							// Determine confidence level
							let confidence: "high" | "medium" | "low" = "medium";
							if (
								placeData.description?.includes("archaeological") ||
								placeData.description?.includes("excavated")
							) {
								confidence = "high";
							} else if (
								!placeData.description ||
								placeData.description.length < 50
							) {
								confidence = "low";
							}

							// Determine source
							let source = "Historical records";
							if (
								placeData.description?.includes("archaeological") ||
								placeData.description?.includes("excavated")
							) {
								source = "Archaeological evidence";
							}

							const settlement: PopulationSettlement = {
								id: pleiadesPlace.id,
								name: pleiadesPlace.title,
								coordinates: pleiadesPlace.representativePoint.coordinates,
								populationType,
								estimatedPopulation,
								dateRange: {
									start: placeStartYear,
									end: placeEndYear,
								},
								confidence,
								source,
							};

							settlements.push(settlement);
						}
					}
				}
			} catch (placeError) {
				console.error(`Error fetching place ${placeId}:`, placeError);
				// Continue with other places
			}
		}

		return settlements;
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

			// Calculate growth rate based on settlement data
			let growth = 0;

			// Determine primary region based on settlement distribution
			let region = "Unknown";
			if (groupSettlements.length > 0) {
				const regions = groupSettlements.map((s) => {
					// Simple region mapping based on coordinates
					if (s.coordinates[0] > 40) return "Northern Europe";
					if (s.coordinates[0] > 35) return "Mediterranean";
					if (s.coordinates[0] > 30) return "Levant";
					return "North Africa";
				});
				const regionCounts = regions.reduce((acc, region) => {
					acc[region] = (acc[region] || 0) + 1;
					return acc;
				}, {} as { [key: string]: number });
				region = Object.keys(regionCounts).reduce((a, b) =>
					regionCounts[a] > regionCounts[b] ? a : b
				);
			}

			return {
				group,
				population,
				percentage:
					totalPopulation > 0 ? (population / totalPopulation) * 100 : 0,
				region,
				growth,
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
