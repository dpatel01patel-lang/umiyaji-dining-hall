import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LogOut,
  Menu,
  UtensilsCrossed,
  ShoppingBag,
  CheckCircle2,
  BarChart3,
  Users,
  FileText,
  CreditCard,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Sidebar({ isOpen, onClose, className }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    {
      path: "/admin/menu",
      icon: UtensilsCrossed,
      label: "Menu",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      activeBg: "bg-orange-100",
    },
    {
      path: "/admin/orders",
      icon: ShoppingBag,
      label: "Orders",
      color: "from-blue-500 to-purple-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      activeBg: "bg-blue-100",
    },
    {
      path: "/admin/attendance",
      icon: CheckCircle2,
      label: "Attendance",
      color: "from-green-500 to-teal-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      activeBg: "bg-green-100",
    },
    {
      path: "/admin/analytics",
      icon: BarChart3,
      label: "Analytics",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      activeBg: "bg-purple-100",
    },
    {
      path: "/admin/subscriptions",
      icon: Users,
      label: "Subscriptions",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      activeBg: "bg-indigo-100",
    },
    {
      path: "/admin/billing",
      icon: CreditCard,
      label: "Billing",
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      activeBg: "bg-emerald-100",
    },
    {
      path: "/admin/clients",
      icon: Users,
      label: "Clients",
      color: "from-rose-500 to-pink-500",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      activeBg: "bg-rose-100",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
              <Menu size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Umiya ji Dining Hall</h1>
              <p className="text-xs text-gray-600">Tiffin Service</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group",
                  isActive
                    ? `${item.bgColor} ${item.borderColor} border-2 shadow-sm`
                    : "hover:bg-gray-50"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    isActive
                      ? `bg-gradient-to-r ${item.color} shadow-lg`
                      : "bg-gray-100 group-hover:scale-105"
                  )}
                >
                  <Icon
                    size={14}
                    className={cn(
                      "transition-colors",
                      isActive ? "text-white" : "text-gray-600"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "text-sm font-semibold transition-colors",
                      isActive ? "text-gray-900" : "text-gray-700"
                    )}
                  >
                    {item.label}
                  </div>
                  {isActive && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      Active page
                    </div>
                  )}
                </div>
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group"
          >
            <div className="p-2 bg-red-100 group-hover:bg-red-200 rounded-lg transition-colors">
              <LogOut size={14} className="text-red-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-semibold">Logout</div>
              <div className="text-xs text-gray-500 group-hover:text-red-500">
                Sign out of admin
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
