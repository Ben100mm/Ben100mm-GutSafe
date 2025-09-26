# OpenFoodFacts Integration Setup

## Overview

This document describes the OpenFoodFacts integration setup for the GutSafe application. OpenFoodFacts is a free, open-source database of food products from around the world.

## Features

- **Free API**: No API key required
- **Comprehensive Data**: Product information, nutrition facts, ingredients, allergens, additives
- **Health Scores**: Nutri-Score, Eco-Score, NOVA group classification
- **Caching**: Built-in caching for improved performance
- **Error Handling**: Robust error handling with retry logic
- **TypeScript Support**: Full TypeScript support with type definitions

## API Endpoints Used

### Product Lookup by Barcode
```
GET https://world.openfoodfacts.org/api/v2/product/{barcode}.json
```

### Product Search by Name
```
GET https://world.openfoodfacts.org/api/v2/cgi/search.pl?search_terms={query}&json=1
```

### Categories
```
GET https://world.openfoodfacts.org/api/v2/categories.json
```

### Labels
```
GET https://world.openfoodfacts.org/api/v2/labels.json
```

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```bash
# OpenFoodFacts API (FREE - No API key required)
REACT_APP_OPENFOODFACTS_ENABLED=true
REACT_APP_OPENFOODFACTS_BASE_URL=https://world.openfoodfacts.org/api/v2
REACT_APP_OPENFOODFACTS_TIMEOUT=10000
REACT_APP_OPENFOODFACTS_USER_AGENT=GutSafe/1.0.0 (https://gutsafe.com)
```

### Dependencies

The following package is installed:
- `@openfoodfacts/openfoodfacts-nodejs`: Official OpenFoodFacts Node.js wrapper

## Usage

### Basic Usage

```typescript
import OpenFoodFactsService from './services/OpenFoodFactsService';

const openFoodFactsService = OpenFoodFactsService.getInstance();

// Search by barcode
const product = await openFoodFactsService.getProductByBarcode('1234567890');

// Search by name
const results = await openFoodFactsService.searchProducts({
  search_terms: 'chocolate bar',
  page_size: 10,
  sort_by: 'popularity'
});

// Get categories
const categories = await openFoodFactsService.getCategories();

// Get labels
const labels = await openFoodFactsService.getLabels();
```

### Integration with FoodService

The `FoodService` automatically uses OpenFoodFacts as the primary data source:

```typescript
import FoodService from './services/FoodService';

const foodService = FoodService.getInstance();

// Search by barcode (uses OpenFoodFacts first, then falls back to USDA)
const foodItem = await foodService.searchByBarcode('1234567890');

// Search by name (searches multiple sources including OpenFoodFacts)
const results = await foodService.searchByName('chocolate bar');
```

## Data Structure

### OpenFoodFacts Product

```typescript
interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  brands?: string;
  categories?: string;
  ingredients_text?: string;
  allergens_tags?: string[];
  additives_tags?: string[];
  image_url?: string;
  energy_kcal_100g?: number;
  fat_100g?: number;
  carbohydrates_100g?: number;
  proteins_100g?: number;
  nutriscore_grade?: string;
  ecoscore_grade?: string;
  nova_group?: number;
  labels_tags?: string[];
  categories_tags?: string[];
  countries_tags?: string[];
  // ... more fields
}
```

## Health Scores

### Nutri-Score
- **A**: Best nutritional quality
- **B**: Good nutritional quality
- **C**: Fair nutritional quality
- **D**: Poor nutritional quality
- **E**: Worst nutritional quality

### Eco-Score
- **A**: Best environmental impact
- **B**: Good environmental impact
- **C**: Fair environmental impact
- **D**: Poor environmental impact
- **E**: Worst environmental impact

### NOVA Group
- **1**: Unprocessed or minimally processed foods
- **2**: Processed culinary ingredients
- **3**: Processed foods
- **4**: Ultra-processed foods

## Caching

The service includes built-in caching:
- **Cache Duration**: 1 hour
- **Cache Keys**: Based on search parameters
- **Cache Management**: Automatic cleanup and statistics

## Error Handling

- **Network Errors**: Automatic retry with exponential backoff
- **Rate Limiting**: Built-in rate limiting protection
- **Timeout Handling**: Configurable timeouts
- **Fallback Strategy**: Falls back to other data sources if OpenFoodFacts fails

## Best Practices

1. **User Agent**: Always include a proper User-Agent header
2. **Rate Limiting**: Respect API rate limits (1 request per real user scan)
3. **Caching**: Use caching to reduce API calls
4. **Error Handling**: Implement proper error handling and fallbacks
5. **Data Validation**: Validate data before using it

## API Limits

- **No API Key Required**: Completely free
- **Rate Limiting**: 1 API call = 1 real user scan
- **No Scraping**: Full database exports available for bulk data
- **User Agent Required**: Must include User-Agent header

## Support

- **Documentation**: https://world.openfoodfacts.org/data
- **API Documentation**: https://world.openfoodfacts.org/api/v2/
- **Community**: https://world.openfoodfacts.org/
- **GitHub**: https://github.com/openfoodfacts/openfoodfacts-server

## License

OpenFoodFacts data is available under the Open Database License (ODbL).
