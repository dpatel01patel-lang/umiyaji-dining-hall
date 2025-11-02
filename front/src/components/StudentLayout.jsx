import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "@/components/StudentSidebar";
import { Menu, Bell } from "lucide-react";

export default function StudentLayout({ children, className }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <StudentSidebar
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
                <span className="text-2xl">🍽️</span>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    Umiya Ji Dining
                  </h1>
                  <p className="text-xs text-gray-600">{userProfile?.name}</p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {userProfile?.name?.charAt(0) || "S"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className={className}>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
