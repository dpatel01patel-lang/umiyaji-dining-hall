import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { showError, showSuccess } from "@/lib/error-handler";
import { useAuth } from "@/lib/auth-context";
import { getApiUrl } from "@/lib/config";

export default function Auth() {
  const navigate = useNavigate();
  const { updateUserProfile } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState("user");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submissions
    if (loading) return;
    
    setLoading(true);
    setSubmitError("");

    try {
      // Validate inputs
      if (!phone || !password) {
        setSubmitError("Please fill in all fields");
        setLoading(false);
        return;
      }

      if (!isLogin && !name) {
        setSubmitError("Name is required for registration");
        setLoading(false);
        return;
      }

      // Phone validation
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(phone)) {
        setSubmitError("Please enter a valid phone number");
        setLoading(false);
        return;
      }

      // Password validation
      if (password.length < 4) {
        setSubmitError("Password must be at least 4 characters long");
        setLoading(false);
        return;
      }

      const endpoint = isLogin ? "auth/login" : "auth/register";
      const requestBody = isLogin
        ? { phone, password }
        : {
            name,
            phone,
            password,
            role: userType,
            ...(email && { email })
          };

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(getApiUrl(endpoint), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        setSubmitError("Server response error. Please try again.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setSubmitError(data.error || (isLogin ? "Login failed" : "Registration failed"));
        setLoading(false);
        return;
      }

      updateUserProfile(data.data);
      navigate(data.data.user.role === "owner" ? "/admin" : "/dashboard");
      
    } catch (error) {
      if (error.name === 'AbortError') {
        setSubmitError("Request timeout. Please check your connection and try again.");
      } else {
        setSubmitError("Network error. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm px-4 sm:px-0">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl">👨‍💼</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Umiya Ji</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Dining Hall</p>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {isLogin ? "Welcome Back" : `Create ${userType === "owner" ? "Owner" : "Student"} Account`}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            {userType === "owner" ? "Owner Access & Management" : "Student Meal Ordering"}
          </p>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm text-center">{submitError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  disabled={loading}
                  className="rounded-xl h-10 sm:h-12 text-sm sm:text-base disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  disabled={loading}
                  className="rounded-xl h-10 sm:h-12 text-sm sm:text-base disabled:opacity-60"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={loading}
              className="rounded-xl h-10 sm:h-12 text-sm sm:text-base disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="rounded-xl h-10 sm:h-12 text-sm sm:text-base disabled:opacity-60"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 sm:h-12 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              isLogin ? "Sign In" : "Create Account"
            )}
          </Button>
        </form>

        {/* User Type Toggle */}
        {!isLogin && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Account Type
            </label>
            <div className="flex gap-2">
              {[
                { value: "user", label: "Student", icon: "👤" },
                { value: "owner", label: "Owner", icon: "👨‍💼" },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setUserType(type.value)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300",
                    userType === type.value
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                  )}
                >
                  <span>{type.icon}</span>
                  <span className="text-sm">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toggle */}
        <div className="text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
            }}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span className="font-semibold text-orange-600">
              {isLogin ? "Sign Up" : "Sign In"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
