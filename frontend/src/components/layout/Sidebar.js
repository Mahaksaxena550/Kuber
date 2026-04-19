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
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30 transform transition-transform duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Kuber</h1>
          <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
            Beta
          </span>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-3 flex-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors
                ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <item.icon className="text-lg" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
          <NavLink
            to="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 mb-1"
          >
            <MdPerson className="text-lg" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full"
          >
            <MdLogout className="text-lg" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}