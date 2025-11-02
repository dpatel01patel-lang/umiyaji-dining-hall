import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Menu, Bell, User } from "lucide-react";

export default function AdminLayout({ children, className }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        className="lg:relative lg:translate-x-0"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <Menu size={18} className="text-gray-600" />
              </button>
              
              {/* Desktop logo/title */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                  <User size={16} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-xs text-gray-600">
                    Welcome back, {userProfile?.name || "Owner"}
                  </p>
                </div>
              </div>

              {/* Mobile title */}
              <div className="lg:hidden">
                <h1 className="text-base font-bold text-gray-900">Umiya ji Dining Hall</h1>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell size={18} className="text-gray-600" />
                {/* Notification dot */}
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>

              {/* User Profile */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <User size={14} className="text-white" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {userProfile?.name || "Admin"}
                  </div>
                  <div className="text-xs text-gray-600">Administrator</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className={`max-w-7xl mx-auto ${className}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
