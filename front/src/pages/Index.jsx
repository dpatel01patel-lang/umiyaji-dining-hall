import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Utensils, Clock, Zap, TrendingUp } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
      {/* Header/Navigation */}
      <div className="p-3 sm:p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl sm:text-3xl">🍽️</span>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Umiya Ji</h1>
            <p className="text-xs text-gray-600">Dining Hall</p>
          </div>
        </div>
        <Button
          onClick={() => navigate("/auth")}
          className="bg-orange-600 hover:bg-orange-700 rounded-xl h-8 sm:h-10 font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base px-3 sm:px-4"
        >
          Login
        </Button>
      </div>

      {/* Hero Section */}
      <div className="px-4 py-8 sm:py-12 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Delicious Meals,{" "}
          <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            Delivered Fresh
          </span>
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-xl mx-auto leading-relaxed px-2">
          Experience authentic dining with Umiya Ji. Order meals, subscribe to
          tiffins, and manage everything from your mobile app.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => navigate("/auth")}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white h-12 sm:h-14 rounded-2xl text-base sm:text-lg font-bold shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            Get Started <ArrowRight size={18} className="sm:w-5 sm:h-5" />
          </Button>
          <Button
            variant="outline"
            className="h-12 sm:h-14 rounded-2xl text-base sm:text-lg font-bold border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all duration-300"
          >
            Learn More
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 py-8 sm:py-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto mb-8 sm:mb-12">
        {/* Student Features */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
          <div className="text-3xl sm:text-4xl mb-4">👤</div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            For Students
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-orange-500 font-bold text-xl mt-1">✓</span>
              <span>Browse daily menu (Breakfast, Lunch, Dinner)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 font-bold text-xl mt-1">
                
              </span>
              <span>Subscribe to weekly or monthly plans</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 font-bold text-xl mt-1">✓</span>
              <span>Quick and secure payments</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 font-bold text-xl mt-1">✓</span>
              <span>Real-time order notifications</span>
            </li>
          </ul>
        </div>

        {/* Owner Features */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
          <div className="text-3xl sm:text-4xl mb-4">👨‍💼</div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">For Owners</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold text-xl mt-1">✓</span>
              <span>Manage menu items and prices</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold text-xl mt-1">✓</span>
              <span>Track orders in real-time</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold text-xl mt-1">✓</span>
              <span>Send notifications to customers</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold text-xl mt-1">✓</span>
              <span>View detailed analytics & income</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="px-4 py-8 sm:py-12 max-w-3xl mx-auto">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6 sm:mb-8">
          Why Choose Umiya Ji?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 rounded-full mb-4">
              <Clock className="text-orange-600" size={24} />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Fresh Daily</h4>
            <p className="text-sm text-gray-600">
              Meals prepared fresh every day for optimal taste
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
              <Zap className="text-blue-600" size={24} />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Easy to Use</h4>
            <p className="text-sm text-gray-600">
              Simple app interface for quick ordering
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Best Value</h4>
            <p className="text-sm text-gray-600">
              Affordable plans with amazing discounts
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-4 py-8 sm:py-12 max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white text-center shadow-xl">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-orange-100 mb-4 sm:mb-6 text-sm sm:text-base">
            Join hundreds of satisfied students and enjoy delicious meals today
          </p>
          <Button
            onClick={() => navigate("/auth")}
            className="bg-white text-orange-600 hover:bg-gray-100 h-10 sm:h-12 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Sign Up Now
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-8 border-t border-gray-200 text-center text-gray-600 text-sm">
        <p>© 2024 Umiya Ji Dining Hall. All rights reserved.</p>
      </div>
    </div>
  );
}
