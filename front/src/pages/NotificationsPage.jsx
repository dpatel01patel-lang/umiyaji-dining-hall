import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { showError, showSuccess } from "@/lib/error-handler";
import { notificationsAPI } from "@/lib/api";
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  Search,
  Filter,
  Clock,
  FileText,
  CreditCard,
  ShoppingCart,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export default function NotificationsPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, [userProfile?.phone]);

  // Reset to first page when search or filter changes
  useEffect(() => {
    if (searchTerm || filterType !== "all" || filterStatus !== "all") {
      setCurrentPage(1);
    }
  }, [searchTerm, filterType, filterStatus]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchTerm, filterType, filterStatus, currentPage, itemsPerPage]);

  const loadNotifications = async () => {
    if (!userProfile?.phone) return;

    setLoading(true);
    try {
      const data = await notificationsAPI.getByUser(userProfile.phone);
      setNotifications(data);
    } catch (err) {
      console.error("Error loading notifications:", err);
      showError("Failed to load notifications", "Notifications");
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (notif) =>
          notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notif.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((notif) => notif.type === filterType);
    }

    // Status filter
    if (filterStatus !== "all") {
      if (filterStatus === "read") {
        filtered = filtered.filter((notif) => notif.read);
      } else if (filterStatus === "unread") {
        filtered = filtered.filter((notif) => !notif.read);
      }
    }

    // Calculate pagination
    setTotalItems(filtered.length);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));

    // Reset to first page if current page exceeds total pages
    const totalPagesCount = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage > totalPagesCount && totalPagesCount > 0) {
      setCurrentPage(1);
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filtered.slice(startIndex, endIndex);

    setFilteredNotifications(paginatedData);
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, read: true }
            : notif
        )
      );

      showSuccess("Notification marked as read", "Notifications");
    } catch (err) {
      console.error("Error marking notification as read:", err);
      showError("Failed to mark notification as read", "Notifications");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(notif => !notif.read);

      // Mark all unread notifications as read
      await Promise.all(
        unreadNotifications.map(notif =>
          notificationsAPI.markAsRead(notif._id)
        )
      );

      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );

      showSuccess("All notifications marked as read", "Notifications");
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      showError("Failed to mark all notifications as read", "Notifications");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "attendance":
        return <Calendar className="text-blue-600" size={14} />;
      case "bill":
        return <CreditCard className="text-orange-600" size={14} />;
      case "menu":
        return <FileText className="text-green-600" size={14} />;
      case "order":
        return <ShoppingCart className="text-purple-600" size={14} />;
      default:
        return <Bell className="text-gray-600" size={14} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 1 ? "Just now" : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-orange-500 rounded-full transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-[15px] font-bold">Notifications</h1>
              {totalItems > 0 && (
                <p className="text-orange-100 text-xs mt-1">
                  Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} notifications
                </p>
              )}
            </div>
          </div>
          <Bell size={20} />
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/90 border-0 text-gray-900 placeholder-gray-500 rounded-xl"
            />
          </div>

          <div className="flex gap-2">
            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-white/90 text-gray-900 rounded-lg text-sm border-0 focus:ring-2 focus:ring-white/50"
            >
              <option value="all">All Types</option>
              <option value="attendance">Attendance</option>
              <option value="bill">Bills</option>
              <option value="menu">Menu</option>
              <option value="order">Orders</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white/90 text-gray-900 rounded-lg text-sm border-0 focus:ring-2 focus:ring-white/50"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>

            {/* Mark All Read Button */}
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-all duration-300"
              >
                <CheckCheck size={16} className="mr-1" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              <p className="mt-2 text-gray-600">Loading notifications...</p>
            </div>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={cn(
                  "bg-white rounded-xl p-2 border transition-all duration-300 hover:shadow-lg",
                  notification.read
                    ? "border-gray-200"
                    : "border-orange-300 bg-orange-50/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg flex-shrink-0",
                    notification.read ? "bg-gray-100" : "bg-orange-100"
                  )}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h5 className={cn(
                          "font-medium text-gray-900 text-sm",
                          !notification.read && "text-orange-900"
                        )}>
                          {notification.title}
                        </h5>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{formatDate(notification.createdAt)}</span>
                        <span className="capitalize">• {notification.type}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            onClick={() => markAsRead(notification._id)}
                            className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium transition-all duration-300"
                          >
                            <Check size={12} className="mr-1" />
                            Mark Read
                          </Button>
                        )}
                        {notification.read && (
                          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <CheckCheck size={12} />
                            Read
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterType !== "all" || filterStatus !== "all"
                ? "No notifications found"
                : "No notifications yet"}
            </h3>
            <p className="text-gray-600 text-sm">
              {searchTerm || filterType !== "all" || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "You'll see notifications here when they arrive"}
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-1.5">

            {/* First Page */}
            <Button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 bg-white border border-gray-300 text-xs text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronsLeft size={12} />
            </Button>

            {/* Previous Page */}
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 bg-white border border-gray-300 text-xs text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft size={12} />
            </Button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;

              return (
                <Button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={cn(
                    "px-2 py-1 rounded-md text-[11px] font-medium",
                    currentPage === pageNum
                      ? "bg-orange-500 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {pageNum}
                </Button>
              );
            })}

            {/* Next Page */}
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 bg-white border border-gray-300 text-xs text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight size={12} />
            </Button>

            {/* Last Page */}
            <Button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 bg-white border border-gray-300 text-xs text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronsRight size={12} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
