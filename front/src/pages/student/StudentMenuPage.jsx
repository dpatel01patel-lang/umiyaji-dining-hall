import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { showError, showSuccess } from "@/lib/error-handler";
import { mealsAPI, subscriptionsAPI, ordersAPI } from "@/lib/api";
import {
  Clock,
  ShoppingCart,
  CreditCard,
  Calendar,
  Users,
  Plus,
} from "lucide-react";

export default function StudentMenuPage() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("breakfast");
  const [subscriptionType, setSubscriptionType] = useState(null);
  const [mealsData, setMealsData] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
  });
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState(null);
  const [subscriptionStartDate, setSubscriptionStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Load meals from API
  useEffect(() => {
    const loadMeals = async () => {
      try {
        const allMealsResponse = await mealsAPI.getAll();
        // Ensure allMeals is always an array
        const allMeals = Array.isArray(allMealsResponse.data)
          ? allMealsResponse.data
          : Array.isArray(allMealsResponse)
            ? allMealsResponse
            : [];
        const organized = {
          breakfast: allMeals.filter((m) => m.type === "breakfast"),
          lunch: allMeals.filter((m) => m.type === "lunch"),
          dinner: allMeals.filter((m) => m.type === "dinner"),
        };
        setMealsData(organized);
      } catch (err) {
        console.error("Error loading meals:", err);
        setMealsData({ breakfast: [], lunch: [], dinner: [] }); // Ensure mealsData is set even on error
      }
    };
    loadMeals();
  }, []);

  // Load subscriptions
  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        const subscriptionsDataResponse = await subscriptionsAPI.getAll();
        // Ensure subscriptionsData is always an array
        const subscriptionsData = Array.isArray(subscriptionsData)
          ? subscriptionsData
          : Array.isArray(subscriptionsData.subscriptions)
            ? subscriptionsData.subscriptions
            : [];
        const studentSubscriptions = subscriptionsData.filter((sub) => sub.phone === userProfile?.phone);
        setSubscriptions(studentSubscriptions);
      } catch (err) {
        console.error("Error loading subscriptions:", err);
        setSubscriptions([]); // Ensure subscriptions is always an array
      }
    };
    loadSubscriptions();
  }, [userProfile?.phone]);

  const handleOrderMeal = async (meal) => {
    if (!userProfile?.phone) return;

    setLoading(true);
    try {
      // Create order for the meal
      const orderData = {
        studentName: userProfile.name,
        phone: userProfile.phone,
        items: [{
          mealId: meal._id,
          mealName: meal.name,
          quantity: 1,
          price: meal.price,
        }],
        total: meal.price,
        status: "pending",
      };

      await ordersAPI.create(orderData);

      // Show success toast
      showSuccess(`Order placed successfully for ${meal.name}!`, 'Place Order');

    } catch (err) {
      console.error("Error placing order:", err);
      showError("Failed to place order. Please try again.", 'Place Order');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSubscription = async (planType) => {
    if (!userProfile?.phone || !userProfile?.name) return;

    setLoading(true);
    try {
      const startDate = new Date(subscriptionStartDate);
      const endDate = new Date(startDate);

      if (planType === "weekly") {
        endDate.setDate(startDate.getDate() + 7);
      } else {
        endDate.setMonth(startDate.getMonth() + 1);
      }

      // Calculate price based on plan
      const price = planType === "weekly" ? 500 : 2000;

      const subscriptionData = {
        studentName: userProfile.name,
        phone: userProfile.phone,
        plan: planType,
        startDate: subscriptionStartDate,
        endDate: endDate.toISOString().split("T")[0],
        price,
        status: "active",
      };

      await subscriptionsAPI.create(subscriptionData);

      // Show success toast
      showSuccess(`${planType.charAt(0).toUpperCase() + planType.slice(1)} subscription activated successfully!`, 'Purchase Subscription');

      // Refresh subscriptions data
      const subscriptionsDataResponse = await subscriptionsAPI.getAll();
      // Ensure subscriptionsData is always an array
      const subscriptionsData = Array.isArray(subscriptionsDataResponse)
        ? subscriptionsDataResponse
        : Array.isArray(subscriptionsDataResponse.subscriptions)
          ? subscriptionsDataResponse.subscriptions
          : [];
      const studentSubscriptions = subscriptionsData.filter((sub) => sub.phone === userProfile.phone);
      setSubscriptions(studentSubscriptions);

      // Close dialog
      setShowSubscriptionDialog(false);
      setSelectedSubscriptionPlan(null);

    } catch (err) {
      console.error("Error purchasing subscription:", err);
      showError("Failed to purchase subscription. Please try again.", 'Purchase Subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-xl shadow-md mb-4">
        <div className="flex items-center justify-between text-center gap-2">

          <div className="flex-1">
            <p className="text-orange-100 text-xs">Balance</p>
            <p className="text-lg font-semibold">₹500</p>
          </div>

          <div className="flex-1 border-l border-orange-400">
            <p className="text-orange-100 text-xs">Active Orders</p>
            <p className="text-lg font-semibold">0</p>
          </div>

          <div className="flex-1 border-l border-orange-400">
            <p className="text-orange-100 text-xs">Subscriptions</p>
            <p className="text-lg font-semibold">{subscriptions.length}</p>
          </div>

        </div>
      </div>
      {/* Menu Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Today's Menu
        </h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
          {(["breakfast", "lunch", "dinner"]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 text-sm capitalize",
                activeTab === tab
                  ? "bg-orange-500 text-white shadow-lg transform scale-105"
                  : "text-gray-700 hover:bg-gray-200",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Meals Grid */}
        <div className="grid gap-4">
          {mealsData[activeTab].map((meal) => (
            <div
              key={meal._id}
              className={cn(
                "p-4 rounded-2xl transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1",
                meal.available !== false
                  ? "bg-white border border-gray-200 hover:border-orange-300"
                  : "bg-gray-100 border border-gray-200 opacity-60",
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {meal.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Clock size={16} />
                        <span>{meal.prepTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-600">
                    ₹{meal.price}
                  </p>
                  <button
                    disabled={meal.available === false}
                    onClick={() => handleOrderMeal(meal)}
                    className={cn(
                      "mt-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-110 active:scale-95",
                      meal.available !== false
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed",
                    )}
                  >
                    {meal.available !== false ? "Order Now" : "Unavailable"}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {mealsData[activeTab].length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No meals available for {activeTab}
            </p>
          )}
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Tiffin Subscriptions
        </h2>

        <div className="grid gap-4">
          {[
            {
              type: "weekly",
              name: "Weekly Plan",
              meals: 7,
              price: 500,
              icon: "📅",
              features: ["7 meals included", "Flexible menu", "5% discount"],
            },
            {
              type: "monthly",
              name: "Monthly Plan",
              meals: 30,
              price: 2000,
              icon: "📆",
              features: [
                "30 meals included",
                "Premium menu",
                "10% discount",
                "Free delivery",
              ],
            },
          ].map((plan) => (
            <button
              key={plan.type}
              onClick={() =>
                setSubscriptionType(
                  subscriptionType === plan.type
                    ? null
                    : plan.type,
                )
              }
              className={cn(
                "w-full p-6 rounded-2xl text-left transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1",
                subscriptionType === plan.type
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105"
                  : "bg-white border-2 border-gray-200 hover:border-orange-300",
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{plan.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <p className="text-sm opacity-90">
                      {plan.meals} meals included
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">₹{plan.price}</p>
                  <p className="text-sm opacity-75">
                    {plan.type === "weekly" ? "/week" : "/month"}
                  </p>
                </div>
              </div>

              {subscriptionType === plan.type && (
                <div className="mt-6 pt-6 border-t border-white border-opacity-30 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="text-lg">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                  <Button
                    className="w-full mt-6 bg-white text-orange-600 hover:bg-gray-100 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSubscriptionPlan(plan.type);
                      setShowSubscriptionDialog(true);
                    }}
                  >
                    Subscribe Now
                  </Button>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Payment</h2>
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">
                Current Balance
              </p>
              <p className="text-4xl font-bold text-orange-600">₹500</p>
            </div>
            <ShoppingCart className="text-orange-500" size={40} />
          </div>
          <div className="space-y-3">
            <Button className="w-full bg-orange-600 hover:bg-orange-700 h-12 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95">
              <CreditCard size={18} className="mr-2" />
              Add Money
            </Button>
            <button className="w-full py-3 px-4 rounded-xl border-2 border-orange-300 text-orange-600 font-semibold hover:bg-orange-50 transition-all duration-300">
              View Transaction History
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Purchase Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent className="w-[90vw] max-w-md mx-auto border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CreditCard size={20} className="text-orange-600" />
              </div>
              {selectedSubscriptionPlan && `${selectedSubscriptionPlan.charAt(0).toUpperCase() + selectedSubscriptionPlan.slice(1)} Plan`}
            </DialogTitle>
          </DialogHeader>

          {selectedSubscriptionPlan && (
            <div className="space-y-6 mt-6">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {selectedSubscriptionPlan === "weekly" ? "📅" : "📆"}
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 capitalize">
                        {selectedSubscriptionPlan} Plan
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedSubscriptionPlan === "weekly" ? "7 days plan" : "30 days plan"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">
                      ₹{selectedSubscriptionPlan === "weekly" ? "500" : "2000"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedSubscriptionPlan === "weekly" ? "/week" : "/month"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={subscriptionStartDate}
                  onChange={(e) => setSubscriptionStartDate(e.target.value)}
                  className="rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 text-sm mb-2">Plan Benefits:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {selectedSubscriptionPlan === "weekly" ? (
                    <>
                      <li>• 7 days of tiffin service</li>
                      <li>• Flexible menu options</li>
                      <li>• 5% discount on regular price</li>
                      <li>• Free delivery</li>
                    </>
                  ) : (
                    <>
                      <li>• 30 days of tiffin service</li>
                      <li>• Premium menu access</li>
                      <li>• 10% discount on regular price</li>
                      <li>• Free delivery</li>
                      <li>• Priority customer support</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handlePurchaseSubscription(selectedSubscriptionPlan)}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 rounded-lg font-bold h-12 transition-all duration-300 disabled:opacity-50 shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <CreditCard size={16} className="mr-2" />
                      Pay & Activate
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSubscriptionDialog(false);
                    setSelectedSubscriptionPlan(null);
                  }}
                  className="px-6 h-12 rounded-lg font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
