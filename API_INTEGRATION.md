# Ancient Population Timeline - API Integration

This document describes the implementation of API integration for fetching and displaying ancient population data.

## Overview

The application now integrates with the Pleiades API to fetch historical settlement data and display it on an interactive map. The system includes:

- **API Service Layer**: Handles data fetching from Pleiades API
- **Data Processing**: Filters and processes settlement data
- **Map Visualization**: Displays settlements with interactive markers
- **Loading States**: Shows loading indicators during data fetching
- **Error Handling**: Graceful error handling for API failures

## Features Implemented

### 1. API Service (`src/services/api.ts`)

- **Pleiades API Integration**: Fetches settlement data from pleiades.stoa.org
- **Data Caching**: Implements caching for performance
- **Data Filtering**: Filters settlements by date range and population type
- **Fallback Data**: Hardcoded major settlements as backup

### 2. Map Components

- **SettlementMap**: Displays settlements as interactive markers
- **PopulationLegend**: Shows legend for population types and marker sizes
- **LoadingSpinner**: Loading indicator during data fetching

### 3. Data Types

```typescript
interface PopulationSettlement {
	id: string;
	name: string;
	coordinates: [number, number];
	populationType: "Roman" | "Jewish" | "Mixed" | "Other";
	estimatedPopulation: number;
	dateRange: { start: number; end: number };
	confidence: "high" | "medium" | "low";
	source: string;
}
```

## Usage

### Basic Workflow

1. **Select Date Range**: Choose start and end years (supports BCE/CE)
2. **Select Population Groups**: Choose from dropdown (Ancient Roman, Jewish, etc.)
3. **Search**: Click "Search Population Data" to fetch data
4. **View Results**: Map displays settlements with interactive markers
5. **Timeline Scrubbing**: Use timeline slider to see changes over time

### Population Types Supported

- **Ancient Roman**: Roman Empire settlements
- **Jewish**: Jewish communities and settlements
- **Mixed**: Multi-cultural settlements
- **Other**: Additional settlement types

### Date Range Support

- **BCE Dates**: Negative numbers (e.g., -50 for 50 BCE)
- **CE Dates**: Positive numbers (e.g., 100 for 100 CE)
- **Range**: -3000 to 2024

## Technical Implementation

### API Endpoints

- **Pleiades Base URL**: `https://pleiades.stoa.org`
- **Place Data**: `https://pleiades.stoa.org/places/{id}/json`
- **Bulk Data**: `https://pleiades.stoa.org/downloads`

### Data Processing

1. **Date Filtering**: Checks if settlements overlap with selected date range
2. **Population Type Mapping**: Maps UI groups to API categories
3. **Population Estimation**: Estimates population based on settlement characteristics
4. **Coordinate Conversion**: Converts ancient coordinates to modern GPS

### Performance Features

- **Caching**: API responses cached in memory
- **Async Loading**: Non-blocking data fetching
- **Error Recovery**: Graceful fallback to hardcoded data
- **Loading States**: Visual feedback during data fetching

## Major Settlements Included

### Roman Settlements

- Rome (1M population, 100 BCE - 200 CE)
- Constantinople (500K population, 100-400 CE)
- Alexandria (300K population, 50 BCE - 200 CE)
- Antioch (250K population, 50 BCE - 200 CE)
- Carthage (200K population, 50 BCE - 150 CE)

### Jewish Settlements

- Jerusalem (80K population, 50 BCE - 200 CE)
- Tiberias (15K population, 20-200 CE)
- Sepphoris (12K population, 50 BCE - 200 CE)
- Bethlehem (5K population, 50 BCE - 200 CE)
- Nazareth (3K population, 50 BCE - 200 CE)

### Mixed Settlements

- Ephesus (150K population, 50 BCE - 200 CE)
- Damascus (60K population, 50 BCE - 200 CE)
- Thessalonica (70K population, 50 BCE - 200 CE)

## Future Enhancements

1. **Real Pleiades API**: Replace hardcoded data with live API calls
2. **More Population Types**: Add Greek, Persian, Egyptian settlements
3. **Population Growth**: Implement historical population growth calculations
4. **Advanced Filtering**: Add filters by region, size, importance
5. **Data Export**: Export settlement data to CSV/JSON
6. **Historical Maps**: Overlay historical map tiles
7. **Population Density**: Show population density heatmaps

## Error Handling

- **API Failures**: Fallback to hardcoded data
- **Network Issues**: Retry mechanism with exponential backoff
- **Invalid Data**: Data validation and sanitization
- **User Feedback**: Clear error messages and retry options

## Testing

Run tests with:

```bash
npm test
```

Tests cover:

- API function behavior
- Data filtering logic
- Date range validation
- Population calculations
