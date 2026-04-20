import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import portfolioService from "../services/portfolioService";
import walletService from "../services/walletService";
import marketService from "../services/marketService";
import orderService from "../services/orderService";
import {
  MdTrendingUp,
  MdTrendingDown,
  MdAccountBalanceWallet,
  MdPieChart,
  MdShowChart,
  MdShoppingCart,
} from "react-icons/md";

export default function Dashboard() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [topGainers, setTopGainers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [portfolioRes, walletRes, gainersRes, ordersRes] = await Promise.all([
        portfolioService.getSummary().catch(() => null),
        walletService.getBalance().catch(() => null),
        marketService.getTopGainers().catch(() => null),
        orderService.getOrders().catch(() => null),
      ]);

      if (portfolioRes) setPortfolio(portfolioRes.data.data);
      if (walletRes) setWallet(walletRes.data.data);
      if (gainersRes) setTopGainers(gainersRes.data.slice(0, 5));
      if (ordersRes) setRecentOrders(ordersRes.data.results?.slice(0, 5) || []);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-500 mt-1">Here's your trading overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-slide-up">
        {/* Portfolio Value */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Portfolio Value</span>
            <MdPieChart className="text-blue-500 text-xl" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{portfolio?.total_current_value?.toLocaleString("en-IN") || "0"}
          </p>
          <p className={`text-sm mt-1 ${portfolio?.total_pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
            {portfolio?.total_pnl >= 0 ? "+" : ""}
            ₹{portfolio?.total_pnl?.toLocaleString("en-IN") || "0"}
            {" "}({portfolio?.total_pnl_pct?.toFixed(2) || "0"}%)
          </p>
        </div>

        {/* Wallet Balance */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Wallet Balance</span>
            <MdAccountBalanceWallet className="text-green-500 text-xl" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{Number(wallet?.balance || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Available: ₹{Number(wallet?.available_balance || 0).toLocaleString("en-IN")}
          </p>
        </div>

        {/* Total Invested */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Total Invested</span>
            <MdShowChart className="text-purple-500 text-xl" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{portfolio?.total_invested?.toLocaleString("en-IN") || "0"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {portfolio?.holdings_count || 0} holdings
          </p>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Total Orders</span>
            <MdShoppingCart className="text-orange-500 text-xl" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {recentOrders.length}
          </p>
          <Link to="/orders" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
            View all orders →
          </Link>
        </div>
      </div>

      {/* Two columns — Top Gainers & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        {/* Top Gainers */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Top Gainers</h2>
            <Link to="/market" className="text-sm text-blue-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {topGainers.length > 0 ? (
              topGainers.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{item.symbol}</p>
                    <p className="text-xs text-gray-400">{item.exchange}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ₹{Number(item.price?.ltp || 0).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-green-600 flex items-center justify-end gap-0.5">
                      <MdTrendingUp />
                      +{item.price?.change_pct}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-5 text-gray-400 text-sm">No market data available</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-blue-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.instrument_symbol}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.side?.toUpperCase()} · {order.order_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      Qty: {Number(order.quantity).toFixed(0)}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${order.status === "filled" ? "bg-green-100 text-green-700" :
                        order.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-5 text-gray-400 text-sm">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}