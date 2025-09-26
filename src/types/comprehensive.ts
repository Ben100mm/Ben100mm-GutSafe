/**
 * @fileoverview comprehensive.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

// ===== CORE TYPE DEFINITIONS =====

// Basic Types
export type GutCondition =
  | 'ibs-fodmap'
  | 'gluten'
  | 'lactose'
  | 'reflux'
  | 'histamine'
  | 'allergies'
  | 'additives';

export type SeverityLevel = 'mild' | 'moderate' | 'severe';

export type ScanResult = 'safe' | 'caution' | 'avoid';

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  stack?: string;
}

export interface ValidationError extends AppError {
  code: 'VALIDATION_ERROR';
  field: string;
  value: unknown;
  expected: string;
}

export interface NetworkError extends AppError {
  code: 'NETWORK_ERROR';
  status?: number;
  url?: string;
  method?: string;
}

export interface DatabaseError extends AppError {
  code: 'DATABASE_ERROR';
  operation: string;
  table?: string;
  query?: string;
}

export interface ServiceError extends AppError {
  code: 'SERVICE_ERROR';
  service: string;
  operation: string;
}

// User Settings Types
export interface UserSettings {
  profile: UserProfile;
  preferences: UserPreferences;
  privacy: PrivacySettings;
  sync: SyncSettings;
  scanning?: {
    autoScan: boolean;
    hapticFeedback: boolean;
    soundEffects: boolean;
    flashOnScan: boolean;
    showDetailedAnalysis: boolean;
    includeAlternatives: boolean;
    cacheResults: boolean;
    offlineMode: boolean;
  };
  advanced?: {
    debugMode: boolean;
    experimentalFeatures: boolean;
    analyticsEnabled: boolean;
    crashReporting: boolean;
    performanceMonitoring: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
  };
}

export interface UserProfile {
  name?: string;
  email?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  gutProfile: GutProfile;
}

// Additional types that were missing
export interface GutProfile {
  id: string;
  conditions: {
    [K in GutCondition]: {
      enabled: boolean;
      severity: SeverityLevel;
      knownTriggers: string[];
    };
  };
  preferences: {
    dietaryRestrictions: string[];
    preferredAlternatives: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface GutSymptom {
  id: string;
  type:
    | 'bloating'
    | 'cramping'
    | 'diarrhea'
    | 'constipation'
    | 'gas'
    | 'nausea'
    | 'reflux'
    | 'fatigue'
    | 'headache'
    | 'skin_irritation'
    | 'other';
  severity: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; // 1-10 scale
  description?: string;
  duration: number; // minutes
  timestamp: Date;
  potentialTriggers?: string[];
  location?:
    | 'upper_abdomen'
    | 'lower_abdomen'
    | 'full_abdomen'
    | 'chest'
    | 'general';
}

export interface GutConditionToggle {
  condition: GutCondition;
  enabled: boolean;
  severity: SeverityLevel;
  knownTriggers: string[];
  lastUpdated: Date;
}

export interface MedicationSupplement {
  id: string;
  name: string;
  type:
    | 'medication'
    | 'supplement'
    | 'probiotic'
    | 'enzyme'
    | 'antacid'
    | 'other';
  dosage: string;
  frequency: 'daily' | 'twice_daily' | 'as_needed' | 'weekly' | 'monthly';
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  notes?: string;
  gutRelated: boolean;
  category?:
    | 'digestive_aid'
    | 'anti_inflammatory'
    | 'probiotic'
    | 'enzyme_support'
    | 'acid_control'
    | 'immune_support'
    | 'other';
}

export interface ScanAnalysis {
  overallSafety: ScanResult;
  flaggedIngredients: {
    ingredient: string;
    reason: string;
    severity: SeverityLevel;
    condition: GutCondition;
  }[];
  conditionWarnings: {
    ingredient: string;
    severity: SeverityLevel;
    condition: GutCondition;
  }[];
  safeAlternatives: string[];
  explanation: string;
  dataSource: string;
  lastUpdated: Date;
}

export interface ScanHistory {
  id: string;
  foodItem: FoodItem;
  analysis: ScanAnalysis;
  timestamp: Date;
  userFeedback?: 'accurate' | 'inaccurate';
}

export interface SymptomLog {
  id: string;
  symptoms: GutSymptom[];
  foodItems?: string[];
  timestamp?: Date;
  notes?: string;
  weather?: string;
  stressLevel?: number;
  sleepQuality?: number;
  exerciseLevel?: 'none' | 'light' | 'moderate' | 'intense';
  medicationTaken?: string[];
  tags?: string[];
}

export interface MedicationLog {
  id: string;
  medication: MedicationSupplement;
  takenAt: Date;
  dosage: string;
  notes?: string;
  sideEffects?: string[];
  effectiveness?: 1 | 2 | 3 | 4 | 5; // 1-5 scale
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  units: 'metric' | 'imperial';
  notifications: NotificationPreferences;
  haptics: HapticPreferences;
  accessibility: AccessibilityPreferences;
}

export interface NotificationPreferences {
  enabled: boolean;
  mealReminders: boolean;
  newSafeFoods: boolean;
  weeklyReports: boolean;
  scanReminders: boolean;
  quietHours?: QuietHours;
}

export interface QuietHours {
  enabled: boolean;
  start: string; // HH:MM format
  end: string; // HH:MM format
}

export interface HapticPreferences {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'strong';
}

export interface AccessibilityPreferences {
  voiceOver: boolean;
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

export interface PrivacySettings {
  dataSharing: boolean;
  analytics: boolean;
  crashReporting: boolean;
  personalizedAds: boolean;
}

export interface SyncSettings {
  enabled: boolean;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  lastSync?: Date;
}

// Food Service Types
export interface NutritionFacts {
  calories?: number;
  fat?: number;
  saturatedFat?: number;
  carbs?: number;
  sugars?: number;
  fiber?: number;
  protein?: number;
  salt?: number;
  sodium?: number;
  cholesterol?: number;
  potassium?: number;
  calcium?: number;
  iron?: number;
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
  thiamine?: number;
  riboflavin?: number;
  niacin?: number;
  vitaminB6?: number;
  folate?: number;
  vitaminB12?: number;
  biotin?: number;
  pantothenicAcid?: number;
  phosphorus?: number;
  iodine?: number;
  magnesium?: number;
  zinc?: number;
  selenium?: number;
  copper?: number;
  manganese?: number;
  chromium?: number;
  molybdenum?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  barcode?: string;
  brand?: string;
  category?: string;
  ingredients: string[];
  allergens: string[];
  additives: string[];
  fodmapLevel?: 'low' | 'moderate' | 'high';
  glutenFree: boolean;
  lactoseFree: boolean;
  histamineLevel?: 'low' | 'moderate' | 'high';
  dataSource?: string;
  isSafeFood?: boolean;
  addedToSafeFoods?: Date;
}

export interface FoodSearchResult {
  items: FoodItem[];
  totalCount: number;
  hasMore: boolean;
  nextOffset?: number;
}

export interface FoodTrendData {
  foodName: string;
  totalScans: number;
  safeCount: number;
  cautionCount: number;
  avoidCount: number;
  lastScanned: Date;
  trend: 'improving' | 'stable' | 'declining';
  confidence: number; // 0-1
}

export interface ProgressRing {
  id: string;
  label: string;
  value: number; // 0-100
  goal: number;
  color: string;
  unit: string;
}

export interface ChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
  color?: string;
}

export interface GutHealthMetrics {
  date: Date;
  overallScore: number; // 0-100
  safeFoodsCount: number;
  cautionFoodsCount: number;
  avoidFoodsCount: number;
  symptomsReported: number; // 0-10 scale
  energyLevel: number; // 0-10 scale
  sleepQuality: number; // 0-10 scale
}

export interface TrendAnalysis {
  period: 'week' | 'month' | 'quarter' | 'year';
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  dataPoints: ChartDataPoint[];
  insights: string[];
  recommendations: string[];
}

export interface ShareableContent {
  type:
    | 'scan'
    | 'profile'
    | 'analytics'
    | 'scan_result'
    | 'gut_report'
    | 'safe_food';
  title?: string;
  description?: string;
  imageUrl?: string;
  data: any;
  shareUrl?: string;
}

export interface SafeFood {
  id: string;
  foodItem: FoodItem;
  addedDate: Date;
  lastUsed?: Date;
  usageCount: number;
  notes?: string;
}

export interface HiddenTrigger {
  trigger: string;
  condition: GutCondition;
  severity: SeverityLevel;
}

export interface IngredientAnalysisResult {
  ingredient: string;
  isProblematic: boolean;
  isHidden: boolean;
  detectedTriggers: HiddenTrigger[];
  confidence: number;
  category: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  recommendations: {
    avoid: boolean;
    caution: boolean;
    alternatives: string[];
    modifications: string[];
  };
}

export interface FoodRecommendation {
  id: string;
  name: string;
  reason: string;
  confidence: number;
  category: string;
  nutritionalValue: NutritionalValue;
}

export interface NutritionalValue {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface PatternAnalysis {
  commonTriggers: string[];
  safeFoods: string[];
  timePatterns: TimePatterns;
  seasonalPatterns: SeasonalPatterns;
}

export interface TimePatterns {
  morning: string[];
  afternoon: string[];
  evening: string[];
}

export interface SeasonalPatterns {
  spring: string[];
  summer: string[];
  fall: string[];
  winter: string[];
}

// Health Service Types

export interface SymptomPattern {
  symptom: string;
  frequency: number; // 0-1
  averageSeverity: number; // 1-10
  commonTriggers: string[];
  timeOfDay: TimeOfDayPattern;
  dayOfWeek: DayOfWeekPattern;
  correlation: CorrelationData;
}

export interface TimeOfDayPattern {
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
}

export interface DayOfWeekPattern {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

export interface CorrelationData {
  food: number; // 0-1
  stress: number; // 0-1
  sleep: number; // 0-1
  weather: number; // 0-1
}

export interface SymptomInsights {
  patterns: SymptomPattern[];
  trends: SymptomTrends;
  recommendations: SymptomRecommendations;
  correlations: SymptomCorrelations;
}

export interface SymptomTrends {
  improving: string[];
  worsening: string[];
  stable: string[];
}

export interface SymptomRecommendations {
  immediate: string[];
  longTerm: string[];
  lifestyle: string[];
}

export interface SymptomCorrelations {
  food: Array<{ food: string; correlation: number }>;
  lifestyle: Array<{ factor: string; correlation: number }>;
  time: Array<{ period: string; correlation: number }>;
}

export interface HealthSummary {
  totalSymptoms: number;
  averageSeverity: number;
  mostCommonSymptoms: Array<{ symptom: string; count: number }>;
  medicationCompliance: number; // 0-1
  overallTrend: 'improving' | 'stable' | 'worsening';
  lastUpdated: Date;
}

// Storage Service Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  lastAccessed: number;
  expiresAt?: number;
}

export interface CacheMetadata {
  version: string;
  lastUpdated: number;
  size: number;
  items: Array<{
    key: string;
    size: number;
    lastAccessed: number;
    expiresAt?: number;
  }>;
}

export interface SyncQueueItem {
  key: string;
  data: unknown;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

// Network Service Types
export interface NotificationSettings {
  mealReminders: boolean;
  newSafeFoods: boolean;
  scanReminders: boolean;
  weeklyReports: boolean;
  quietHours: QuietHours;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  scheduledFor: Date;
  type: 'meal_reminder' | 'scan_reminder' | 'weekly_report' | 'safe_food_alert';
  data?: NotificationData;
}

export interface NotificationData {
  type: string;
  [key: string]: unknown;
}

export interface NetworkStatus {
  isConnected: boolean;
  connectionType: string;
  lastOnlineTime: number;
  lastOfflineTime: number;
  uptime: number;
}

export interface NetworkQuality {
  score: number;
  latency: number;
  reliability: number;
  timestamp: number;
}

export interface NetworkStats {
  totalUptime: number;
  totalDowntime: number;
  connectionCount: number;
  averageUptime: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AppError;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Database Types
export interface DatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getConnection(): unknown;
  executeQuery<T>(query: string, parameters?: unknown[]): Promise<T[]>;
  executeTransaction<T>(
    callback: (connection: unknown) => Promise<T>
  ): Promise<T>;
  createTable(tableName: string, schema: TableSchema): Promise<void>;
  dropTable(tableName: string): Promise<void>;
  createIndex(
    indexName: string,
    tableName: string,
    columns: string[]
  ): Promise<void>;
  createConstraint(
    constraintName: string,
    tableName: string,
    constraint: ConstraintDefinition
  ): Promise<void>;
}

export interface TableSchema {
  [columnName: string]: ColumnDefinition;
}

export interface ColumnDefinition {
  type: 'TEXT' | 'INTEGER' | 'REAL' | 'BLOB' | 'BOOLEAN' | 'DATE' | 'JSON';
  primaryKey?: boolean;
  notNull?: boolean;
  unique?: boolean;
  defaultValue?: unknown;
  references?: {
    table: string;
    column: string;
  };
}

export interface ConstraintDefinition {
  type: 'PRIMARY_KEY' | 'FOREIGN_KEY' | 'UNIQUE' | 'CHECK';
  columns?: string[];
  expression?: string;
  references?: {
    table: string;
    columns: string[];
  };
}

// Service Manager Types
export interface ServiceStatus {
  [serviceName: string]: boolean;
}

export interface ServiceManager {
  initialize(): Promise<void>;
  getService<T>(serviceName: string): T;
  getServiceNames(): string[];
  hasService(serviceName: string): boolean;
  getServiceStatus(): ServiceStatus;
  cleanup(): Promise<void>;
  reset(): Promise<void>;
}

// Context Types
export interface AppState {
  scanHistory: ScanHistory[];
  selectedScans: Set<string>;
  isSelectionMode: boolean;
  gutProfile: GutProfile | null;
  userSettings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  networkStatus: NetworkStatus;
}

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

// Action Types
export type AppAction =
  | { type: 'ADD_SCAN'; payload: ScanHistory }
  | { type: 'REMOVE_SCAN'; payload: string }
  | {
      type: 'UPDATE_SCAN';
      payload: { scanId: string; updates: Partial<ScanHistory> };
    }
  | { type: 'CLEAR_SCAN_HISTORY' }
  | { type: 'TOGGLE_SCAN_SELECTION'; payload: string }
  | { type: 'SELECT_ALL_SCANS' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_SELECTION_MODE'; payload: boolean }
  | { type: 'SET_GUT_PROFILE'; payload: GutProfile }
  | { type: 'UPDATE_GUT_PROFILE'; payload: Partial<GutProfile> }
  | { type: 'SET_USER_SETTINGS'; payload: UserSettings }
  | { type: 'UPDATE_USER_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | {
      type: 'SET_NETWORK_STATUS';
      payload: { isOnline: boolean; quality: number };
    }
  | { type: 'RESET' };

// Type Guards
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'timestamp' in error
  );
}

export function isValidationError(error: unknown): error is ValidationError {
  return isAppError(error) && error.code === 'VALIDATION_ERROR';
}

export function isNetworkError(error: unknown): error is NetworkError {
  return isAppError(error) && error.code === 'NETWORK_ERROR';
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return isAppError(error) && error.code === 'DATABASE_ERROR';
}

export function isServiceError(error: unknown): error is ServiceError {
  return isAppError(error) && error.code === 'SERVICE_ERROR';
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonNullable<T> = T extends null | undefined ? never : T;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// Generic Result Type
export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

// Async Result Type
export type AsyncResult<T, E = AppError> = Promise<Result<T, E>>;

// Service Response Types
export type ServiceResponse<T> = Result<T, ServiceError>;
export type AsyncServiceResponse<T> = Promise<ServiceResponse<T>>;

// Database Response Types
export type DatabaseResponse<T> = Result<T, DatabaseError>;
export type AsyncDatabaseResponse<T> = Promise<DatabaseResponse<T>>;

// Network Response Types
export type NetworkResponse<T> = Result<T, NetworkError>;
export type AsyncNetworkResponse<T> = Promise<NetworkResponse<T>>;
