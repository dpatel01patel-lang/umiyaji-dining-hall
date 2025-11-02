import "./global.css";

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/AdminPanel";
import NotificationsPage from "./pages/NotificationsPage";

// Admin page components
import MenuPage from "./pages/admin/MenuPage";
import OrdersPage from "./pages/admin/OrdersPage";
import AttendancePage from "./pages/admin/AttendancePage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import SubscriptionsPage from "./pages/admin/SubscriptionsPage";
import BillingPage from "./pages/admin/BillingPage";
import ClientsPage from "./pages/admin/ClientsPage";

// Student page components
import StudentMenuPage from "./pages/student/StudentMenuPage";
import StudentAttendancePage from "./pages/student/StudentAttendancePage";
import StudentBillsPage from "./pages/student/StudentBillsPage";
import StudentSubscriptionsPage from "./pages/student/StudentSubscriptionsPage";

// Layout wrappers
import AdminLayout from "./components/AdminLayout";
import StudentLayout from "./components/StudentLayout";

const LoadingPage = () => {
  const [loadingText, setLoadingText] = React.useState("Loading...");
  
  React.useEffect(() => {
    const texts = [
      "Loading menu...",
      "Loading orders...",
      "Loading attendance...",
      "Loading bills...",
      "Loading notifications..."
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      setLoadingText(texts[index]);
      index = (index + 1) % texts.length;
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-600 transition-all duration-500">{loadingText}</p>
        <div className="mt-4 w-48 mx-auto bg-gray-200 rounded-full h-2">
          <div className="bg-orange-500 h-2 rounded-full animate-pulse" style={{width: "100%"}}></div>
        </div>
      </div>
    </div>
  );
};

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = ["owner", "admin"] }) => {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />

              {/* Student Dashboard Pages with Sidebar Layout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <StudentLayout>
                      <StudentMenuPage />
                    </StudentLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/menu"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <StudentLayout>
                      <StudentMenuPage />
                    </StudentLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/attendance"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <StudentLayout>
                      <StudentAttendancePage />
                    </StudentLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/bills"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <StudentLayout>
                      <StudentBillsPage />
                    </StudentLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/subscriptions"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <StudentLayout>
                      <StudentSubscriptionsPage />
                    </StudentLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute allowedRoles={["user"]}>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["owner", "admin"]}>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/menu"
                element={
                  <ProtectedRoute allowedRoles={["owner", "admin"]}>
                    <AdminLayout>
                      <MenuPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute allowedRoles={["owner", "admin"]}>
                    <AdminLayout>
                      <OrdersPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/attendance"
                element={
                  <ProtectedRoute allowedRoles={["owner", "admin"]}>
                    <AdminLayout>
                      <AttendancePage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={["owner", "admin"]}>
                    <AdminLayout>
                      <AnalyticsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/subscriptions"
                element={
                  <ProtectedRoute allowedRoles={["owner", "admin"]}>
                    <AdminLayout>
                      <SubscriptionsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/billing"
                element={
                  <ProtectedRoute allowedRoles={["owner", "admin"]}>
                    <AdminLayout>
                      <BillingPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/clients"
                element={
                  <ProtectedRoute allowedRoles={["owner", "admin"]}>
                    <AdminLayout>
                      <ClientsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")).render(<App />);
