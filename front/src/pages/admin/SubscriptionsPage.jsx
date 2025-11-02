import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { subscriptionsAPI, clientsAPI, notificationsAPI } from "@/lib/api";
import { showError, showSuccess } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  X,
  UserPlus,
} from "lucide-react";

export default function SubscriptionsPage({ className }) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [clients, setClients] = useState([]);
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [showCreateSubscription, setShowCreateSubscription] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState({
    studentName: "",
    phone: "",
    plan: "monthly",
    startDate: new Date().toISOString().split("T")[0],
  });
  const [selectedClientId, setSelectedClientId] = useState("");
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [editingSubscriptionForm, setEditingSubscriptionForm] = useState({
    studentName: "",
    phone: "",
    plan: "monthly",
    startDate: "",
    endDate: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);

  // Add client form state
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // Load subscriptions
  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        const response = await subscriptionsAPI.getAll();
        // API returns { data: { subscriptions: [...] } } so we need to extract subscriptions array
        const subscriptionsData = Array.isArray(response.subscriptions)
          ? response.subscriptions
          : Array.isArray(response)
            ? response
            : [];
        setSubscriptions(subscriptionsData);
      } catch (err) {
        console.error("Error loading subscriptions:", err);
        setSubscriptions([]); // Ensure subscriptions is always an array
      }
    };
    loadSubscriptions();
  }, []);

  // Load clients
  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await clientsAPI.getAll();
        // Ensure data is always an array
        const clientsData = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
        setClients(clientsData);
      } catch (err) {
        console.error("Error loading clients:", err);
        setClients([]); // Ensure clients is always an array
      }
    };
    loadClients();
  }, []);

  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedClientId || !subscriptionForm.plan || !subscriptionForm.startDate) {
      showError("Please fill all required fields", 'Create Subscription');
      setLoading(false);
      return;
    }

    try {
      // Find the selected client
      const selectedClient = clients.find(c => c._id === selectedClientId);
      if (!selectedClient) {
        showError("Selected client not found", 'Create Subscription');
        setLoading(false);
        return;
      }

      const startDate = new Date(subscriptionForm.startDate);
      const endDate = new Date(startDate);

      if (subscriptionForm.plan === "weekly") {
        endDate.setDate(startDate.getDate() + 7);
      } else {
        endDate.setMonth(startDate.getMonth() + 1);
      }

      // Calculate price based on plan
      const price = subscriptionForm.plan === "weekly" ? 500 : 2000;

      const newSubscription = await subscriptionsAPI.create({
        studentName: selectedClient.name,
        phone: selectedClient.phone,
        plan: subscriptionForm.plan,
        startDate: subscriptionForm.startDate,
        endDate: endDate.toISOString().split("T")[0],
        price,
        status: "active",
      });

      // Refresh subscriptions list
      const updatedResponse = await subscriptionsAPI.getAll();
      const updatedSubscriptions = Array.isArray(updatedResponse.subscriptions)
        ? updatedResponse.subscriptions
        : Array.isArray(updatedResponse)
          ? updatedResponse
          : [];
      setSubscriptions(updatedSubscriptions);

      // Reset form
      setSubscriptionForm({
        studentName: "",
        phone: "",
        plan: "monthly",
        startDate: new Date().toISOString().split("T")[0],
      });
      setSelectedClientId("");
      setShowCreateSubscription(false);

      // Send notification to client
      await notificationsAPI.send({
        studentPhone: selectedClient.phone,
        studentName: selectedClient.name,
        title: "Subscription Activated",
        message: `Your ${subscriptionForm.plan} tiffin subscription has been activated!`,
        type: "order",
      });

      showSuccess(`Tiffin plan created successfully for ${selectedClient.name}!`, 'Create Subscription');
    } catch (err) {
      showError(err, 'Create Subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubscription = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!editingSubscriptionForm.studentName || !editingSubscriptionForm.phone) {
      showError("Please fill all fields", 'Update Subscription');
      setLoading(false);
      return;
    }

    try {
      const updatedSubscription = await subscriptionsAPI.update(editingSubscription._id, {
        studentName: editingSubscriptionForm.studentName,
        plan: editingSubscriptionForm.plan,
        status: editingSubscriptionForm.status,
        startDate: editingSubscriptionForm.startDate,
        endDate: editingSubscriptionForm.endDate,
      });

      setSubscriptions(
        subscriptions.map((sub) =>
          sub._id === editingSubscription._id ? updatedSubscription : sub
        )
      );

      setEditingSubscription(null);
      setEditingSubscriptionForm({
        studentName: "",
        phone: "",
        plan: "monthly",
        startDate: "",
        endDate: "",
        status: "active",
      });

      showSuccess("Subscription updated successfully!", 'Update Subscription');
    } catch (err) {
      showError(err, 'Update Subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscription = async (id) => {
    if (!id) return;

    setLoading(true);
    try {
      await subscriptionsAPI.delete(id);
      setSubscriptions(subscriptions.filter((sub) => sub._id !== id));
    } catch (err) {
      showError(err, 'Delete Subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!clientForm.name || !clientForm.phone) {
      showError("Please fill all required fields", 'Add Client');
      setLoading(false);
      return;
    }

    try {
      const newClient = await clientsAPI.create({
        name: clientForm.name,
        phone: clientForm.phone,
        email: clientForm.email || "",
      });

      setClients([...clients, newClient]);

      // Auto-select the newly created client
      setSelectedClientId(newClient._id);
      setSubscriptionForm({
        ...subscriptionForm,
        studentName: newClient.name,
        phone: newClient.phone,
      });

      // Close client form and continue with subscription
      setClientForm({ name: "", phone: "", email: "" });
      setShowAddClientForm(false);

      showSuccess(`Client added successfully!`, 'Add Client');
    } catch (err) {
      showError(err, 'Add Client');
    } finally {
      setLoading(false);
    }
  };

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (subscriptionFilter === "all") return true;
    return sub.status === subscriptionFilter;
  });

  return (
    <div className={className}>
      {/* Enhanced Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-1.5 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl shadow-lg">
            <Users size={14} className="text-white sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-sm font-bold text-gray-900">Tiffin Subscriptions</h2>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">Manage recurring tiffin plans for your clients</p>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg sm:rounded-xl p-2.5 sm:p-4 text-center">
            <div className="text-xs font-semibold opacity-90">Active</div>
            <div className="text-lg sm:text-2xl font-bold">
              {subscriptions.filter(s => s.status === "active").length}
            </div>
            <div className="text-xs opacity-75">Subscriptions</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg sm:rounded-xl p-2.5 sm:p-4 text-center">
            <div className="text-xs font-semibold opacity-90">Paused</div>
            <div className="text-lg sm:text-2xl font-bold">
              {subscriptions.filter(s => s.status === "paused").length}
            </div>
            <div className="text-xs opacity-75">Subscriptions</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg sm:rounded-xl p-2.5 sm:p-4 text-center">
            <div className="text-xs font-semibold opacity-90">Revenue</div>
            <div className="text-sm sm:text-lg font-bold">
              ₹{subscriptions.filter(s => s.status === "active").reduce((sum, sub) => sum + sub.price, 0)}
            </div>
            <div className="text-xs opacity-75">Monthly</div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Filter Buttons */}
          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            {["all", "active", "paused", "expired"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSubscriptionFilter(filter)}
                className={cn(
                  "px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all capitalize flex items-center gap-1 sm:gap-2",
                  subscriptionFilter === filter
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {filter === "all" ? "🌟 All" :
                  filter === "active" ? "✅ " + filter :
                    filter === "paused" ? "⏸️ " + filter :
                      filter === "expired" ? "❌ " + filter : filter}
              </button>
            ))}
          </div>

          {/* Create Button */}
          <Dialog open={showCreateSubscription} onOpenChange={setShowCreateSubscription}>
            <DialogTrigger asChild>
              <button
                onClick={() => setShowCreateSubscription(true)}
                className="inline-flex items-center gap-0.5 px-2 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg text-[9px] sm:text-xs whitespace-nowrap w-fit min-w-[60px] max-w-[120px]"
              >
                <Plus size={8} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Create New Plan</span>
                <span className="sm:hidden">Create Plan</span>
              </button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-lg mx-auto border-0 shadow-2xl rounded-2xl h-[60vh] sm:h-[65vh] overflow-y-auto">
              <DialogHeader className="pb-4 border-b border-gray-100">
                <DialogTitle className="flex items-center gap-3 text-base sm:text-lg font-bold text-gray-900">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <Plus size={16} className="text-white sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <span className="text-sm sm:text-base">Create New Tiffin Plan</span>
                    <p className="text-xs text-gray-500 font-normal mt-1">Set up a new subscription plan for your client</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreateSubscription} className="space-y-6 mt-6">
                {/* Client Selection Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <label className="block text-sm font-semibold text-gray-700">
                      Select Client <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={selectedClientId}
                      onChange={(e) => {
                        setSelectedClientId(e.target.value);
                        const selectedClient = clients.find(c => c._id === e.target.value);
                        if (selectedClient) {
                          setSubscriptionForm({
                            ...subscriptionForm,
                            studentName: selectedClient.name,
                            phone: selectedClient.phone,
                          });
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-medium bg-white appearance-none cursor-pointer"
                      required
                    >
                      <option value="">Choose a client...</option>
                      {clients.map((client) => (
                        <option key={client._id} value={client._id}>
                          {client.name} ({client.phone})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  {clients.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs text-yellow-800">
                        <span className="font-semibold">No clients available.</span> Click "Add Client" to create a new one first.
                      </p>
                    </div>
                  )}
                </div>

                {/* Plan Configuration Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <label className="block text-sm font-semibold text-gray-700">
                      Plan Configuration <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Plan Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Plan Type & Pricing
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className={cn(
                          "relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md",
                          subscriptionForm.plan === "weekly"
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        )}>
                          <input
                            type="radio"
                            name="plan"
                            value="weekly"
                            checked={subscriptionForm.plan === "weekly"}
                            onChange={(e) => setSubscriptionForm({ ...subscriptionForm, plan: e.target.value })}
                            className="sr-only"
                          />
                          <div className="text-center">
                            <div className="text-lg mb-1">📅</div>
                            <div className="text-sm font-bold text-gray-900">Weekly Plan</div>
                            <div className="text-xs text-gray-600">7 days</div>
                            <div className="text-lg font-bold text-blue-600 mt-1">₹500</div>
                          </div>
                        </label>
                        <label className={cn(
                          "relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md",
                          subscriptionForm.plan === "monthly"
                            ? "border-purple-500 bg-purple-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        )}>
                          <input
                            type="radio"
                            name="plan"
                            value="monthly"
                            checked={subscriptionForm.plan === "monthly"}
                            onChange={(e) => setSubscriptionForm({ ...subscriptionForm, plan: e.target.value })}
                            className="sr-only"
                          />
                          <div className="text-center">
                            <div className="text-lg mb-1">📆</div>
                            <div className="text-sm font-bold text-gray-900">Monthly Plan</div>
                            <div className="text-xs text-gray-600">30 days</div>
                            <div className="text-lg font-bold text-purple-600 mt-1">₹2000</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Start Date
                      </label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={subscriptionForm.startDate}
                          onChange={(e) =>
                            setSubscriptionForm({ ...subscriptionForm, startDate: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Section */}
                {selectedClientId && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      Plan Summary
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Client:</span>
                        <span className="text-xs font-semibold text-gray-900">
                          {clients.find(c => c._id === selectedClientId)?.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Plan:</span>
                        <span className="text-xs font-semibold text-gray-900 capitalize">
                          {subscriptionForm.plan} Plan
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Price:</span>
                        <span className="text-xs font-bold text-purple-600">
                          ₹{subscriptionForm.plan === "weekly" ? "500" : "2000"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Duration:</span>
                        <span className="text-xs font-semibold text-gray-900">
                          {subscriptionForm.plan === "weekly" ? "7 days" : "30 days"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button
                    type="submit"
                    disabled={loading || !selectedClientId}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold h-11 transition-all duration-300 disabled:opacity-50 shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Creating...</span>
                      </div>
                    ) : (
                      <>
                        <Plus size={16} className="mr-2" />
                        <span className="text-sm">Create Plan</span>
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateSubscription(false);
                      setSelectedClientId("");
                      setSubscriptionForm({
                        studentName: "",
                        phone: "",
                        plan: "monthly",
                        startDate: new Date().toISOString().split("T")[0],
                      });
                    }}
                    className="px-6 h-11 rounded-xl font-semibold text-sm border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <X size={16} className="mr-1" />
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Subscriptions List */}
      <div className="space-y-1.5">
        {filteredSubscriptions.length > 0 ? (
          filteredSubscriptions.map((subscription) => (
            <div
              key={subscription._id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              {/* Subscription Header */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-1.5 border-b border-purple-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <Users size={9} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs">{subscription.studentName}</h4>
                      <p className="text-xs text-gray-600">{subscription.phone}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold px-1.5 py-0.5 rounded-full capitalize flex items-center gap-0.5",
                      subscription.status === "active"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : subscription.status === "paused"
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          : "bg-gray-100 text-gray-800 border border-gray-200"
                    )}
                  >
                    {subscription.status === "active" ? "✅ Active" :
                      subscription.status === "paused" ? "⏸️ Paused" :
                        subscription.status === "expired" ? "❌ Expired" : subscription.status}
                  </span>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="p-1.5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-1.5">
                  <div className="text-center p-1 bg-blue-50 rounded-lg">
                    <div className="text-xs font-bold text-blue-600">₹{subscription.price}</div>
                    <div className="text-[10px] text-blue-700 font-medium">Plan Price</div>
                  </div>
                  <div className="text-center p-1 bg-purple-50 rounded-lg">
                    <div className="text-[10px] font-bold text-purple-600 capitalize">{subscription.plan}</div>
                    <div className="text-[10px] text-purple-700 font-medium">Plan Type</div>
                  </div>
                  <div className="text-center p-1 bg-green-50 rounded-lg">
                    <div className="text-[10px] font-bold text-green-600">
                      {new Date(subscription.startDate).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] text-green-700 font-medium">Start Date</div>
                  </div>
                  <div className="text-center p-1 bg-orange-50 rounded-lg">
                    <div className="text-[10px] font-bold text-orange-600">
                      {new Date(subscription.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] text-orange-700 font-medium">End Date</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-flex items-center px-1.5 py-0.5 rounded-lg text-[10px] font-medium",
                      subscription.plan === "weekly"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    )}
                  >
                    {subscription.plan === "weekly" ? "📅 Weekly Plan" : "📆 Monthly Plan"}
                  </span>

                  <div className="flex gap-0.5">
                    <button
                      onClick={() => {
                        setEditingSubscription(subscription);
                        setEditingSubscriptionForm({
                          studentName: subscription.studentName,
                          phone: subscription.phone,
                          plan: subscription.plan,
                          startDate: subscription.startDate,
                          endDate: subscription.endDate,
                          status: subscription.status,
                        });
                      }}
                      className="p-0.5 hover:bg-blue-50 rounded-md transition-colors group border border-transparent hover:border-blue-200"
                      title="Edit Subscription"
                    >
                      <Edit2 size={8} className="text-blue-600 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubscription(subscription._id)}
                      disabled={loading}
                      className="p-0.5 hover:bg-red-50 rounded-md transition-colors group disabled:opacity-50 border border-transparent hover:border-red-200"
                      title="Delete Subscription"
                    >
                      <Trash2 size={8} className="text-red-600 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl border border-purple-200">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Users size={24} className="text-white sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">No Tiffin Plans Yet</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
              Create subscription plans for your clients to offer regular tiffin services
            </p>
            <button
              onClick={() => setShowCreateSubscription(true)}
              className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg text-sm sm:text-base"
            >
              <Plus size={16} className="sm:w-5 sm:h-5" />
              Create First Tiffin Plan
            </button>
          </div>
        )}
      </div>

      {/* Add Client Dialog */}
      <Dialog open={showAddClientForm} onOpenChange={setShowAddClientForm}>
        <DialogContent className="w-[95vw] max-w-md mx-auto border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <UserPlus size={16} className="text-green-600" />
              </div>
              Add New Client
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddClient} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <Input
                type="text"
                value={clientForm.name}
                onChange={(e) =>
                  setClientForm({ ...clientForm, name: e.target.value })
                }
                placeholder="Client name"
                className="rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                value={clientForm.phone}
                onChange={(e) =>
                  setClientForm({ ...clientForm, phone: e.target.value })
                }
                placeholder="10-digit phone number"
                className="rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional)
              </label>
              <Input
                type="email"
                value={clientForm.email}
                onChange={(e) =>
                  setClientForm({ ...clientForm, email: e.target.value })
                }
                placeholder="client@example.com"
                className="rounded-xl"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl font-semibold h-10 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Client"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddClientForm(false);
                  setClientForm({ name: "", phone: "", email: "" });
                }}
                className="flex-1 border-2 border-gray-300 rounded-xl font-semibold h-10 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enhanced Edit Subscription Dialog */}
      <Dialog open={!!editingSubscription} onOpenChange={() => setEditingSubscription(null)}>
        <DialogContent
          className="w-[95vw] max-w-lg mx-auto border-0 shadow-2xl rounded-2xl 
         h-[50vh] sm:h-[50vh] overflow-auto"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm sm:text-base font-bold text-gray-900">
              <div className="p-1 sm:p-2 bg-blue-100 rounded-lg">
                <Edit2 size={12} className="text-blue-600 sm:w-4 sm:h-4" />
              </div>
              <span className="text-xs sm:text-sm">Edit Tiffin Plan</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubscription} className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Student Name
                </label>
                <Input
                  type="text"
                  value={editingSubscriptionForm.studentName}
                  onChange={(e) =>
                    setEditingSubscriptionForm({ ...editingSubscriptionForm, studentName: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={editingSubscriptionForm.phone}
                  onChange={(e) =>
                    setEditingSubscriptionForm({ ...editingSubscriptionForm, phone: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Plan Type
                </label>
                <select
                  value={editingSubscriptionForm.plan}
                  onChange={(e) =>
                    setEditingSubscriptionForm({ ...editingSubscriptionForm, plan: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs font-medium bg-white"
                >
                  <option value="weekly">📅 Weekly Plan</option>
                  <option value="monthly">📆 Monthly Plan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editingSubscriptionForm.status}
                  onChange={(e) =>
                    setEditingSubscriptionForm({ ...editingSubscriptionForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs font-medium bg-white"
                >
                  <option value="active">✅ Active</option>
                  <option value="paused">⏸️ Paused</option>
                  <option value="expired">❌ Expired</option>
                  <option value="cancelled">🚫 Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={editingSubscriptionForm.startDate}
                  onChange={(e) =>
                    setEditingSubscriptionForm({ ...editingSubscriptionForm, startDate: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={editingSubscriptionForm.endDate}
                  onChange={(e) =>
                    setEditingSubscriptionForm({ ...editingSubscriptionForm, endDate: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg font-bold h-9 sm:h-10 transition-all duration-300 disabled:opacity-50 shadow-lg text-xs"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs">Updating...</span>
                  </div>
                ) : (
                  <>
                    <Edit2 size={10} className="mr-1 sm:mr-2 sm:w-3 sm:h-3" />
                    <span className="text-xs">Update Plan</span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingSubscription(null)}
                className="px-3 sm:px-6 h-9 sm:h-10 rounded-lg font-semibold text-xs"
              >
                <X size={10} className="sm:w-3 sm:h-3 mr-1 sm:mr-0" />
                <span className="sm:hidden">Cancel</span>
                <span className="hidden sm:inline">Cancel</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
