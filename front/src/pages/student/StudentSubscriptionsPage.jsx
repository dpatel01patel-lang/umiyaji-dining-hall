import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { subscriptionsAPI } from "@/lib/api";
import { Users, Plus, ChevronLeft, ChevronRight } from "lucide-react";

export default function StudentSubscriptionsPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(subscriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubscriptions = subscriptions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load subscriptions
  useEffect(() => {
    const loadSubscriptions = async () => {
      if (!userProfile?.phone) return;

      setLoading(true);
      try {
        const subscriptionsData = await subscriptionsAPI.getAll();
        // Ensure subscriptionsData is always an array
        const allSubscriptions = Array.isArray(subscriptionsData)
          ? subscriptionsData
          : Array.isArray(subscriptionsData.subscriptions)
            ? subscriptionsData.subscriptions
            : [];
        const studentSubscriptions = allSubscriptions.filter((sub) => sub.phone === userProfile.phone);
        setSubscriptions(studentSubscriptions);
      } catch (err) {
        console.error("Error loading subscriptions:", err);
        setSubscriptions([]); // Ensure subscriptions is always an array
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, [userProfile?.phone]);

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-3 rounded-2xl shadow-lg mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white bg-opacity-20 rounded-xl">
            <Users size={14} />
          </div>
          <div>
            <h1 className="text-[13px] font-bold">My Subscriptions</h1>
            <p className="text-purple-100">Manage your active tiffin plans</p>
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">Active Subscriptions</h2>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-6 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
              <p className="mt-1 text-xs">Loading subscriptions...</p>
            </div>
          ) : currentSubscriptions.length > 0 ? (
            <>
              {currentSubscriptions.map((subscription) => (
                <div
                  key={subscription._id}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md">
                          <Users size={14} className="text-white" />
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 capitalize text-sm">
                            {subscription.plan} Plan
                          </h3>
                          <p className="text-[11px] text-gray-500">
                            {new Date(subscription.startDate).toLocaleDateString()}
                          </p>
                        </div>

                        <span
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize",
                            subscription.status === "active"
                              ? "bg-green-100 text-green-700"
                              : subscription.status === "paused"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                          )}
                        >
                          {subscription.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-700">
                        <div>
                          <span className="font-medium">Price:</span>{" "}
                          <span className="text-purple-600 font-bold">₹{subscription.price}</span>
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span>{" "}
                          {subscription.plan === "weekly" ? "7 days" : "30 days"}
                        </div>
                        <div>
                          <span className="font-medium">Start:</span>{" "}
                          {new Date(subscription.startDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">End:</span>{" "}
                          {new Date(subscription.endDate).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-2">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium",
                            subscription.plan === "weekly"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          )}
                        >
                          {subscription.plan === "weekly" ? "📅 Weekly" : "📆 Monthly"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-2 py-1 rounded-md text-xs ${currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                      }`}
                  >
                    <ChevronLeft size={12} />
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-7 h-7 text-xs font-medium rounded-md ${currentPage === page
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-2 py-1 rounded-md text-xs ${currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                      }`}
                  >
                    <ChevronRight size={12} />
                  </button>
                </div>
              )}

              <div className="text-center mt-2 text-[11px] text-gray-500">
                Showing {startIndex + 1}-{Math.min(endIndex, subscriptions.length)} of{" "}
                {subscriptions.length}
              </div>
            </>
          ) : (
            <div className="text-center py-6 bg-purple-50 rounded-lg border border-purple-100">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users size={18} className="text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">No Active Subscriptions</h3>
              <p className="text-xs text-gray-600 mb-3">Subscribe to a plan to continue</p>
              <button
                onClick={() => navigate("/dashboard/menu")}
                className="text-xs px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition shadow-md"
              >
                + Browse Plans
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
