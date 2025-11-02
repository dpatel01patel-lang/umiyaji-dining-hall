import { getApiUrl } from "./config";

// Simple in-memory cache for API responses
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  const headers = {
    "Content-Type": "application/json"
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper function to make authenticated requests with caching
const authenticatedFetch = async (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };
  
  // Generate cache key for GET requests
  if (options.method === 'GET' || !options.method) {
    const cacheKey = url + JSON.stringify(options.params || {});
    const cached = apiCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return {
        ok: true,
        json: () => Promise.resolve(cached.data),
        _fromCache: true
      };
    }
  }
  
  // Set timeout to prevent infinite loading
  const timeoutId = setTimeout(() => {
    throw new Error('Request timeout');
  }, options.timeout || 15000); // 15 second default timeout
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal
    });
    
    clearTimeout(timeoutId);
    
    // Cache successful GET responses
    if (response.ok && (options.method === 'GET' || !options.method)) {
      try {
        const data = await response.clone().json();
        const cacheKey = url + JSON.stringify(options.params || {});
        apiCache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
        
        // Limit cache size
        if (apiCache.size > 50) {
          const firstKey = apiCache.keys().next().value;
          apiCache.delete(firstKey);
        }
      } catch (e) {
        // Ignore JSON parsing errors for caching
      }
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Return a response-like object for timeout errors
    if (error.message === 'Request timeout') {
      return {
        ok: false,
        status: 408,
        json: () => Promise.resolve({
          success: false,
          error: 'Request timeout. Please try again.'
        })
      };
    }
    
    // Return a response-like object for network errors
    return {
      ok: false,
      status: 0,
      json: () => Promise.resolve({
        success: false,
        error: 'Network error. Please check your connection.'
      })
    };
  }
};

// Helper function to clear cache
export const clearApiCache = () => {
  apiCache.clear();
};

export const Meal = {
  _id: null,
  id: null,
  name: "",
  type: "",
  price: 0,
  prepTime: "",
  description: "",
  available: true,
};

export const Order = {
  _id: null,
  id: "",
  studentName: "",
  phone: "",
  items: [],
  total: 0,
  status: "pending",
  orderDate: "",
  time: "",
  date: "",
  deliveryTime: "",
  notes: "",
};

export const Subscription = {
  _id: null,
  id: null,
  studentName: "",
  phone: "",
  plan: "weekly",
  startDate: "",
  endDate: "",
  price: 0,
  status: "active",
};

// Meals API
export const mealsAPI = {
  getAll: async (type) => {
    const url = type ? `${getApiUrl("meals")}?type=${type}` : getApiUrl("meals");
    const response = await fetch(url);
    const result = await response.json();
    return result.data || [];
  },

  getById: async (id) => {
    const response = await fetch(getApiUrl(`meals/${id}`));
    const result = await response.json();
    return result.data || result;
  },

  create: async (meal) => {
    const response = await authenticatedFetch(getApiUrl("meals"), {
      method: "POST",
      body: JSON.stringify(meal),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create meal");
    }
    const result = await response.json();
    return result.data || result;
  },

  update: async (id, meal) => {
    const response = await authenticatedFetch(getApiUrl(`meals/${id}`), {
      method: "PUT",
      body: JSON.stringify(meal),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update meal");
    }
    const result = await response.json();
    return result.data || result;
  },

  delete: async (id) => {
    const response = await authenticatedFetch(getApiUrl(`meals/${id}`), {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete meal");
    }
    return response.json();
  },
};

// Orders API
export const ordersAPI = {
  getAll: async (status, date) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (date) params.append("date", date);
    const url =
      params.toString() === ""
        ? getApiUrl("orders")
        : `${getApiUrl("orders")}?${params.toString()}`;
    const response = await authenticatedFetch(url);
    const result = await response.json();
    return result.data || [];
  },

  getById: async (id) => {
    const response = await fetch(getApiUrl(`orders/${id}`));
    const result = await response.json();
    return result.data || result;
  },

  create: async (order) => {
    const response = await authenticatedFetch(getApiUrl("orders"), {
      method: "POST",
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create order");
    }
    const result = await response.json();
    return result.data || result;
  },

  update: async (id, order) => {
    const response = await authenticatedFetch(getApiUrl(`orders/${id}`), {
      method: "PUT",
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update order");
    }
    const result = await response.json();
    return result.data || result;
  },

  updateStatus: async (id, status) => {
    const response = await authenticatedFetch(getApiUrl(`orders/${id}/status`), {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update order status");
    }
    const result = await response.json();
    return result.data || result;
  },

  delete: async (id) => {
    const response = await authenticatedFetch(getApiUrl(`orders/${id}`), {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete order");
    }
    return response.json();
  },
};

// Subscriptions API
export const subscriptionsAPI = {
  getAll: async (status) => {
    const url = status
      ? `${getApiUrl("subscriptions")}?status=${status}`
      : getApiUrl("subscriptions");
    const response = await authenticatedFetch(url);
    const result = await response.json();
    return result.data || [];
  },

  getById: async (id) => {
    const response = await fetch(getApiUrl(`subscriptions/${id}`));
    const result = await response.json();
    return result.data || result;
  },

  create: async (subscription) => {
    const response = await authenticatedFetch(getApiUrl("subscriptions"), {
      method: "POST",
      body: JSON.stringify(subscription),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create subscription");
    }
    const result = await response.json();
    return result.data || result;
  },

  update: async (id, subscription) => {
    const response = await authenticatedFetch(getApiUrl(`subscriptions/${id}`), {
      method: "PUT",
      body: JSON.stringify(subscription),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update subscription");
    }
    const result = await response.json();
    return result.data || result;
  },

  delete: async (id) => {
    const response = await authenticatedFetch(getApiUrl(`subscriptions/${id}`), {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete subscription");
    }
    return response.json();
  },
};

// Analytics API (requires authentication)
export const analyticsAPI = {
  getAll: async () => {
    const response = await authenticatedFetch(getApiUrl("analytics"));
    const result = await response.json();
    return result.data || result;
  },
};

// Attendance API
export const attendanceAPI = {
  getAll: async (studentPhone, startDate, endDate) => {
    const params = new URLSearchParams();
    if (studentPhone) params.append("studentPhone", studentPhone);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const url =
      params.toString() === ""
        ? getApiUrl("attendance")
        : `${getApiUrl("attendance")}?${params.toString()}`;
    const response = await authenticatedFetch(url);
    const result = await response.json();
    // API returns { success: true, data: { attendances: [...] } }
    return result.data || {};
  },

  getByStudent: async (studentPhone, startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append("dateFrom", startDate);
    if (endDate) params.append("dateTo", endDate);
    const url =
      params.toString() === ""
        ? getApiUrl(`attendance/student/${studentPhone}/history`)
        : `${getApiUrl(`attendance/student/${studentPhone}/history`)}?${params.toString()}`;
    const response = await authenticatedFetch(url);
    const result = await response.json();
    return result.data || result;
  },

  record: async (attendanceData) => {
    const response = await authenticatedFetch(getApiUrl("attendance"), {
      method: "POST",
      body: JSON.stringify(attendanceData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to record attendance");
    }
    const result = await response.json();
    return result.data || result;
  },

  delete: async (id) => {
    const response = await authenticatedFetch(getApiUrl(`attendance/${id}`), {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete attendance");
    }
    return response.json();
  },
};

// Bills API
export const billsAPI = {
  getAll: async (studentPhone, status) => {
    const params = new URLSearchParams();
    if (studentPhone) params.append("studentPhone", studentPhone);
    if (status) params.append("status", status);
    const url =
      params.toString() === ""
        ? getApiUrl("bills")
        : `${getApiUrl("bills")}?${params.toString()}`;
    const response = await fetch(url);
    const result = await response.json();
    return result.data || [];
  },

  getByStudent: async (studentPhone) => {
    const response = await fetch(getApiUrl(`bills/student/${studentPhone}`));
    const result = await response.json();
    return result.data || result;
  },

  getById: async (id) => {
    const response = await fetch(getApiUrl(`bills/${id}`));
    const result = await response.json();
    return result.data || result;
  },

  generate: async (billData) => {
    const response = await authenticatedFetch(getApiUrl("bills/generate"), {
      method: "POST",
      body: JSON.stringify(billData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate bill");
    }
    const result = await response.json();
    return result.data || result;
  },

  getAttendanceHistory: async (studentPhone, startDate, endDate) => {
    const response = await fetch(
      `${getApiUrl(`bills/attendance-history/${studentPhone}`)}?startDate=${startDate}&endDate=${endDate}`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get attendance history");
    }
    const result = await response.json();
    return result.data || result;
  },

  updateStatus: async (id, status) => {
    const response = await authenticatedFetch(getApiUrl(`bills/${id}/status`), {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update bill status");
    }
    const result = await response.json();
    return result.data || result;
  },
};

// Clients API
export const clientsAPI = {
  getAll: async () => {
    const response = await fetch(getApiUrl("clients"));
    const result = await response.json();
    return result.data || [];
  },

  getById: async (id) => {
    const response = await fetch(getApiUrl(`clients/${id}`));
    const result = await response.json();
    return result.data || result;
  },

  getByPhone: async (phone) => {
    const response = await fetch(getApiUrl(`clients/phone/${phone}`));
    const result = await response.json();
    return result.data || result;
  },

  create: async (clientData) => {
    const response = await authenticatedFetch(getApiUrl("clients"), {
      method: "POST",
      body: JSON.stringify(clientData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create client");
    }
    const result = await response.json();
    return result.data || result;
  },

  update: async (id, clientData) => {
    const response = await authenticatedFetch(getApiUrl(`clients/${id}`), {
      method: "PUT",
      body: JSON.stringify(clientData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update client");
    }
    const result = await response.json();
    return result.data || result;
  },

  delete: async (id) => {
    const response = await authenticatedFetch(getApiUrl(`clients/${id}`), {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete client");
    }
    return response.json();
  },
};

// Notifications API
export const notificationsAPI = {
  getByUser: async (studentPhone, limit) => {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    const url =
      params.toString() === ""
        ? getApiUrl(`notifications/user/${studentPhone}`)
        : `${getApiUrl(`notifications/user/${studentPhone}`)}?${params.toString()}`;
    const response = await fetch(url);
    const result = await response.json();
    return result.data || [];
  },

  getUnreadCount: async (studentPhone) => {
    const response = await fetch(
      getApiUrl(`notifications/count/${studentPhone}`)
    );
    const result = await response.json();
    return result.data || result;
  },

  markAsRead: async (id) => {
    const response = await authenticatedFetch(getApiUrl(`notifications/${id}/read`), {
      method: "PATCH",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to mark notification as read");
    }
    const result = await response.json();
    return result.data || result;
  },

  send: async (notificationData) => {
    const response = await authenticatedFetch(getApiUrl("notifications"), {
      method: "POST",
      body: JSON.stringify(notificationData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send notification");
    }
    const result = await response.json();
    return result.data || result;
  },

  sendBatch: async (notificationData) => {
    const response = await authenticatedFetch(getApiUrl("notifications/batch"), {
      method: "POST",
      body: JSON.stringify(notificationData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send notifications");
    }
    const result = await response.json();
    return result.data || result;
  },
};
