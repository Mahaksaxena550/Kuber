import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { MdMenu, MdNotifications } from "react-icons/md";

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <MdMenu className="text-xl" />
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 relative">
          <MdNotifications className="text-xl" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-400">{user?.role?.replace("_", " ")}</p>
          </div>
        </div>
      </div>
    </header>
  );
}