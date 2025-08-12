// Environment Configuration
// Reads all sensitive or environment-specific values from .env

const getEnvironmentConfig = () => {
  // Determine environment - commented unused variables
  // const isDevelopment = process.env.NODE_ENV === 'development';
  // const isProduction = process.env.NODE_ENV === 'production';
  // const isTest = process.env.NODE_ENV === 'test';

  // Base configuration
  const baseConfig = {
    app: {
      name: process.env.REACT_APP_NAME || 'Coffee Meeting Platform',
      version: process.env.REACT_APP_VERSION || '2.0.0',
      environment: process.env.NODE_ENV || 'production',
      debug: process.env.REACT_APP_DEBUG === 'true' || false,
      timezone: process.env.REACT_APP_TIMEZONE || 'UTC',
    },
    
    api: {
      baseUrl: process.env.REACT_APP_API_URL || '',
      timeout: parseInt(process.env.REACT_APP_API_TIMEOUT, 10) || 30000,
      retryAttempts: parseInt(process.env.REACT_APP_API_RETRY_ATTEMPTS, 10) || 3,
      retryDelay: parseInt(process.env.REACT_APP_API_RETRY_DELAY, 10) || 1000,
    },

    frontend: {
      baseUrl: process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000',
    },
    
    auth: {
      tokenRefreshThreshold: parseInt(process.env.REACT_APP_TOKEN_REFRESH_THRESHOLD, 10) || 300,
      maxLoginAttempts: parseInt(process.env.REACT_APP_MAX_LOGIN_ATTEMPTS, 10) || 5,
      lockoutDuration: parseInt(process.env.REACT_APP_LOCKOUT_DURATION, 10) || 900,
    },
    
    features: {
      enableNotifications: process.env.REACT_APP_ENABLE_NOTIFICATIONS !== 'false',
      enableRealTimeUpdates: process.env.REACT_APP_ENABLE_REALTIME_UPDATES !== 'false',
      enableFileUpload: process.env.REACT_APP_ENABLE_FILE_UPLOAD !== 'false',
      enableBulkOperations: process.env.REACT_APP_ENABLE_BULK_OPERATIONS !== 'false',
      enableDebugLogging: process.env.REACT_APP_ENABLE_DEBUG_LOGGING === 'true',
    },

    cors: {
      origin: (process.env.REACT_APP_CORS_ORIGIN || '')
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean),
    }
  };

  return baseConfig;
};

// Export the configuration
const config = getEnvironmentConfig();

// Export individual components for convenience
export const API_BASE_URL = config.api.baseUrl;
export const FRONTEND_BASE_URL = config.frontend.baseUrl;
export const APP_NAME = config.app.name;
export const APP_VERSION = config.app.version;
export const DEBUG_MODE = config.app.debug;

export default config;
