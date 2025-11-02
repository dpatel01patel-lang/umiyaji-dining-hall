/**
 * Centralized configuration file for API URLs and other settings
 * Update URLs here when deploying to different environments
 */

export const Config = {
  // API Configuration
  api: {
    baseUrl: "",
    timeout: 0,
  },
  
  // WebSocket Configuration  
  websocket: {
    url: "",
    reconnectAttempts: 0,
    reconnectDelay: 0,
  },
  
  // Environment
  environment: "development",
};

// Development configuration
const developmentConfig = {
  api: {
    baseUrl: "http://localhost:8000/api",  // Full URL for development
    timeout: 10000,   // 10 seconds
  },
  websocket: {
    url: "ws://localhost:8080/ws",  // WebSocket for development
    reconnectAttempts: 5,
    reconnectDelay: 1000,
  },
  environment: "development",
};

// Production configuration
const productionConfig = {
  api: {
    baseUrl: "https://umiyaji-dining-hall.onrender.com/api",
    timeout: 15000,   // 15 seconds for production
  },
  websocket: {
    url: "wss://umiyaji-dining-hall.onrender.com/ws",  // Secure WebSocket for production
    reconnectAttempts: 5,
    reconnectDelay: 1000,
  },
  environment: "production",
};

// Determine environment based on process or window location
const getEnvironment = () => {
  // Check for explicit environment variable
  if (typeof process !== "undefined" && process.env?.NODE_ENV) {
    return process.env.NODE_ENV === "production" ? "production" : "development";
  }
  
  // Check for development mode (Vite) - type assertion for import.meta
  if (typeof import.meta !== "undefined" && import.meta?.dev) {
    return "development";
  }
  
  // Check if running on localhost (development)
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "development";
  }
  
  // Default to production
  return "production";
};

// Export the appropriate configuration
export const config = getEnvironment() === "development" 
  ? developmentConfig 
  : productionConfig;

// Export individual config values for convenience
export const {
  api: {
    baseUrl: API_BASE_URL,
    timeout: API_TIMEOUT,
  },
  websocket: {
    url: WEBSOCKET_URL,
    reconnectAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectDelay: RECONNECT_DELAY,
  },
  environment: ENVIRONMENT,
} = config;

// Validation function to ensure URLs are properly configured
export const validateConfig = () => {
  const requiredUrls = [API_BASE_URL, WEBSOCKET_URL];
  
  for (const url of requiredUrls) {
    if (!url || typeof url !== "string" || url.trim() === "") {
      console.error("Configuration validation failed:", {
        API_BASE_URL,
        WEBSOCKET_URL,
        missingUrl: url === "" ? "empty" : "undefined"
      });
      return false;
    }
  }
  
  // Check for protocol in URLs
  if (!API_BASE_URL.startsWith("http://") && !API_BASE_URL.startsWith("https://") && !API_BASE_URL.startsWith("/")) {
    console.error("API_BASE_URL must be an absolute URL (with http/https) or relative path (starting with /)");
    return false;
  }
  
  if (!WEBSOCKET_URL.startsWith("ws://") && !WEBSOCKET_URL.startsWith("wss://")) {
    console.error("WEBSOCKET_URL must start with ws:// or wss://");
    return false;
  }
  
  return true;
};

// Validate configuration on import (will log to console if invalid)
validateConfig();

// Export configuration helper functions
export const getApiUrl = (endpoint) => {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export const isDevelopment = () => ENVIRONMENT === "development";
export const isProduction = () => ENVIRONMENT === "production";