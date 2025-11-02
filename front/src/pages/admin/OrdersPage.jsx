import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate, useLocation } from "react-router-dom";
import { ordersAPI, notificationsAPI } from "@/lib/api";
import { showError, showSuccess } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ShoppingBag,
  ArrowLeft,
  BarChart3,
  UtensilsCrossed,
  Plus,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function OrdersPage({ className }) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedStatus, setSelectedStatus] = useState(
    "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const viewRecords = searchParams.get('view') === 'records';

  // Load orders from API
  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      // API returns { data: { orders: [...] } } so we need to extract orders array
      const ordersData = Array.isArray(response.orders)
        ? response.orders
        : Array.isArray(response)
          ? response
          : [];
      const formattedOrders = ordersData.map((order) => ({
        ...order,
        id: order._id,
        date: new Date(order.orderDate).toISOString().split("T")[0],
        time: new Date(order.orderDate).toLocaleTimeString(),
      }));
      setOrders(formattedOrders);
    } catch (err) {
      console.error("Error loading orders:", err);
      setOrders([]); // Ensure orders is always an array
    }
  };

  useEffect(() => {
    loadOrders();

    // Set up polling for real-time updates (every 30 seconds) as fallback
    const interval = setInterval(loadOrders, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (!orderId) return;

    setLoading(true);
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      // Update local state
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order,
        ),
      );

      // Send notification to student
      const order = orders.find(o => o._id === orderId);
      if (order) {
        const statusMessages = {
          preparing: "Your order is now being prepared",
          ready: "Your order is ready for pickup!",
          completed: "Your order has been completed. Thank you!",
          cancelled: "Your order has been cancelled"
        };

        await notificationsAPI.send({
          studentPhone: order.phone,
          studentName: order.studentName,
          title: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
          message: statusMessages[newStatus] || `Order status updated to ${newStatus}`,
          type: "order",
          relatedId: orderId
        });

        // Show success toast
        showSuccess(`Order status updated to ${newStatus}`, 'Update Order Status');
      }
    } catch (err) {
      showError(err, 'Update Order');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const dateMatch = order.date === selectedDate;
    const statusMatch =
      selectedStatus === "all" || order.status === selectedStatus;
    return dateMatch && statusMatch;
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, selectedStatus]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className={className}>
      {viewRecords ? (
        /* All Orders Page */
        <div>
          {/* Header with Back Button */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <button
                onClick={() => navigate('/admin/orders')}
                className="p-2 sm:p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
              >
                <ArrowLeft size={15} className="text-white sm:w-6 sm:h-6" />
              </button>
              <div className="flex-1">
                <h2 className="text-sm sm:text-xl font-bold text-gray-900">All Orders</h2>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Complete order history with advanced filters</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-lg">
                <ShoppingBag size={15} className="text-white sm:w-6 sm:h-6" />
              </div>
            </div>

            {/* Enhanced Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  📅 Date Filter
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 h-10 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  🏷️ Status Filter
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium bg-white"
                >
                  <option value="all">🌟 All Orders</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="preparing">⚡ Preparing</option>
                  <option value="ready">✅ Ready</option>
                  <option value="completed">🎉 Completed</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  📊 Quick Stats
                </label>
                <div className="text-sm font-medium text-gray-600">
                  Total: {filteredOrders.length} | Ready: {filteredOrders.filter(o => o.status === "ready").length}
                </div>
              </div>
            </div>
          </div>

          {/* All Orders List */}
          <div className="space-y-3">
            {currentPageOrders.length > 0 ? (
              currentPageOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-3 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                          #{order._id?.slice(-6).toUpperCase() || "ORD001"}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-bold px-2 py-1 rounded-full capitalize",
                            order.status === "ready"
                              ? "bg-green-100 text-green-800"
                              : order.status === "preparing"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800",
                          )}
                        >
                          {order.status === "pending" ? "⏳ " + order.status :
                            order.status === "preparing" ? "⚡ " + order.status :
                              order.status === "ready" ? "✅ " + order.status :
                                order.status === "completed" ? "🎉 " + order.status : order.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">₹{order.total}</div>
                        <div className="text-xs text-gray-500">{order.time}</div>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{order.studentName}</h4>
                        <p className="text-xs text-gray-600">{order.phone}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-md p-2 mb-3">
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">Items:</span>{" "}
                        {order.items
                          .map((item) => item.mealName || item)
                          .join(", ")}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1">
                      {order.status === "pending" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, "preparing")}
                          disabled={loading}
                          className="flex-1 px-2 py-1.5 bg-yellow-500 text-white rounded-md text-xs font-bold hover:bg-yellow-600 transition-colors disabled:opacity-50"
                        >
                          ⚡ Start
                        </button>
                      )}
                      {order.status === "preparing" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, "ready")}
                          disabled={loading}
                          className="flex-1 px-2 py-1.5 bg-green-500 text-white rounded-md text-xs font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          ✅ Ready
                        </button>
                      )}
                      {order.status === "ready" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, "completed")}
                          disabled={loading}
                          className="flex-1 px-2 py-1.5 bg-blue-500 text-white rounded-md text-xs font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                          🎉 Done
                        </button>
                      )}
                      {order.status !== "completed" && order.status !== "cancelled" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, "cancelled")}
                          disabled={loading}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-md text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          X
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl border border-indigo-200">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <ShoppingBag size={24} className="text-white sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">No Orders Found</h3>
                <p className="text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
                  No orders match your current filter criteria
                </p>
                <button
                  onClick={() => navigate('/admin/orders')}
                  className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg text-sm sm:text-base"
                >
                  <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
                  Back to Main Orders
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ⬅️
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                      currentPage === pageNumber
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ➡️
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Regular Orders Tab - Show only 1 record */
        <div>
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
              <ShoppingBag size={14} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Order Management</h2>
              <p className="text-xs text-gray-600 font-medium">Track and manage recent orders</p>
            </div>
          </div>

          {/* Compact Filters */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-100 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  📅 Date Filter
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 h-8 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  🏷️ Status Filter
                </label>
                <div className="flex gap-1 flex-wrap">
                  {(["all", "preparing", "ready", "completed"]).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={cn(
                          "px-2 py-1 rounded-md text-xs font-medium transition-all capitalize",
                          selectedStatus === status
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200",
                        )}
                      >
                        {status === "all" ? "🌟 All" :
                          status === "preparing" ? "⚡ " + status :
                            status === "ready" ? "✅ " + status :
                              status === "completed" ? "🎉 " + status : status}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Orders Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-100">
              <div className="text-xs font-semibold text-blue-800">Total Orders</div>
              <div className="text-sm font-bold text-blue-600">{filteredOrders.length}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2 text-center border border-green-100">
              <div className="text-xs font-semibold text-green-800">Ready</div>
              <div className="text-sm font-bold text-green-600">
                {filteredOrders.filter(o => o.status === "ready").length}
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-2 text-center border border-yellow-100">
              <div className="text-xs font-semibold text-yellow-800">Preparing</div>
              <div className="text-sm font-bold text-yellow-600">
                {filteredOrders.filter(o => o.status === "preparing").length}
              </div>
            </div>
          </div>

          {/* Orders List - Show only 1 record initially */}
          <div className="space-y-2">
            {currentPageOrders.length > 0 ? (
              // Show only the first order
              [currentPageOrders[0]].map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-3 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                          #{order._id?.slice(-6).toUpperCase() || "ORD001"}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-bold px-2 py-1 rounded-full capitalize",
                            order.status === "ready"
                              ? "bg-green-100 text-green-800"
                              : order.status === "preparing"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800",
                          )}
                        >
                          {order.status === "pending" ? "⏳ " + order.status :
                            order.status === "preparing" ? "⚡ " + order.status :
                              order.status === "ready" ? "✅ " + order.status :
                                order.status === "completed" ? "🎉 " + order.status : order.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">₹{order.total}</div>
                        <div className="text-xs text-gray-500">{order.time}</div>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{order.studentName}</h4>
                        <p className="text-xs text-gray-600">{order.phone}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-md p-2 mb-3">
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">Items:</span>{" "}
                        {order.items
                          .map((item) => item.mealName || item)
                          .join(", ")}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1">
                      {order.status === "pending" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, "preparing")}
                          disabled={loading}
                          className="flex-1 px-2 py-1.5 bg-yellow-500 text-white rounded-md text-xs font-bold hover:bg-yellow-600 transition-colors disabled:opacity-50"
                        >
                          ⚡ Start
                        </button>
                      )}
                      {order.status === "preparing" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, "ready")}
                          disabled={loading}
                          className="flex-1 px-2 py-1.5 bg-green-500 text-white rounded-md text-xs font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          ✅ Ready
                        </button>
                      )}
                      {order.status === "ready" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, "completed")}
                          disabled={loading}
                          className="flex-1 px-2 py-1.5 bg-blue-500 text-white rounded-md text-xs font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                          🎉 Done
                        </button>
                      )}
                      {order.status !== "completed" && order.status !== "cancelled" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, "cancelled")}
                          disabled={loading}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-md text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          X
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                <div className="text-4xl mb-2">📦</div>
                <p className="text-sm font-medium">No orders found</p>
                <p className="text-xs text-gray-400 mt-1">Orders will appear here when customers place them</p>
              </div>
            )}

            {/* View All Orders Button */}
            <div className="mt-6">
              <button
                onClick={() => navigate('/admin/orders?view=records')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg text-sm"
              >
                <BarChart3 size={16} />
                <span>View All Orders ({orders.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
