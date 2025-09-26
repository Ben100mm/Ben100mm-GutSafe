/**
 * @fileoverview linking.ts - Deep Linking Configuration
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

// Deep linking configuration
export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'gutsafe://', // Custom scheme for mobile
    'https://gutsafe.app', // Web URL
    'https://www.gutsafe.app', // Web URL with www
  ],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Summary: {
            path: '/summary',
            parse: {
              // Parse query parameters if needed
              date: (date: string) => new Date(date),
            },
          },
          Scan: {
            path: '/scan',
            screens: {
              Scanner: {
                path: '/scanner',
                parse: {
                  // Parse barcode parameter
                  barcode: (barcode: string) => barcode,
                },
              },
            },
          },
          Browse: {
            path: '/browse',
            parse: {
              // Parse search and filter parameters
              search: (search: string) => search,
              category: (category: string) => category,
              filter: (filter: string) => filter,
            },
          },
          Analytics: {
            path: '/analytics',
            parse: {
              // Parse date range parameters
              startDate: (date: string) => new Date(date),
              endDate: (date: string) => new Date(date),
              period: (period: string) => period,
            },
          },
        },
      },
      Scanner: {
        path: '/scanner',
        parse: {
          barcode: (barcode: string) => barcode,
          mode: (mode: string) => mode,
        },
      },
      ScanHistory: {
        path: '/scan-history',
        parse: {
          // Parse filter parameters
          date: (date: string) => new Date(date),
          status: (status: string) => status,
        },
      },
      ScanDetail: {
        path: '/scan-detail/:scanId',
        parse: {
          scanId: (scanId: string) => scanId,
        },
      },
      SafeFoods: {
        path: '/safe-foods',
        parse: {
          category: (category: string) => category,
          search: (search: string) => search,
        },
      },
      GutProfile: {
        path: '/gut-profile',
        parse: {
          section: (section: string) => section,
        },
      },
      Onboarding: {
        path: '/onboarding',
        parse: {
          step: (step: string) => parseInt(step, 10),
        },
      },
    },
  },
  // Custom URL handling
  async getInitialURL() {
    // Handle app launch from deep link
    const url = await import('react-native').then(({ Linking }) => 
      Linking.getInitialURL()
    );
    
    if (url != null) {
      return url;
    }

    // Handle web URL
    if (typeof window !== 'undefined' && window.location) {
      const { pathname, search, hash } = window.location;
      return pathname + search + hash;
    }

    return null;
  },
  subscribe(listener) {
    // Handle deep link while app is running
    const onReceiveURL = ({ url }: { url: string }) => listener(url);

    // Listen to incoming links from deep linking
    const subscription = import('react-native').then(({ Linking }) =>
      Linking.addEventListener('url', onReceiveURL)
    );

    // Handle web URL changes
    if (typeof window !== 'undefined' && window.location) {
      const handleWebURL = () => {
        const { pathname, search, hash } = window.location;
        listener(pathname + search + hash);
      };

      window.addEventListener('popstate', handleWebURL);
      
      return () => {
        window.removeEventListener('popstate', handleWebURL);
        subscription.then(sub => sub?.remove());
      };
    }

    return () => {
      subscription.then(sub => sub?.remove());
    };
  },
};

// Helper functions for generating deep links
export const DeepLinkGenerator = {
  // Generate scan deep link
  generateScanLink: (barcode?: string) => {
    const baseUrl = 'gutsafe://scan';
    return barcode ? `${baseUrl}?barcode=${encodeURIComponent(barcode)}` : baseUrl;
  },

  // Generate scan detail deep link
  generateScanDetailLink: (scanId: string) => {
    return `gutsafe://scan-detail/${encodeURIComponent(scanId)}`;
  },

  // Generate browse deep link
  generateBrowseLink: (search?: string, category?: string) => {
    const baseUrl = 'gutsafe://browse';
    const params = new URLSearchParams();
    
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  },

  // Generate analytics deep link
  generateAnalyticsLink: (startDate?: Date, endDate?: Date, period?: string) => {
    const baseUrl = 'gutsafe://analytics';
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());
    if (period) params.append('period', period);
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  },

  // Generate safe foods deep link
  generateSafeFoodsLink: (category?: string, search?: string) => {
    const baseUrl = 'gutsafe://safe-foods';
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  },

  // Generate gut profile deep link
  generateGutProfileLink: (section?: string) => {
    const baseUrl = 'gutsafe://gut-profile';
    return section ? `${baseUrl}?section=${encodeURIComponent(section)}` : baseUrl;
  },

  // Generate onboarding deep link
  generateOnboardingLink: (step?: number) => {
    const baseUrl = 'gutsafe://onboarding';
    return step ? `${baseUrl}?step=${step}` : baseUrl;
  },
};

// Helper functions for handling deep links
export const DeepLinkHandler = {
  // Handle incoming deep link
  handleDeepLink: (url: string, navigation: any) => {
    try {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname;
      const params = Object.fromEntries(parsedUrl.searchParams);

      // Route based on path
      switch (path) {
        case '/scan':
          if (params.barcode) {
            navigation.navigate('Scanner', { barcode: params.barcode });
          } else {
            navigation.navigate('Scan');
          }
          break;
          
        case '/scan-detail':
          if (params.scanId) {
            navigation.navigate('ScanDetail', { scanId: params.scanId });
          }
          break;
          
        case '/browse':
          navigation.navigate('Browse', {
            search: params.search,
            category: params.category,
            filter: params.filter,
          });
          break;
          
        case '/analytics':
          navigation.navigate('Analytics', {
            startDate: params.startDate ? new Date(params.startDate) : undefined,
            endDate: params.endDate ? new Date(params.endDate) : undefined,
            period: params.period,
          });
          break;
          
        case '/safe-foods':
          navigation.navigate('SafeFoods', {
            category: params.category,
            search: params.search,
          });
          break;
          
        case '/gut-profile':
          navigation.navigate('GutProfile', {
            section: params.section,
          });
          break;
          
        case '/onboarding':
          navigation.navigate('Onboarding', {
            step: params.step ? parseInt(params.step, 10) : undefined,
          });
          break;
          
        default:
          // Default to summary
          navigation.navigate('Summary');
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
      // Fallback to summary
      navigation.navigate('Summary');
    }
  },

  // Check if URL is a valid deep link
  isValidDeepLink: (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'gutsafe:' || 
             parsedUrl.hostname === 'gutsafe.app' ||
             parsedUrl.hostname === 'www.gutsafe.app';
    } catch {
      return false;
    }
  },

  // Extract parameters from deep link
  extractParams: (url: string): Record<string, string> => {
    try {
      const parsedUrl = new URL(url);
      return Object.fromEntries(parsedUrl.searchParams);
    } catch {
      return {};
    }
  },
};

export default linkingConfig;
