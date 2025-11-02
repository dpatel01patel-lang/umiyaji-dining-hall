import { config, WEBSOCKET_URL } from './config';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = config.websocket.reconnectAttempts || 5;
    this.reconnectDelay = config.websocket.reconnectDelay || 1000;
    this.listeners = new Map();
    this.wsUrl = WEBSOCKET_URL;
  }

  connect(userRole, userPhone) {
    try {
      console.log("Connecting to WebSocket:", this.wsUrl);

      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log("✅ WebSocket connected");
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Send identification
        this.send({
          type: "identify",
          userRole,
          userPhone,
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket message received:", data);

          // Handle different message types
          this.handleMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      this.ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        this.isConnected = false;

        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
            this.connect(userRole, userPhone);
          }, this.reconnectDelay);
        }
      };
    } catch (error) {
      console.error("WebSocket connection error:", error);
    }
  }

  handleMessage(data) {
    // Handle different event types
    switch (data.type) {
      case "meal-updated":
      case "meal-added":
      case "meal-deleted":
        this.emit("meals-update", data);
        break;

      case "order-status-changed":
      case "new-order":
        this.emit("orders-update", data);
        break;

      case "attendance-updated":
        this.emit("attendance-update", data);
        break;

      case "subscription-updated":
      case "subscription-created":
      case "subscription-deleted":
        this.emit("subscriptions-update", data);
        break;

      case "bill-generated":
      case "bill-updated":
        this.emit("bills-update", data);
        break;

      case "client-updated":
      case "client-deleted":
        this.emit("clients-update", data);
        break;

      case "notification":
        this.emit("notification", data);
        break;

      default:
        console.log("Unknown message type:", data.type);
    }
  }

  // Send message to server
  send(data) {
    if (this.ws && this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket not connected, message not sent:", data);
    }
  }

  // Add event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  // Remove event listener
  off(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  // Emit event to listeners
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in WebSocket event callback:", error);
        }
      });
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.ws?.readyState,
      wsUrl: this.wsUrl,
    };
  }

  // Disconnect
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
      this.listeners.clear();
      console.log("WebSocket disconnected");
    }
  }

  // Keep connection alive
  startHeartbeat() {
    setInterval(() => {
      if (this.isConnected) {
        this.send({ type: "ping" });
      }
    }, 30000); // Send ping every 30 seconds
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();

// Start heartbeat
webSocketService.startHeartbeat();

export default webSocketService;
