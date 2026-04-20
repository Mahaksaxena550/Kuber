import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  MdDashboard,
  MdShowChart,
  MdShoppingCart,
  MdAccountBalanceWallet,
  MdPieChart,
  MdAutoAwesome,
  MdCardMembership,
  MdCurrencyBitcoin,
  MdLogout,
  MdPerson,
} from "react-icons/md";

const menuItems = [
  { path: "/dashboard", icon: MdDashboard, label: "Dashboard" },
  { path: "/market", icon: MdShowChart, label: "Market" },
  { path: "/orders", icon: MdShoppingCart, label: "Orders" },
  { path: "/portfolio", icon: MdPieChart, label: "Portfolio" },
  { path: "/wallet", icon: MdAccountBalanceWallet, label: "Wallet" },
  { path: "/crypto", icon: MdCurrencyBitcoin, label: "Crypto" },
  { path: "/ai-bot", icon: MdAutoAwesome, label: "AI Bot" },
  { path: "/subscriptions", icon: MdCardMembership, label: "Plans" },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-30 transform transition-transform duration-300 shadow-xl lg:shadow-none
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <h1 className="text-xl font-bold gradient-text">Kuber</h1>
          <span className="ml-2 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2.5 py-0.5 rounded-full font-medium">
            Beta
          </span>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1">
          <p className="px-3 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</p>
          {menuItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              style={{ animationDelay: `${index * 50}ms` }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all duration-200 animate-slide-right
                ${
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <item.icon className="text-lg" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100 bg-gray-50/50">
          <NavLink
            to="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-white hover:shadow-sm transition-all mb-1"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate text-sm">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 w-full transition-all btn-press"
          >
            <MdLogout className="text-lg" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}