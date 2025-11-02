// Global error handler for the entire application
export const AppError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "AppError";
  }
};

export class ErrorHandler {
  static instance;

  static getInstance() {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Simple DOM-based notification system
  showNotification(message, type, context) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 animate-slide-in-down max-w-sm w-full`;
    
    // Style based on type
    const styles = {
      error: 'bg-red-50 border-red-200 text-red-800 border-l-4 border-l-red-500',
      success: 'bg-green-50 border-green-200 text-green-800 border-l-4 border-l-green-500',
      info: 'bg-blue-50 border-blue-200 text-blue-800 border-l-4 border-l-blue-500'
    };

    notification.innerHTML = `
      <div class="px-4 py-3 rounded-xl shadow-lg border ${styles[type]}">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0">
            ${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium">${context ? `${context}:` : ''} ${message}</p>
          </div>
          <button class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors" onclick="this.parentElement.parentElement.remove()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Add to DOM
    document.body.appendChild(notification);

    // Auto remove after 3-5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, type === 'error' ? 5000 : 3000);
  }

  // Handle different types of errors and show appropriate messages
  handle(error, context) {
    console.error(`Error in ${context || 'application'}:`, error);

    let message = "An unexpected error occurred";
    let type = 'error';

    // Handle different error types
    if (typeof error === 'string') {
      message = error;
    } else if (error?.message) {
      // Network errors
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('NetworkError')) {
        message = "Please check your internet connection and try again";
      }
      // Authentication errors
      else if (error.message.includes('auth') || error.message.includes('unauthorized') || error.message.includes('401')) {
        message = "Your session may have expired. Please log in again";
      }
      // Validation errors
      else if (error.message.includes('validation') || error.message.includes('required') || error.message.includes('invalid')) {
        message = error.message;
      }
      // Server errors
      else if (error.message.includes('500') || error.message.includes('server') || error.message.includes('internal')) {
        message = "There was a problem with the server. Please try again later";
      }
      // Permission errors
      else if (error.message.includes('403') || error.message.includes('forbidden') || error.message.includes('permission')) {
        message = "You don't have permission to perform this action";
      }
      // Resource not found
      else if (error.message.includes('404') || error.message.includes('not found')) {
        message = "The requested resource was not found";
      }
      // Default error message
      else {
        message = error.message;
      }
    } else {
      message = error?.toString() || "An unexpected error occurred";
    }

    // Show error notification
    this.showNotification(message, 'error', context);

    // If in development, also log the full error
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error details:', {
        error,
        context,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Handle success messages
  handleSuccess(message, context) {
    this.showNotification(message, 'success', context);
  }

  // Handle info messages
  handleInfo(message, context) {
    this.showNotification(message, 'info', context);
  }

  // Wrapper for async operations to automatically handle errors
  async wrap(operation, context) {
    try {
      return await operation();
    } catch (error) {
      this.handle(error, context);
      return null;
    }
  }

  // Wrap function calls with error handling
  wrapFunction(fn, context) {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        this.handle(error, context);
        return null;
      }
    };
  }
}

// Create global instance
export const errorHandler = ErrorHandler.getInstance();

// Helper functions for quick access
export const showError = (error, context) => errorHandler.handle(error, context);
export const showSuccess = (message, context) => errorHandler.handleSuccess(message, context);
export const showInfo = (message, context) => errorHandler.handleInfo(message, context);

// Error types for better type safety
export const ErrorTypes = {
  NETWORK: 'NETWORK',
  AUTH: 'AUTH',
  VALIDATION: 'VALIDATION',
  SERVER: 'SERVER',
  PERMISSION: 'PERMISSION',
  NOT_FOUND: 'NOT_FOUND',
  UNKNOWN: 'UNKNOWN'
};

// Custom error classes
export class NetworkError extends Error {
  code = ErrorTypes.NETWORK;
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthError extends Error {
  code = ErrorTypes.AUTH;
  constructor(message) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends Error {
  code = ErrorTypes.VALIDATION;
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ServerError extends Error {
  code = ErrorTypes.SERVER;
  statusCode = 500;
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'ServerError';
    this.statusCode = statusCode;
  }
}
