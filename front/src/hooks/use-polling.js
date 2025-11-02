import { useState, useEffect, useCallback } from "react";
import { showError } from "@/lib/error-handler";

// Generic polling hook
export function usePolling(callback, interval, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    let isActive = true;
    const intervalId = setInterval(async () => {
      if (isActive) {
        try {
          await callback();
        } catch (error) {
          console.error("Polling callback error:", error);
        }
      }
    }, interval);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [callback, interval, enabled]);
}

// Meals polling hook for students
export function useMealsPolling() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMeals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/meals");
      const data = await response.json();
      setMeals(data);
    } catch (error) {
      console.error("Failed to fetch meals:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(fetchMeals, 15000); // Poll every 15 seconds

  return { meals, loading, refreshMeals: fetchMeals };
}

// Notification polling hook
export function useNotificationsPolling(userPhone) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!userPhone) return;

    try {
      const response = await fetch(`/api/notifications/user/${userPhone}`);
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [userPhone]);

  usePolling(fetchNotifications, 10000, !!userPhone); // Poll every 10 seconds

  return {
    notifications,
    unreadCount,
    refreshNotifications: fetchNotifications,
  };
}

// Order status polling hook
export function useOrdersPolling(userPhone) {
  const [orders, setOrders] = useState([]);

  const fetchOrders = useCallback(async () => {
    if (!userPhone) return;

    try {
      const response = await fetch(`/api/orders?phone=${userPhone}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  }, [userPhone]);

  usePolling(fetchOrders, 15000, !!userPhone); // Poll every 15 seconds

  return { orders, refreshOrders: fetchOrders };
}

// Attendance updates polling hook
export function useAttendancePolling(userPhone) {
  const [attendance, setAttendance] = useState([]);

  const fetchAttendance = useCallback(async () => {
    if (!userPhone) return;

    try {
      const response = await fetch(`/api/attendance?studentPhone=${userPhone}`);
      const data = await response.json();
      setAttendance(data);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    }
  }, [userPhone]);

  usePolling(fetchAttendance, 20000, !!userPhone); // Poll every 20 seconds

  return { attendance, refreshAttendance: fetchAttendance };
}

// Admin polling hooks
export function useAdminOrdersPolling() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch admin orders:", error);
      showError("Failed to refresh orders", "Real-time Update");
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(fetchOrders, 5000); // Poll every 5 seconds for admin

  return { orders, loading, refreshOrders: fetchOrders };
}

export function useAdminMealsPolling() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMeals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/meals");
      const data = await response.json();
      setMeals(data);
    } catch (error) {
      console.error("Failed to fetch meals:", error);
      showError("Failed to refresh meals", "Real-time Update");
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(fetchMeals, 10000); // Poll every 10 seconds for admin

  return { meals, loading, refreshMeals: fetchMeals };
}
