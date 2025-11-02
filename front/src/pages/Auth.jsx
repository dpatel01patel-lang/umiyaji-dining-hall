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
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      if (!phone || !password) {
        showError("Please fill in all fields", 'Auth');
        setLoading(false);
        return;
      }

      if (!isLogin && !name) {
        showError("Name is required", 'Auth');
        setLoading(false);
        return;
      }

      if (isLogin) {
        // Login - verify user exists in database
        try {
          const response = await fetch(getApiUrl("auth/login"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ phone, password }),
          });

          let data;
          try {
            data = await response.json();
          } catch (parseError) {
            showError("Server error: Invalid response format", 'Auth Login');
            setLoading(false);
            return;
          }

          if (!response.ok) {
            showError(data.error || "Login failed", 'Auth Login');
            setLoading(false);
            return;
          }

          updateUserProfile(data.data);
          navigate(data.data.user.role === "owner" ? "/admin" : "/dashboard");
        } catch (networkError) {
          showError("Network error: Unable to connect to server", 'Auth Login');
          setLoading(false);
          return;
        }
      } else {
        // Register new user
        try {
          const response = await fetch(getApiUrl("auth/register"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              phone,
              password,
              role: userType,
              ...(email && { email }) // Only include email if provided
            }),
          });

          let data;
          try {
            data = await response.json();
          } catch (parseError) {
            showError("Server error: Invalid response format", 'Auth Login');
            setLoading(false);
            return;
          }

          if (!response.ok) {
            showError(data.error || "Registration failed", 'Auth Registration');
            setLoading(false);
            return;
          }

          updateUserProfile(data.data);
          navigate(data.data.user.role === "owner" ? "/admin" : "/dashboard");
        } catch (networkError) {
          showError("Network error: Unable to connect to server", 'Auth Login');
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      showError(err, 'Auth');
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="rounded-xl h-10 sm:h-12 text-sm sm:text-base"
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
                  className="rounded-xl h-10 sm:h-12 text-sm sm:text-base"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="rounded-xl h-10 sm:h-12 text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-xl h-10 sm:h-12 text-sm sm:text-base"
            />
          </div>

          

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 sm:h-12 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
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
