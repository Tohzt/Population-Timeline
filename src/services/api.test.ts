import { searchPleiadesPlaces, getPopulationData, isYearInRange } from "./api";

// Simple test to verify API functions
describe("API Functions", () => {
	test("isYearInRange should work correctly", () => {
		expect(isYearInRange(0, -50, 100)).toBe(true);
		expect(isYearInRange(-100, -50, 100)).toBe(false);
		expect(isYearInRange(200, -50, 100)).toBe(false);
	});

	test("searchPleiadesPlaces should return settlements", async () => {
		const settlements = await searchPleiadesPlaces(-50, 100, [
			"Roman",
			"Jewish",
		]);
		expect(settlements.length).toBeGreaterThan(0);
		expect(settlements[0]).toHaveProperty("id");
		expect(settlements[0]).toHaveProperty("name");
		expect(settlements[0]).toHaveProperty("coordinates");
	});

	test("getPopulationData should return population data", async () => {
		const data = await getPopulationData(
			["Ancient Roman", "Jewish"],
			-50,
			100,
			0
		);
		expect(data.length).toBeGreaterThan(0);
		expect(data[0]).toHaveProperty("group");
		expect(data[0]).toHaveProperty("population");
		expect(data[0]).toHaveProperty("settlements");
	});
});
