# GutSafe Database Documentation

## Overview

The GutSafe database is a PostgreSQL-based system designed for gut health tracking, food scanning, and user management. It provides comprehensive data storage for all application features with optimized performance and security.

## Database Architecture

### Core Components

- **PostgreSQL 12+**: Primary database engine
- **Connection Pooling**: Optimized connection management
- **Redis Caching**: High-performance data caching
- **Comprehensive Indexing**: 20+ indexes for optimal performance
- **JSONB Support**: Efficient JSON data storage and querying

### Schema Design

The database follows a normalized design with proper foreign key relationships and constraints:

```
Users & Authentication
├── users (core user data)
├── user_profiles (extended preferences)
├── user_sessions (session management)
└── api_keys (API access control)

Gut Health Tracking
├── gut_profiles (user conditions)
├── gut_symptoms (symptom tracking)
├── medications (medication management)
└── analytics_data (health analytics)

Food & Scanning
├── food_items (food database)
├── scan_history (scan tracking)
├── scan_analysis (AI analysis results)
├── safe_foods (user safe foods)
├── food_trends (community trends)
└── ingredient_analysis (ingredient risks)
```

## Quick Start

### 1. Prerequisites

- PostgreSQL 12 or higher
- Node.js 18 or higher
- Redis (optional, for caching)

### 2. Environment Setup

```bash
# Copy environment template
cp database.env.example .env.local

# Edit configuration
nano .env.local
```

### 3. Database Setup

```bash
# Install dependencies
npm install

# Setup database (creates database, user, and schema)
npm run db:setup

# Run health check
npm run db:health
```

### 4. Development

```bash
# Start development server
npm run dev

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed
```

## Database Scripts

### Setup Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Database Setup | `npm run db:setup` | Creates database, user, and schema |
| Migrations | `npm run db:migrate` | Runs database migrations |
| Seed Data | `npm run db:seed` | Populates with test data |
| Reset Database | `npm run db:reset` | Resets database (dev only) |

### Maintenance Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Health Check | `npm run db:health` | Comprehensive health check |
| Optimization | `npm run db:optimize` | Database optimization |
| Backup | `npm run db:backup` | Database backup |
| Restore | `npm run db:restore` | Database restore |

## Table Reference

### Core Tables

#### users
Primary user authentication and basic profile data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique email address |
| password_hash | VARCHAR(255) | Hashed password |
| first_name | VARCHAR(100) | User's first name |
| last_name | VARCHAR(100) | User's last name |
| email_verified | BOOLEAN | Email verification status |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

#### user_profiles
Extended user preferences and settings.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| preferences | JSONB | User preferences |
| settings | JSONB | Application settings |

#### gut_profiles
User's gut health conditions and preferences.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| conditions | JSONB | Gut health conditions |
| preferences | JSONB | Gut health preferences |
| is_active | BOOLEAN | Profile active status |

#### food_items
Comprehensive food database with nutritional information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Food name |
| barcode | VARCHAR(50) | Product barcode |
| brand | VARCHAR(100) | Brand name |
| category | VARCHAR(100) | Food category |
| ingredients | JSONB | Ingredient list |
| allergens | JSONB | Allergen information |
| nutritional_info | JSONB | Nutritional data |
| gut_health_info | JSONB | Gut health analysis |

#### scan_history
Complete scan tracking with location and device information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| food_item_id | UUID | Foreign key to food_items |
| analysis_id | UUID | Foreign key to scan_analysis |
| timestamp | TIMESTAMP | Scan timestamp |
| location | JSONB | GPS location data |
| device_info | JSONB | Device information |

#### scan_analysis
AI-powered analysis results and recommendations.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| food_item_id | UUID | Foreign key to food_items |
| user_id | UUID | Foreign key to users |
| overall_safety | VARCHAR(20) | Safety rating (safe/caution/avoid) |
| confidence | DECIMAL(3,2) | Analysis confidence (0-1) |
| flagged_ingredients | JSONB | Problematic ingredients |
| explanation | TEXT | Analysis explanation |

## Performance Optimization

### Indexing Strategy

The database includes comprehensive indexing for optimal performance:

```sql
-- Primary indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX idx_food_items_barcode ON food_items(barcode);

-- Composite indexes
CREATE INDEX idx_scan_history_user_timestamp ON scan_history(user_id, timestamp DESC);
CREATE INDEX idx_gut_symptoms_user_timestamp ON gut_symptoms(user_id, timestamp DESC);

-- JSONB indexes
CREATE INDEX idx_food_items_ingredients_gin ON food_items USING GIN (ingredients);
CREATE INDEX idx_gut_profiles_conditions_gin ON gut_profiles USING GIN (conditions);

-- Text search indexes
CREATE INDEX idx_food_items_name_trgm ON food_items USING GIN (name gin_trgm_ops);
```

### Query Optimization

- **Prepared Statements**: All queries use parameterized statements
- **Connection Pooling**: Optimal pool size configuration
- **Query Caching**: Redis integration for frequent queries
- **Lazy Loading**: Efficient data loading strategies

### Monitoring

- **Query Performance**: Track slow queries and optimize
- **Connection Usage**: Monitor connection pool utilization
- **Index Usage**: Analyze index effectiveness
- **Storage Growth**: Monitor database size and growth

## Security

### Data Protection

- **Encryption at Rest**: Database-level encryption
- **Encryption in Transit**: SSL/TLS for all connections
- **Access Control**: Role-based database access
- **Audit Logging**: Track all database access

### Authentication

- **UUID Primary Keys**: Secure, non-sequential identifiers
- **Password Hashing**: bcrypt integration for secure password storage
- **Session Management**: Secure session tracking and expiration
- **API Key Management**: Secure API key storage and rotation

## Backup and Recovery

### Backup Strategy

- **Daily Backups**: Automated daily backups
- **Point-in-Time Recovery**: WAL archiving for recovery
- **Cross-Region Replication**: Disaster recovery setup
- **Backup Testing**: Regular restore testing

### Recovery Procedures

1. **Full Restore**: Complete database restoration
2. **Point-in-Time Recovery**: Restore to specific timestamp
3. **Table-Level Recovery**: Restore individual tables
4. **Data Export**: Export specific data sets

## Troubleshooting

### Common Issues

1. **Connection Pool Exhaustion**
   - Increase pool size in configuration
   - Optimize queries to reduce connection time
   - Check for connection leaks

2. **Slow Queries**
   - Check query execution plans
   - Verify index usage
   - Consider query rewriting

3. **Lock Contention**
   - Optimize transaction scope
   - Check for long-running transactions
   - Review locking strategies

4. **Memory Usage**
   - Tune PostgreSQL configuration
   - Monitor shared buffers
   - Check for memory leaks

### Performance Tuning

- **PostgreSQL Configuration**: Optimize for workload
- **Index Strategy**: Add/remove indexes based on usage
- **Query Optimization**: Rewrite inefficient queries
- **Hardware Scaling**: Scale up/down based on needs

## Development

### Local Development

```bash
# Start PostgreSQL
brew services start postgresql

# Create development database
createdb gutsafe_dev

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed
```

### Testing

```bash
# Run database tests
npm test

# Run integration tests
npm run test:integration

# Run performance tests
npm run test:performance
```

## Production Deployment

### Environment Configuration

```bash
# Production environment variables
DB_TYPE=postgresql
DB_HOST=your-production-host
DB_PORT=5432
DB_NAME=gutsafe_prod
DB_USER=gutsafe_prod
DB_PASSWORD=secure_production_password
DB_SSL=true
```

### Monitoring

- **Database Metrics**: Track performance metrics
- **Alerting**: Set up alerts for critical issues
- **Logging**: Comprehensive logging and analysis
- **Health Checks**: Regular health check automation

## Support

For database-related issues:

1. Check the health status: `npm run db:health`
2. Review logs for error messages
3. Run optimization: `npm run db:optimize`
4. Check connection status and performance

## License

Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
Proprietary software - See LICENSE file for details.
