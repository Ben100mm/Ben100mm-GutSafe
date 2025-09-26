# GutSafe Backend API

Backend API server for the GutSafe gut health management application.

## Features

- **User Authentication**: JWT-based authentication with refresh tokens
- **Food Database**: Comprehensive food item management with nutritional data
- **Scan Analysis**: AI-powered food analysis for gut health
- **Symptom Tracking**: Detailed symptom logging and correlation analysis
- **Safe Foods**: Personal safe food management
- **Analytics**: Comprehensive analytics and insights
- **Data Export**: Full data export capabilities
- **Health Monitoring**: Built-in health checks and metrics

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (with SQLite support for development)
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator + Joi
- **Logging**: Winston
- **Documentation**: Swagger/OpenAPI

## Quick Start

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 12 or higher (or SQLite for development)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database**
   ```bash
   # Run migrations
   npm run db:migrate
   
   # Seed with sample data (optional)
   npm run db:seed
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Configuration

Create a `.env.local` file based on `.env.example`:

```env
# Database
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gutsafe
DB_USER=gutsafe
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# External APIs
USDA_API_KEY=your_usda_key
SPOONACULAR_API_KEY=your_spoonacular_key
```

## API Documentation

### Base URL
- Development: `http://localhost:3001`
- Production: `https://api.gutsafe.app`

### Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

#### Foods
- `GET /api/foods` - List foods with pagination
- `GET /api/foods/:id` - Get food by ID
- `GET /api/foods/barcode/:barcode` - Get food by barcode
- `POST /api/foods` - Create food item
- `PUT /api/foods/:id` - Update food item
- `DELETE /api/foods/:id` - Delete food item
- `GET /api/foods/categories` - Get food categories
- `GET /api/foods/brands` - Get food brands
- `GET /api/foods/gluten-free` - Get gluten-free foods
- `GET /api/foods/lactose-free` - Get lactose-free foods
- `GET /api/foods/low-fodmap` - Get low FODMAP foods
- `GET /api/foods/trending` - Get trending foods

#### Scans
- `POST /api/scans/analyze` - Analyze food for gut health
- `GET /api/scans/history` - Get scan history
- `GET /api/scans/analytics` - Get scan analytics
- `POST /api/scans/symptoms` - Record gut symptom
- `GET /api/scans/symptoms` - Get symptoms
- `PUT /api/scans/analysis/:id/verify` - Verify scan analysis
- `DELETE /api/scans/symptoms/:id` - Delete symptom

#### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/gut-profile` - Get gut profile
- `PUT /api/users/gut-profile` - Update gut profile
- `GET /api/users/safe-foods` - Get safe foods
- `POST /api/users/safe-foods` - Add safe food
- `PUT /api/users/safe-foods/:id` - Update safe food
- `DELETE /api/users/safe-foods/:id` - Remove safe food
- `GET /api/users/medications` - Get medications
- `POST /api/users/medications` - Add medication
- `DELETE /api/users/medications/:id` - Delete medication

#### Analytics
- `GET /api/analytics/dashboard` - Get analytics dashboard
- `GET /api/analytics/insights` - Get AI insights
- `GET /api/analytics/export` - Export user data
- `POST /api/analytics/analytics-data` - Record analytics data

#### Health
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check
- `GET /health/metrics` - Application metrics

## Database Schema

The application uses the following main tables:

- `users` - User accounts
- `user_profiles` - User profile data
- `gut_profiles` - Gut health profiles
- `food_items` - Food database
- `scan_analysis` - Food scan analysis results
- `scan_history` - Scan history
- `gut_symptoms` - Symptom tracking
- `medications` - Medication tracking
- `safe_foods` - User's safe foods
- `analytics_data` - Analytics data
- `food_trends` - Food trend analysis
- `ingredient_analysis` - Ingredient analysis data

## Development

### Scripts

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Run database migrations
npm run db:migrate

# Seed database
npm run db:seed

# Reset database
npm run db:reset

# Health check
npm run health:check
```

### Database Management

```bash
# Run migrations
npm run db:migrate

# Seed with sample data
npm run db:seed

# Reset database (WARNING: This will delete all data)
npm run db:reset
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Docker

```bash
# Build Docker image
docker build -t gutsafe-backend .

# Run container
docker run -p 3001:3001 --env-file .env.local gutsafe-backend
```

### Environment Variables

Ensure all required environment variables are set:

- `NODE_ENV=production`
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `SESSION_SECRET` - Session secret
- `SENTRY_DSN` - Error tracking (optional)

### Health Checks

The application provides several health check endpoints:

- `/health` - Basic health status
- `/health/detailed` - Detailed health with dependencies
- `/health/ready` - Kubernetes readiness check
- `/health/live` - Kubernetes liveness check

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet.js security headers
- Input validation and sanitization
- SQL injection prevention

## Monitoring

- Winston logging
- Health check endpoints
- Metrics endpoint
- Error tracking (Sentry integration)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## License

Proprietary - See LICENSE file for details

## Support

For support, please contact [your-email@domain.com]
