/**
 * @fileoverview OpenFoodFactsService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import type { Result, NetworkError } from '../types/comprehensive';
import { logger } from '../utils/logger';
import { retryUtils } from '../utils/retryUtils';

// OpenFoodFacts API Configuration
const OPENFOODFACTS_CONFIG = {
  baseUrl: 'https://world.openfoodfacts.org/api/v2',
  timeout: 10000,
  userAgent: 'GutSafe/1.0.0 (https://gutsafe.com)',
  maxRetries: 3,
  retryDelay: 1000,
};

// OpenFoodFacts Product Interface
export interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  brands?: string;
  categories?: string;
  ingredients_text?: string;
  allergens_tags?: string[];
  additives_tags?: string[];
  nutrition_grades?: string;
  image_url?: string;
  image_ingredients_url?: string;
  image_nutrition_url?: string;
  nutrition_data_per?: string;
  nutrition_data_prepared_per?: string;
  energy_kcal_100g?: number;
  fat_100g?: number;
  saturated_fat_100g?: number;
  carbohydrates_100g?: number;
  sugars_100g?: number;
  fiber_100g?: number;
  proteins_100g?: number;
  salt_100g?: number;
  sodium_100g?: number;
  nutriscore_grade?: string;
  ecoscore_grade?: string;
  nova_group?: number;
  labels_tags?: string[];
  categories_tags?: string[];
  countries_tags?: string[];
  stores_tags?: string[];
  traces_tags?: string[];
  packaging_tags?: string[];
  origins_tags?: string[];
  manufacturing_places_tags?: string[];
  purchase_places_tags?: string[];
  last_modified_t?: number;
  created_t?: number;
  last_updated_t?: number;
}

// Search Parameters Interface
export interface SearchParams {
  search_terms: string;
  page_size?: number;
  sort_by?: 'popularity' | 'created_t' | 'last_modified_t' | 'product_name';
  search_simple?: number;
  action?: string;
  json?: number;
}

// Search Response Interface
export interface SearchResponse {
  products: OpenFoodFactsProduct[];
  page: number;
  page_size: number;
  count: number;
  skip: number;
}

// Product Response Interface
export interface ProductResponse {
  status: number;
  status_verbose: string;
  product?: OpenFoodFactsProduct;
}

/**
 * OpenFoodFactsService - Dedicated service for OpenFoodFacts API integration
 * Provides optimized methods for product search and retrieval with caching and error handling
 */
class OpenFoodFactsService {
  private static instance: OpenFoodFactsService;
  private readonly cache: Map<string, { data: any; timestamp: number }> =
    new Map();
  private readonly cacheTimeout = 60 * 60 * 1000; // 1 hour

  private constructor() {}

  public static getInstance(): OpenFoodFactsService {
    if (!OpenFoodFactsService.instance) {
      OpenFoodFactsService.instance = new OpenFoodFactsService();
    }
    return OpenFoodFactsService.instance;
  }

  /**
   * Search for products by barcode
   */
  async getProductByBarcode(
    barcode: string
  ): Promise<Result<OpenFoodFactsProduct | null, NetworkError>> {
    try {
      const cacheKey = `product_${barcode}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return { success: true, data: cached as OpenFoodFactsProduct };
      }

      const result = await retryUtils.retryApiCall(
        () => this.fetchProductByBarcode(barcode),
        { maxAttempts: OPENFOODFACTS_CONFIG.maxRetries },
        'OpenFoodFactsService.getProductByBarcode'
      );

      if (result.success && result.data) {
        if (result.data.success && result.data.data) {
          this.setCachedData(cacheKey, result.data.data);
          return { success: true, data: result.data.data };
        } else {
          return { success: true, data: null };
        }
      } else {
        return {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: 'Failed to fetch product from OpenFoodFacts',
            details: { barcode },
            timestamp: new Date(),
          },
        };
      }
    } catch (error) {
      logger.error('Error getting product by barcode', 'OpenFoodFactsService', {
        barcode,
        error,
      });
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to fetch product from OpenFoodFacts',
          details: { barcode },
          timestamp: new Date(),
        },
      };
    }
  }

  /**
   * Search for products by name
   */
  async searchProducts(
    params: SearchParams
  ): Promise<Result<SearchResponse, NetworkError>> {
    try {
      const cacheKey = `search_${JSON.stringify(params)}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return { success: true, data: cached as SearchResponse };
      }

      const result = await retryUtils.retryApiCall(
        () => this.fetchSearchResults(params),
        { maxAttempts: OPENFOODFACTS_CONFIG.maxRetries },
        'OpenFoodFactsService.searchProducts'
      );

      if (result.success && result.data) {
        if (result.data.success && result.data.data) {
          this.setCachedData(cacheKey, result.data.data);
          return { success: true, data: result.data.data };
        } else {
          return {
            success: false,
            error: {
              code: 'NETWORK_ERROR',
              message: 'Failed to search products from OpenFoodFacts',
              details: { params },
              timestamp: new Date(),
            },
          };
        }
      } else {
        return {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: 'Failed to search products from OpenFoodFacts',
            details: { params },
            timestamp: new Date(),
          },
        };
      }
    } catch (error) {
      logger.error('Error searching products', 'OpenFoodFactsService', {
        params,
        error,
      });
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to search products from OpenFoodFacts',
          details: { params },
          timestamp: new Date(),
        },
      };
    }
  }

  /**
   * Get product categories
   */
  async getCategories(): Promise<Result<string[], NetworkError>> {
    try {
      const cacheKey = 'categories';
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return { success: true, data: cached as string[] };
      }

      const result = await retryUtils.retryApiCall(
        () => this.fetchCategories(),
        { maxAttempts: OPENFOODFACTS_CONFIG.maxRetries },
        'OpenFoodFactsService.getCategories'
      );

      if (result.success && result.data) {
        if (result.data.success && result.data.data) {
          this.setCachedData(cacheKey, result.data.data);
          return { success: true, data: result.data.data };
        } else {
          return {
            success: false,
            error: {
              code: 'NETWORK_ERROR',
              message: 'Failed to fetch categories from OpenFoodFacts',
              details: {},
              timestamp: new Date(),
            },
          };
        }
      } else {
        return {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: 'Failed to fetch categories from OpenFoodFacts',
            details: {},
            timestamp: new Date(),
          },
        };
      }
    } catch (error) {
      logger.error('Error getting categories', 'OpenFoodFactsService', {
        error,
      });
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to fetch categories from OpenFoodFacts',
          details: {},
          timestamp: new Date(),
        },
      };
    }
  }

  /**
   * Get product labels
   */
  async getLabels(): Promise<Result<string[], NetworkError>> {
    try {
      const cacheKey = 'labels';
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return { success: true, data: cached as string[] };
      }

      const result = await retryUtils.retryApiCall(
        () => this.fetchLabels(),
        { maxAttempts: OPENFOODFACTS_CONFIG.maxRetries },
        'OpenFoodFactsService.getLabels'
      );

      if (result.success && result.data) {
        if (result.data.success && result.data.data) {
          this.setCachedData(cacheKey, result.data.data);
          return { success: true, data: result.data.data };
        } else {
          return {
            success: false,
            error: {
              code: 'NETWORK_ERROR',
              message: 'Failed to fetch labels from OpenFoodFacts',
              details: {},
              timestamp: new Date(),
            },
          };
        }
      } else {
        return {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: 'Failed to fetch labels from OpenFoodFacts',
            details: {},
            timestamp: new Date(),
          },
        };
      }
    } catch (error) {
      logger.error('Error getting labels', 'OpenFoodFactsService', { error });
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to fetch labels from OpenFoodFacts',
          details: {},
          timestamp: new Date(),
        },
      };
    }
  }

  /**
   * Fetch product by barcode from API
   */
  private async fetchProductByBarcode(
    barcode: string
  ): Promise<Result<OpenFoodFactsProduct | null, NetworkError>> {
    try {
      const response = await fetch(
        `${OPENFOODFACTS_CONFIG.baseUrl}/product/${barcode}.json`,
        {
          signal: AbortSignal.timeout(OPENFOODFACTS_CONFIG.timeout),
          headers: {
            'User-Agent': OPENFOODFACTS_CONFIG.userAgent,
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        const networkError: NetworkError = {
          code: 'NETWORK_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          url: response.url,
          method: 'GET',
          timestamp: new Date(),
          details: { barcode },
        };
        return { success: false, error: networkError };
      }

      const data: ProductResponse = await response.json();
      const product = data.status === 1 ? data.product || null : null;

      logger.info('OpenFoodFacts product fetched', 'OpenFoodFactsService', {
        barcode,
        found: !!product,
        status: data.status,
      });

      return { success: true, data: product };
    } catch (error) {
      const networkError: NetworkError = {
        code: 'NETWORK_ERROR',
        message:
          error instanceof Error ? error.message : 'Network request failed',
        timestamp: new Date(),
        details: { barcode, error },
      };

      logger.error(
        'OpenFoodFacts product fetch failed',
        'OpenFoodFactsService',
        { barcode, error }
      );
      return { success: false, error: networkError };
    }
  }

  /**
   * Fetch search results from API
   */
  private async fetchSearchResults(
    params: SearchParams
  ): Promise<Result<SearchResponse, NetworkError>> {
    try {
      const searchParams = new URLSearchParams({
        search_terms: params.search_terms,
        search_simple: (params.search_simple || 1).toString(),
        action: params.action || 'process',
        json: (params.json || 1).toString(),
        page_size: (params.page_size || 20).toString(),
        sort_by: params.sort_by || 'popularity',
      });

      const response = await fetch(
        `${OPENFOODFACTS_CONFIG.baseUrl}/cgi/search.pl?${searchParams}`,
        {
          signal: AbortSignal.timeout(OPENFOODFACTS_CONFIG.timeout),
          headers: {
            'User-Agent': OPENFOODFACTS_CONFIG.userAgent,
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        const networkError: NetworkError = {
          code: 'NETWORK_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          url: response.url,
          method: 'GET',
          timestamp: new Date(),
          details: { params },
        };
        return { success: false, error: networkError };
      }

      const data: SearchResponse = await response.json();

      logger.info('OpenFoodFacts search completed', 'OpenFoodFactsService', {
        query: params.search_terms,
        results: data.products?.length || 0,
        total: data.count,
      });

      return { success: true, data };
    } catch (error) {
      const networkError: NetworkError = {
        code: 'NETWORK_ERROR',
        message:
          error instanceof Error ? error.message : 'Network request failed',
        timestamp: new Date(),
        details: { params, error },
      };

      logger.error('OpenFoodFacts search failed', 'OpenFoodFactsService', {
        params,
        error,
      });
      return { success: false, error: networkError };
    }
  }

  /**
   * Fetch categories from API
   */
  private async fetchCategories(): Promise<Result<string[], NetworkError>> {
    try {
      const response = await fetch(
        `${OPENFOODFACTS_CONFIG.baseUrl}/categories.json`,
        {
          signal: AbortSignal.timeout(OPENFOODFACTS_CONFIG.timeout),
          headers: {
            'User-Agent': OPENFOODFACTS_CONFIG.userAgent,
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        const networkError: NetworkError = {
          code: 'NETWORK_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          url: response.url,
          method: 'GET',
          timestamp: new Date(),
          details: {},
        };
        return { success: false, error: networkError };
      }

      const data = await response.json();
      const categories = Object.keys(data.tags || {});

      return { success: true, data: categories };
    } catch (error) {
      const networkError: NetworkError = {
        code: 'NETWORK_ERROR',
        message:
          error instanceof Error ? error.message : 'Network request failed',
        timestamp: new Date(),
        details: { error },
      };

      logger.error(
        'OpenFoodFacts categories fetch failed',
        'OpenFoodFactsService',
        { error }
      );
      return { success: false, error: networkError };
    }
  }

  /**
   * Fetch labels from API
   */
  private async fetchLabels(): Promise<Result<string[], NetworkError>> {
    try {
      const response = await fetch(
        `${OPENFOODFACTS_CONFIG.baseUrl}/labels.json`,
        {
          signal: AbortSignal.timeout(OPENFOODFACTS_CONFIG.timeout),
          headers: {
            'User-Agent': OPENFOODFACTS_CONFIG.userAgent,
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        const networkError: NetworkError = {
          code: 'NETWORK_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          url: response.url,
          method: 'GET',
          timestamp: new Date(),
          details: {},
        };
        return { success: false, error: networkError };
      }

      const data = await response.json();
      const labels = Object.keys(data.tags || {});

      return { success: true, data: labels };
    } catch (error) {
      const networkError: NetworkError = {
        code: 'NETWORK_ERROR',
        message:
          error instanceof Error ? error.message : 'Network request failed',
        timestamp: new Date(),
        details: { error },
      };

      logger.error(
        'OpenFoodFacts labels fetch failed',
        'OpenFoodFactsService',
        { error }
      );
      return { success: false, error: networkError };
    }
  }

  /**
   * Cache management
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('OpenFoodFacts cache cleared', 'OpenFoodFactsService');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.clearCache();
    logger.info('OpenFoodFactsService cleaned up', 'OpenFoodFactsService');
  }
}

export default OpenFoodFactsService;
