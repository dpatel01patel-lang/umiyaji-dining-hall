import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { analyticsAPI, subscriptionsAPI, ordersAPI } from "@/lib/api";
import {
  ShoppingBag,
  TrendingUp,
  Users,
  BarChart3,
} from "lucide-react";

export default function AnalyticsPage({ className }) {
  const { userProfile } = useAuth();
  const [analytics, setAnalytics] = useState({
    overview: {
      todayOrders: 0,
      todayAttendance: 0,
      totalOrders: 0,
      totalMeals: 0,
      totalAttendance: 0,
      totalSubscriptions: 0,
      activeSubscriptions: 0
    },
    revenueData: [],
    ordersByStatus: [],
    mealsByType: []
  });
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load analytics from API
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await analyticsAPI.getAll();
        // The API returns { success: true, data: { overview: {...}, ... } }
        if (data && data.overview) {
          setAnalytics(data);
        }
      } catch (err) {
        console.error("Error loading analytics:", err);
      }
    };

    const loadSubscriptions = async () => {
      try {
        const data = await subscriptionsAPI.getAll();
        // Ensure data is always an array
        const subscriptionsData = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
        setSubscriptions(subscriptionsData);
      } catch (err) {
        console.error("Error loading subscriptions:", err);
        setSubscriptions([]); // Ensure subscriptions is always an array
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
    loadSubscriptions();
  }, []);

  return (
    <div className={className}>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Analytics</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Today's Orders</p>
              <p className="text-3xl font-bold mt-2">
                {analytics.overview.todayOrders || 0}
              </p>
            </div>
            <ShoppingBag size={32} className="opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Today's Attendance</p>
              <p className="text-3xl font-bold mt-2">
                {analytics.overview.todayAttendance || 0}
              </p>
            </div>
            <TrendingUp size={32} className="opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Active Subscriptions</p>
              <p className="text-3xl font-bold mt-2">
                {analytics.overview.activeSubscriptions || 0}
              </p>
            </div>
            <Users size={32} className="opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Revenue (Today)</p>
              <p className="text-2xl font-bold mt-2">
                ₹{analytics.revenueData && analytics.revenueData.length > 0
                  ? analytics.revenueData[analytics.revenueData.length - 1]?.revenue || 0
                  : 0}
              </p>
            </div>
            <BarChart3 size={32} className="opacity-50" />
          </div>
        </div>
      </div>

      {/* Subscription Analytics */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Subscription Analytics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-2xl font-bold text-blue-600">
              {subscriptions.filter(s => s.plan === "weekly").length}
            </p>
            <p className="text-sm text-gray-600">Weekly Plans</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <p className="text-2xl font-bold text-purple-600">
              {subscriptions.filter(s => s.plan === "monthly").length}
            </p>
            <p className="text-sm text-gray-600">Monthly Plans</p>
          </div>
        </div>
      </div>
    </div>
  );
}
