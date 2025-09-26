# Package.json Configuration Guide

## Overview

This document explains the comprehensive package.json configuration for the GutSafe application, including all scripts, dependencies, and development tools.

## Scripts Reference

### Development Scripts

| Script | Description | Environment |
|--------|-------------|-------------|
| `npm start` | Start development server with .env.local | development |
| `npm run start:dev` | Start development server with .env.development | development |
| `npm run start:prod` | Start production server with .env.production | production |
| `npm run web` | Start web development server | development |

### Build Scripts

| Script | Description | Environment |
|--------|-------------|-------------|
| `npm run build` | Build for production | production |
| `npm run build:dev` | Build for development | development |
| `npm run build:analyze` | Build and analyze bundle | production |
| `npm run web:build` | Build web version | production |
| `npm run web:serve` | Serve built web app | production |

### Mobile Development Scripts

| Script | Description | Platform |
|--------|-------------|----------|
| `npm run ios` | Run iOS app | iOS |
| `npm run ios:simulator` | Run iOS on iPhone 15 simulator | iOS |
| `npm run android` | Run Android app | Android |
| `npm run android:debug` | Run Android debug build | Android |
| `npm run android:release` | Run Android release build | Android |
| `npm run metro` | Start Metro bundler | React Native |
| `npm run metro:reset` | Reset Metro cache | React Native |

### Testing Scripts

| Script | Description | Coverage |
|--------|-------------|----------|
| `npm test` | Run tests once | No |
| `npm run test:watch` | Run tests in watch mode | No |
| `npm run test:coverage` | Run tests with coverage | Yes |
| `npm run test:e2e` | Run end-to-end tests | No |

### Code Quality Scripts

| Script | Description |
|--------|-------------|
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run type-check` | Run TypeScript type checking |
| `npm run type-check:watch` | Run TypeScript in watch mode |

### Utility Scripts

| Script | Description |
|--------|-------------|
| `npm run clean` | Clean build artifacts |
| `npm run clean:all` | Clean everything including node_modules |
| `npm run doctor` | Run React Native doctor |
| `npm run env:check` | Check environment variables |
| `npm run env:validate` | Validate environment configuration |

### Release Scripts

| Script | Description |
|--------|-------------|
| `npm run bundle:ios` | Bundle for iOS |
| `npm run bundle:android` | Bundle for Android |
| `npm run release:ios` | Create iOS release archive |
| `npm run release:android` | Build Android release APK |

## Environment Configuration

### Environment Files

The application supports multiple environment files:

- `.env.local` - Local development (highest priority)
- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.test` - Test environment

### Required Environment Variables

#### Development
- `NODE_ENV`
- `PORT`
- `REACT_APP_API_BASE_URL`
- `REACT_APP_DEBUG_MODE`
- `REACT_APP_LOG_LEVEL`

#### Production
- `NODE_ENV`
- `REACT_APP_API_BASE_URL`
- `REACT_APP_API_KEY`
- `REACT_APP_DB_ENCRYPTION_KEY`
- `REACT_APP_JWT_SECRET`
- `REACT_APP_SESSION_KEY`

#### Test
- `NODE_ENV`
- `REACT_APP_API_BASE_URL`
- `REACT_APP_DEBUG_MODE`

### Environment Validation

Use the validation script to check your environment configuration:

```bash
npm run env:validate
```

## Dependencies

### Production Dependencies

- **React & React Native**: Core framework
- **Navigation**: React Navigation for routing
- **State Management**: Zustand for state management
- **UI Components**: Custom components with React Native Web support
- **Security**: Crypto-js for encryption
- **Validation**: Zod for schema validation

### Development Dependencies

- **Build Tools**: CRACO, Webpack, Babel
- **Linting**: ESLint with TypeScript and React Native plugins
- **Formatting**: Prettier
- **Testing**: Jest, React Testing Library
- **Type Checking**: TypeScript
- **Environment**: dotenv, cross-env
- **Git Hooks**: Husky, lint-staged

## Configuration Files

### ESLint Configuration

Located in `package.json` under `eslintConfig`:

- TypeScript support
- React and React Native rules
- Accessibility rules
- Import organization
- Prettier integration

### Prettier Configuration

Located in `package.json` under `prettier`:

- Single quotes
- Semicolons
- 2-space indentation
- 80 character line width

### Jest Configuration

Located in `package.json` under `jest`:

- React Native preset
- Coverage thresholds (70%)
- Test file patterns
- Setup files

### Lint-Staged Configuration

Located in `package.json` under `lint-staged`:

- ESLint fixes on staged files
- Prettier formatting on staged files
- Supports TypeScript, JavaScript, JSON, CSS, and Markdown

## CRACO Configuration

The `craco.config.js` file provides:

- React Native Web aliases
- Platform-specific file resolution
- Environment-based webpack configuration
- Hot Module Replacement control

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp env.template .env.local
   # Edit .env.local with your configuration
   ```

3. **Validate environment**:
   ```bash
   npm run env:validate
   ```

4. **Start development**:
   ```bash
   npm start
   ```

## Best Practices

1. **Environment Variables**: Always use environment variables for configuration
2. **Code Quality**: Run linting and formatting before commits
3. **Testing**: Maintain test coverage above 70%
4. **Type Safety**: Use TypeScript for all new code
5. **Security**: Never commit sensitive environment variables

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**: Check file naming and location
2. **Build Failures**: Run `npm run clean` and try again
3. **Metro Issues**: Run `npm run metro:reset`
4. **Type Errors**: Run `npm run type-check`

### Getting Help

- Check the validation script: `npm run env:validate`
- Run React Native doctor: `npm run doctor`
- Check environment: `npm run env:check`
