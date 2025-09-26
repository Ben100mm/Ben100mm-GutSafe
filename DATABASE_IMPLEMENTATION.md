# Database Implementation Guide

## Overview

This document describes the complete database implementation for the GutSafe application, replacing all mock data with real database persistence.

## Architecture

### Database Layer Structure

```
src/database/
├── connection.ts          # Database connection management
├── schema.ts             # Database schema definitions
├── migrations/
│   ├── 001_initial_schema.sql  # Initial database schema
│   └── MigrationRunner.ts      # Migration management
└── repositories/
    ├── BaseRepository.ts       # Base repository with CRUD operations
    ├── ScanHistoryRepository.ts # Scan history specific operations
    └── FoodItemRepository.ts   # Food item specific operations
```

### Key Components

1. **Database Connection Management** (`connection.ts`)
   - Environment-specific database configurations
   - SQLite for development and testing
   - PostgreSQL for production
   - Connection pooling and error handling

2. **Schema Definition** (`schema.ts`)
   - Type-safe schema definitions using Zod
   - Validation rules for all entities
   - Database constraints and indexes

3. **Repository Pattern** (`repositories/`)
   - Base repository with common CRUD operations
   - Specialized repositories for complex queries
   - Data transformation and validation

4. **Migration System** (`migrations/`)
   - Version-controlled database changes
   - Automatic migration execution
   - Rollback capabilities

## Database Schema

### Core Tables

#### User Profiles
- `user_profiles`: User account information and preferences
- `gut_profiles`: Gut health conditions and triggers

#### Food Data
- `food_items`: Food product information and nutritional data
- `scan_analysis`: Analysis results for scanned foods
- `scan_history`: Historical scan records

#### Health Tracking
- `gut_symptoms`: Symptom logging and tracking
- `medications`: Medication and supplement tracking
- `safe_foods`: User's safe food list

#### Analytics
- `analytics_data`: Daily health metrics and statistics
- `food_trends`: Food popularity and safety trends
- `ingredient_analysis`: Ingredient safety analysis

### Relationships

```
user_profiles (1) ←→ (1) gut_profiles
user_profiles (1) ←→ (∞) scan_history
user_profiles (1) ←→ (∞) gut_symptoms
user_profiles (1) ←→ (∞) medications
user_profiles (1) ←→ (∞) safe_foods
user_profiles (1) ←→ (∞) analytics_data

food_items (1) ←→ (∞) scan_history
food_items (1) ←→ (∞) safe_foods
food_items (1) ←→ (∞) scan_analysis

scan_history (1) ←→ (1) scan_analysis
```

## Implementation Details

### Database Connection

The application supports multiple database types:

- **Development**: SQLite (local file-based)
- **Testing**: SQLite (in-memory)
- **Production**: PostgreSQL (cloud-hosted)

```typescript
// Environment-specific configuration
const config = getDatabaseConfig();

// Create connection
const connection = DatabaseFactory.createConnection(config);
await connection.connect();
```

### Repository Pattern

Each entity has a dedicated repository with specialized methods:

```typescript
// Base repository provides common CRUD operations
class BaseRepository<T> {
  async findById(id: string): Promise<T | null>
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>
  async update(id: string, data: Partial<T>): Promise<T>
  async delete(id: string): Promise<boolean>
  // ... more methods
}

// Specialized repositories add domain-specific methods
class ScanHistoryRepository extends BaseRepository<ScanHistory> {
  async findByUserId(userId: string): Promise<ScanHistory[]>
  async getScanStatistics(userId: string): Promise<ScanStats>
  async getTopCategories(userId: string): Promise<CategoryStats[]>
  // ... more methods
}
```

### Data Validation

All data is validated using Zod schemas:

```typescript
const FoodItemSchema = z.object({
  name: z.string().min(1).max(255),
  barcode: z.string().regex(/^\d{8,14}$/).optional(),
  ingredients: z.array(z.string().min(1)).max(100),
  // ... more validation rules
});

// Validate before saving
const validation = validateFoodItem(data);
if (!validation.success) {
  throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
}
```

### Migration System

Database changes are managed through migrations:

```typescript
// Run all pending migrations
await migrationRunner.runMigrations();

// Rollback specific migrations
await migrationRunner.rollbackMigrations(['001', '002']);

// Check migration status
const status = await migrationRunner.getMigrationStatus();
```

## Usage Examples

### Initializing the Database

```typescript
import DataServiceNew from './services/DataServiceNew';

// Initialize the service (connects to database and runs migrations)
const dataService = DataServiceNew.getInstance();
await dataService.initialize();
```

### Working with Scan History

```typescript
// Add a new scan
const scanHistory = await dataService.addScanHistory({
  userId: 'user-123',
  foodItem: {
    name: 'Organic Quinoa',
    barcode: '123456789012',
    brand: 'Bob\'s Red Mill',
    // ... other properties
  },
  analysis: {
    overallSafety: 'safe',
    flaggedIngredients: [],
    // ... other properties
  },
  timestamp: new Date(),
});

// Get user's scan history
const history = await dataService.getScanHistory('user-123', 10, 0);

// Get scan statistics
const stats = await dataService.getAnalyticsData('user-123');
```

### Working with Gut Profiles

```typescript
// Get user's gut profile
const profile = await dataService.getGutProfile('user-123');

// Update a condition
await dataService.updateCondition('user-123', 'gluten', true, 'severe');

// Update entire profile
await dataService.updateGutProfile({
  id: 'profile-123',
  userId: 'user-123',
  conditions: {
    'gluten': { enabled: true, severity: 'severe', knownTriggers: ['wheat'] },
    // ... other conditions
  },
  preferences: {
    dietaryRestrictions: ['Gluten-free'],
    preferredAlternatives: ['Rice flour', 'Almond flour'],
  },
  isActive: true,
});
```

### Working with Symptoms

```typescript
// Add a symptom
const symptom = await dataService.addSymptom({
  userId: 'user-123',
  type: 'bloating',
  severity: 6,
  description: 'Mild bloating after dinner',
  duration: 45,
  timestamp: new Date(),
  potentialTriggers: ['Dairy', 'Wheat'],
  location: 'lower_abdomen',
});

// Get user's symptoms
const symptoms = await dataService.getSymptoms('user-123');
```

## Data Validation and Sanitization

### Input Validation

All user inputs are validated using comprehensive schemas:

```typescript
import DataValidationService from './services/DataValidationService';

const validator = DataValidationService.getInstance();

// Validate food item
const result = validator.validateFoodItem(foodData);
if (!result.success) {
  console.error('Validation errors:', result.errors);
  return;
}

// Sanitize string input
const sanitized = validator.sanitizeString(userInput, 100);

// Validate barcode
const barcodeResult = validator.validateBarcode(barcode);
if (!barcodeResult.isValid) {
  throw new Error('Invalid barcode format');
}
```

### Security Measures

1. **SQL Injection Prevention**: All queries use parameterized statements
2. **Input Sanitization**: User inputs are sanitized before processing
3. **Data Validation**: All data is validated against schemas
4. **Access Control**: User-specific data is properly isolated

## Performance Optimizations

### Database Indexes

Key indexes for optimal query performance:

```sql
-- User-specific queries
CREATE INDEX idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX idx_gut_symptoms_user_id ON gut_symptoms(user_id);

-- Time-based queries
CREATE INDEX idx_scan_history_timestamp ON scan_history(timestamp);
CREATE INDEX idx_gut_symptoms_timestamp ON gut_symptoms(timestamp);

-- Food lookups
CREATE INDEX idx_food_items_barcode ON food_items(barcode);
CREATE INDEX idx_food_items_name ON food_items(name);
```

### Query Optimization

- Use appropriate indexes for common query patterns
- Implement pagination for large result sets
- Cache frequently accessed data
- Use database-specific optimizations

### Connection Pooling

Production databases use connection pooling:

```typescript
const config = {
  pool: {
    min: 5,
    max: 20,
    acquireTimeoutMillis: 60000,
    idleTimeoutMillis: 600000,
  }
};
```

## Error Handling

### Database Errors

```typescript
try {
  const result = await dataService.addScanHistory(scanData);
} catch (error) {
  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    // Handle duplicate key error
  } else if (error.code === 'SQLITE_BUSY') {
    // Handle database locked error
  } else {
    // Handle other database errors
    console.error('Database error:', error);
  }
}
```

### Validation Errors

```typescript
const validation = validator.validateFoodItem(data);
if (!validation.success) {
  // Return user-friendly error messages
  return {
    success: false,
    errors: validation.errors
  };
}
```

## Testing

### Unit Tests

```typescript
// Test repository methods
describe('ScanHistoryRepository', () => {
  it('should create scan history', async () => {
    const scanData = { /* test data */ };
    const result = await scanHistoryRepo.create(scanData);
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// Test full data flow
describe('DataService Integration', () => {
  it('should handle complete scan flow', async () => {
    const dataService = DataServiceNew.getInstance();
    await dataService.initialize();
    
    const scan = await dataService.addScanHistory(scanData);
    const retrieved = await dataService.getScanById(scan.id);
    
    expect(retrieved).toEqual(scan);
  });
});
```

## Migration Guide

### From Mock Data to Real Database

1. **Replace DataService import**:
   ```typescript
   // Old
   import DataService from './services/DataService';
   
   // New
   import DataServiceNew from './services/DataServiceNew';
   ```

2. **Initialize database**:
   ```typescript
   const dataService = DataServiceNew.getInstance();
   await dataService.initialize();
   ```

3. **Update method calls**:
   ```typescript
   // Old (synchronous)
   const history = dataService.getScanHistory();
   
   // New (asynchronous)
   const history = await dataService.getScanHistory(userId);
   ```

### Data Migration

If you have existing mock data, create a migration script:

```typescript
// migrate-mock-data.ts
async function migrateMockData() {
  const dataService = DataServiceNew.getInstance();
  await dataService.initialize();
  
  // Migrate existing data
  for (const scan of mockScanHistory) {
    await dataService.addScanHistory(scan);
  }
}
```

## Monitoring and Maintenance

### Database Health

```typescript
// Check database connection
const isConnected = databaseManager.isConnected();

// Get migration status
const status = await migrationRunner.getMigrationStatus();

// Monitor query performance
const stats = await scanHistoryRepo.getQueryStats();
```

### Backup and Recovery

1. **Regular Backups**: Implement automated database backups
2. **Point-in-Time Recovery**: Use database transaction logs
3. **Data Export**: Export data in JSON format for portability

### Performance Monitoring

1. **Query Performance**: Monitor slow queries
2. **Connection Pool**: Monitor connection usage
3. **Storage Usage**: Monitor database size growth

## Troubleshooting

### Common Issues

1. **Database Locked**: Increase connection timeout or retry logic
2. **Migration Failures**: Check migration logs and rollback if needed
3. **Validation Errors**: Review input data and validation rules
4. **Performance Issues**: Check indexes and query optimization

### Debug Mode

Enable debug logging:

```typescript
const config = {
  logging: true,
  // ... other config
};
```

## Future Enhancements

1. **Caching Layer**: Implement Redis for frequently accessed data
2. **Read Replicas**: Use read replicas for analytics queries
3. **Data Archiving**: Archive old data to reduce database size
4. **Real-time Sync**: Implement real-time data synchronization
5. **Advanced Analytics**: Add more sophisticated analytics queries

## Conclusion

The database implementation provides a robust, scalable foundation for the GutSafe application. It replaces all mock data with real persistence while maintaining type safety and data integrity. The modular design allows for easy maintenance and future enhancements.
