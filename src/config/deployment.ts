/**
 * Deployment Configuration System
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * 
 * Environment-specific deployment configurations and scripts.
 */

import { BuildEnvironment } from './build';

// Deployment environment types
export type DeploymentEnvironment = 'development' | 'staging' | 'production' | 'test';

// Deployment configuration interface
export interface DeploymentConfig {
  environment: DeploymentEnvironment;
  build: {
    command: string;
    outputDir: string;
    publicPath: string;
    sourceMaps: boolean;
    minify: boolean;
    compress: boolean;
  };
  server: {
    host: string;
    port: number;
    protocol: 'http' | 'https';
    ssl: {
      enabled: boolean;
      certPath?: string;
      keyPath?: string;
    };
  };
  cdn: {
    enabled: boolean;
    baseUrl: string;
    assetsPath: string;
  };
  monitoring: {
    enabled: boolean;
    errorTracking: boolean;
    performanceMonitoring: boolean;
    analytics: boolean;
  };
  security: {
    headers: Record<string, string>;
    cors: {
      enabled: boolean;
      origins: string[];
    };
    rateLimit: {
      enabled: boolean;
      windowMs: number;
      maxRequests: number;
    };
  };
  database: {
    type: 'sqlite' | 'postgresql' | 'mysql';
    url: string;
    ssl: boolean;
    pool: {
      min: number;
      max: number;
    };
  };
  cache: {
    enabled: boolean;
    type: 'memory' | 'redis' | 'memcached';
    url?: string;
    ttl: number;
  };
  storage: {
    type: 'local' | 's3' | 'gcs' | 'azure';
    bucket?: string;
    region?: string;
    accessKey?: string;
    secretKey?: string;
  };
}

// Deployment configurations for different environments
export const deploymentConfigs: Record<DeploymentEnvironment, DeploymentConfig> = {
  development: {
    environment: 'development',
    build: {
      command: 'npm run build:dev',
      outputDir: 'build',
      publicPath: '/',
      sourceMaps: true,
      minify: false,
      compress: false,
    },
    server: {
      host: 'localhost',
      port: 9001,
      protocol: 'http',
      ssl: {
        enabled: false,
      },
    },
    cdn: {
      enabled: false,
      baseUrl: '',
      assetsPath: '/static',
    },
    monitoring: {
      enabled: false,
      errorTracking: false,
      performanceMonitoring: false,
      analytics: false,
    },
    security: {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
      },
      cors: {
        enabled: true,
        origins: ['http://localhost:3000', 'http://localhost:9001'],
      },
      rateLimit: {
        enabled: false,
        windowMs: 60000,
        maxRequests: 1000,
      },
    },
    database: {
      type: 'sqlite',
      url: 'sqlite://./data/gutsafe-dev.db',
      ssl: false,
      pool: {
        min: 1,
        max: 5,
      },
    },
    cache: {
      enabled: false,
      type: 'memory',
      ttl: 300,
    },
    storage: {
      type: 'local',
    },
  },
  
  staging: {
    environment: 'staging',
    build: {
      command: 'npm run build',
      outputDir: 'build',
      publicPath: '/',
      sourceMaps: true,
      minify: true,
      compress: true,
    },
    server: {
      host: 'staging.gutsafe.com',
      port: 443,
      protocol: 'https',
      ssl: {
        enabled: true,
        certPath: '/etc/ssl/certs/staging.gutsafe.com.crt',
        keyPath: '/etc/ssl/private/staging.gutsafe.com.key',
      },
    },
    cdn: {
      enabled: true,
      baseUrl: 'https://cdn-staging.gutsafe.com',
      assetsPath: '/static',
    },
    monitoring: {
      enabled: true,
      errorTracking: true,
      performanceMonitoring: true,
      analytics: true,
    },
    security: {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      },
      cors: {
        enabled: true,
        origins: ['https://staging.gutsafe.com', 'https://staging-api.gutsafe.com'],
      },
      rateLimit: {
        enabled: true,
        windowMs: 60000,
        maxRequests: 500,
      },
    },
    database: {
      type: 'postgresql',
      url: 'postgresql://staging_user:staging_pass@staging-db.gutsafe.com:5432/gutsafe_staging',
      ssl: true,
      pool: {
        min: 2,
        max: 10,
      },
    },
    cache: {
      enabled: true,
      type: 'redis',
      url: 'redis://staging-cache.gutsafe.com:6379',
      ttl: 3600,
    },
    storage: {
      type: 's3',
      bucket: 'gutsafe-staging-assets',
      region: 'us-east-1',
    },
  },
  
  production: {
    environment: 'production',
    build: {
      command: 'npm run build',
      outputDir: 'build',
      publicPath: '/',
      sourceMaps: false,
      minify: true,
      compress: true,
    },
    server: {
      host: 'gutsafe.com',
      port: 443,
      protocol: 'https',
      ssl: {
        enabled: true,
        certPath: '/etc/ssl/certs/gutsafe.com.crt',
        keyPath: '/etc/ssl/private/gutsafe.com.key',
      },
    },
    cdn: {
      enabled: true,
      baseUrl: 'https://cdn.gutsafe.com',
      assetsPath: '/static',
    },
    monitoring: {
      enabled: true,
      errorTracking: true,
      performanceMonitoring: true,
      analytics: true,
    },
    security: {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'",
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
      cors: {
        enabled: true,
        origins: ['https://gutsafe.com', 'https://api.gutsafe.com'],
      },
      rateLimit: {
        enabled: true,
        windowMs: 60000,
        maxRequests: 100,
      },
    },
    database: {
      type: 'postgresql',
      url: 'postgresql://prod_user:prod_pass@prod-db.gutsafe.com:5432/gutsafe_prod',
      ssl: true,
      pool: {
        min: 5,
        max: 20,
      },
    },
    cache: {
      enabled: true,
      type: 'redis',
      url: 'redis://prod-cache.gutsafe.com:6379',
      ttl: 7200,
    },
    storage: {
      type: 's3',
      bucket: 'gutsafe-prod-assets',
      region: 'us-east-1',
    },
  },
  
  test: {
    environment: 'test',
    build: {
      command: 'npm run build:dev',
      outputDir: 'build',
      publicPath: '/',
      sourceMaps: true,
      minify: false,
      compress: false,
    },
    server: {
      host: 'localhost',
      port: 9001,
      protocol: 'http',
      ssl: {
        enabled: false,
      },
    },
    cdn: {
      enabled: false,
      baseUrl: '',
      assetsPath: '/static',
    },
    monitoring: {
      enabled: false,
      errorTracking: false,
      performanceMonitoring: false,
      analytics: false,
    },
    security: {
      headers: {
        'X-Content-Type-Options': 'nosniff',
      },
      cors: {
        enabled: true,
        origins: ['http://localhost:3001', 'http://localhost:9001'],
      },
      rateLimit: {
        enabled: false,
        windowMs: 60000,
        maxRequests: 10000,
      },
    },
    database: {
      type: 'sqlite',
      url: 'sqlite://./data/gutsafe-test.db',
      ssl: false,
      pool: {
        min: 1,
        max: 3,
      },
    },
    cache: {
      enabled: false,
      type: 'memory',
      ttl: 60,
    },
    storage: {
      type: 'local',
    },
  },
};

// Get deployment configuration for environment
export const getDeploymentConfig = (environment: DeploymentEnvironment): DeploymentConfig => {
  return deploymentConfigs[environment];
};

// Generate deployment scripts
export const generateDeploymentScripts = (config: DeploymentConfig) => {
  const scripts: Record<string, string> = {};
  
  // Build script
  scripts[`deploy:${config.environment}:build`] = config.build.command;
  
  // Server start script
  const serverCommand = config.server.ssl.enabled
    ? `node server.js --host ${config.server.host} --port ${config.server.port} --ssl --cert ${config.server.ssl.certPath} --key ${config.server.ssl.keyPath}`
    : `node server.js --host ${config.server.host} --port ${config.server.port}`;
  
  scripts[`deploy:${config.environment}:start`] = serverCommand;
  
  // Full deployment script
  scripts[`deploy:${config.environment}`] = `npm run deploy:${config.environment}:build && npm run deploy:${config.environment}:start`;
  
  // Health check script
  scripts[`deploy:${config.environment}:health`] = `curl -f ${config.server.protocol}://${config.server.host}:${config.server.port}/health || exit 1`;
  
  return scripts;
};

// Generate Docker configuration
export const generateDockerConfig = (config: DeploymentConfig) => {
  const dockerfile = `# GutSafe ${config.environment} Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE ${config.server.port}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f ${config.server.protocol}://localhost:${config.server.port}/health || exit 1

# Start application
CMD ["npm", "run", "deploy:${config.environment}:start"]
`;

  const dockerCompose = `# GutSafe ${config.environment} Docker Compose
version: '3.8'

services:
  app:
    build: .
    ports:
      - "${config.server.port}:${config.server.port}"
    environment:
      - NODE_ENV=${config.environment}
    volumes:
      - ./data:/app/data
    depends_on:
      - database
      - cache

  database:
    image: ${config.database.type === 'postgresql' ? 'postgres:15' : 'sqlite:latest'}
    environment:
      - POSTGRES_DB=gutsafe_${config.environment}
      - POSTGRES_USER=${config.database.url.split('://')[1].split(':')[0]}
      - POSTGRES_PASSWORD=${config.database.url.split(':')[3].split('@')[0]}
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - cache_data:/data

volumes:
  db_data:
  cache_data:
`;

  return { dockerfile, dockerCompose };
};

// Generate Kubernetes configuration
export const generateKubernetesConfig = (config: DeploymentConfig) => {
  const deployment = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: gutsafe-${config.environment}
  labels:
    app: gutsafe
    environment: ${config.environment}
spec:
  replicas: ${config.environment === 'production' ? 3 : 1}
  selector:
    matchLabels:
      app: gutsafe
      environment: ${config.environment}
  template:
    metadata:
      labels:
        app: gutsafe
        environment: ${config.environment}
    spec:
      containers:
      - name: gutsafe
        image: gutsafe:${config.environment}-latest
        ports:
        - containerPort: ${config.server.port}
        env:
        - name: NODE_ENV
          value: "${config.environment}"
        - name: PORT
          value: "${config.server.port}"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: ${config.server.port}
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: ${config.server.port}
          initialDelaySeconds: 5
          periodSeconds: 5
`;

  const service = `apiVersion: v1
kind: Service
metadata:
  name: gutsafe-${config.environment}-service
spec:
  selector:
    app: gutsafe
    environment: ${config.environment}
  ports:
  - protocol: TCP
    port: 80
    targetPort: ${config.server.port}
  type: LoadBalancer
`;

  return { deployment, service };
};

// Export current deployment configuration
export const currentDeploymentConfig = getDeploymentConfig('development');

// Deployment helpers
export const isProductionDeployment = () => currentDeploymentConfig.environment === 'production';
export const isStagingDeployment = () => currentDeploymentConfig.environment === 'staging';
export const isDevelopmentDeployment = () => currentDeploymentConfig.environment === 'development';
export const isTestDeployment = () => currentDeploymentConfig.environment === 'test';
