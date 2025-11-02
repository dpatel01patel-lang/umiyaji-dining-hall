# API Configuration Guide

This document explains how to use the centralized configuration system for API URLs and WebSocket connections.

## Overview

All API URLs and WebSocket endpoints are now managed in a single configuration file: `frontend/src/lib/config.js`. This makes it easy to update URLs when deploying to different environments or changing backend services.

## Files Modified

- **`frontend/src/lib/config.js`** - New centralized configuration file
- **`frontend/src/lib/api.js`** - Updated to use configuration
- **`frontend/src/lib/websocket.js`** - Updated to use configuration

## Configuration Structure

The configuration includes:

### API Configuration
- `baseUrl` - The base URL for all API requests
- `timeout` - Request timeout in milliseconds

### WebSocket Configuration
- `url` - WebSocket server URL
- `reconnectAttempts` - Maximum reconnection attempts
- `reconnectDelay` - Delay between reconnection attempts in milliseconds

### Environment Detection
The system automatically detects the environment:
- **Development**: Uses `localhost` URLs and relative API paths
- **Production**: Uses the production URLs (e.g., Render.com)

## How to Update URLs

### For Development
Update the URLs in the `developmentConfig` section of `frontend/src/lib/config.js`:

```javascript
const developmentConfig = {
  api: {
    baseUrl: "/api",  // Change this for development
    timeout: 10000,
  },
  websocket: {
    url: "ws://localhost:8080/ws",  // Change this for development
    reconnectAttempts: 5,
    reconnectDelay: 1000,
  },
  environment: "development",
};
```

### For Production
Update the URLs in the `productionConfig` section of `frontend/src/lib/config.js`:

```javascript
const productionConfig = {
  api: {
    baseUrl: "https://your-new-domain.com/api",  // Update production URL here
    timeout: 15000,
  },
  websocket: {
    url: "wss://your-new-domain.com/ws",  // Update production WebSocket URL here
    reconnectAttempts: 5,
    reconnectDelay: 1000,
  },
  environment: "production",
};
```

## Usage Examples

### Using Configuration in Components

```javascript
import { API_BASE_URL, WEBSOCKET_URL, getApiUrl, isDevelopment, isProduction } from '../lib/config';

// Use API base URL
const apiUrl = API_BASE_URL;

// Use WebSocket URL
const wsUrl = WEBSOCKET_URL;

// Get full API URL for an endpoint
const fullUrl = getApiUrl('/orders');  // Returns: `${API_BASE_URL}/orders`

// Check environment
if (isDevelopment()) {
  console.log('Running in development mode');
}

// Check if in production
if (isProduction()) {
  console.log('Running in production mode');
}
```

### Environment-specific Behavior

```javascript
import { isDevelopment, config } from '../lib/config';

if (isDevelopment()) {
  // Use mock data or enable debug features
  console.log('Environment:', config.environment);
  console.log('API Base:', config.api.baseUrl);
  console.log('WebSocket URL:', config.websocket.url);
}
```

## Validation

The configuration file includes automatic validation that runs on import. Check the browser console for any configuration errors during development.

## Benefits

1. **Single Source of Truth**: All URLs in one place
2. **Environment Aware**: Automatic environment detection
3. **Easy Updates**: Change URLs in one file instead of multiple files
4. **Type Safety**: TypeScript interfaces for configuration
5. **Validation**: Built-in configuration validation
6. **Convenience**: Helper functions for common operations

## Migration Notes

If you were previously using hardcoded URLs like:

```javascript
// Old way (hardcoded)
const API_BASE = "https://example.com/api";
const WS_URL = "wss://example.com/ws";
```

You can now replace them with:

```javascript
// New way (centralized)
import { API_BASE_URL, WEBSOCKET_URL } from './config';

const API_BASE = API_BASE_URL;
const WS_URL = WEBSOCKET_URL;
```

## Troubleshooting

If you encounter issues:

1. Check browser console for configuration validation errors
2. Verify URLs are properly formatted (https:// for API, wss:// for WebSocket)
3. Ensure all URLs are properly quoted strings
4. Test with the `validateConfig()` function
5. Check environment detection logic matches your setup