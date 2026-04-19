import React, { useState, useEffect } from "react";
import portfolioService from "../services/portfolioService";
import {
  MdTrendingUp,
  MdTrendingDown,
  MdPieChart,
  MdShowChart,
  MdAccountBalance,
} from "react-icons/md";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

export default function Portfolio() {
  const [summary, setSummary] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const [summaryRes, holdingsRes] = await Promise.all([
        portfolioService.getSummary(),
        portfolioService.getHoldings(),
      ]);
      setSummary(summaryRes.data.data);
      setHoldings(holdingsRes.data.results || []);
    } catch (error) {
      console.error("Portfolio error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Pie chart data
  const pieData = summary?.allocation?.map((item, index) => ({
    name: item.symbol,
    value: item.value,
    color: COLORS[index % COLORS.length],
  })) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Portfolio</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Total Invested */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Total Invested</span>
            <MdAccountBalance className="text-blue-500 text-xl" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{formatCurrency(summary?.total_invested)}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {summary?.holdings_count || 0} holdings
          </p>
        </div>

        {/* Current Value */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Current Value</span>
            <MdShowChart className="text-purple-500 text-xl" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{formatCurrency(summary?.total_current_value)}
          </p>
        </div>

        {/* Total P&L */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Total P&L</span>
            {Number(summary?.total_pnl) >= 0 ? (
              <MdTrendingUp className="text-green-500 text-xl" />
            ) : (
              <MdTrendingDown className="text-red-500 text-xl" />
            )}
          </div>
          <p className={`text-2xl font-bold ${Number(summary?.total_pnl) >= 0 ? "text-green-600" : "text-red-600"}`}>
            {Number(summary?.total_pnl) >= 0 ? "+" : ""}₹{formatCurrency(summary?.total_pnl)}
          </p>
          <p className={`text-sm mt-1 ${Number(summary?.total_pnl_pct) >= 0 ? "text-green-600" : "text-red-600"}`}>
            {Number(summary?.total_pnl_pct) >= 0 ? "+" : ""}{Number(summary?.total_pnl_pct || 0).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Two columns — Holdings Table & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Your Holdings</h2>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-100">
            <div className="col-span-3">Instrument</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Avg Price</div>
            <div className="col-span-2 text-right">LTP</div>
            <div className="col-span-3 text-right">P&L</div>
          </div>

          {/* Table Body */}
          {holdings.length > 0 ? (
            holdings.map((holding) => (
              <div
                key={holding.id}
                className="grid grid-cols-12 gap-2 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                {/* Instrument */}
                <div className="col-span-3">
                  <p className="font-medium text-gray-900">{holding.symbol}</p>
                  <p className="text-xs text-gray-400">{holding.asset_type}</p>
                </div>

                {/* Quantity */}
                <div className="col-span-2 text-right flex items-center justify-end">
                  <span className="text-sm text-gray-900">
                    {Number(holding.quantity).toFixed(holding.asset_type === "crypto" ? 4 : 0)}
                  </span>
                </div>

                {/* Avg Price */}
                <div className="col-span-2 text-right flex items-center justify-end">
                  <span className="text-sm text-gray-600">
                    ₹{formatCurrency(holding.avg_buy_price)}
                  </span>
                </div>

                {/* LTP */}
                <div className="col-span-2 text-right flex items-center justify-end">
                  <span className="text-sm font-medium text-gray-900">
                    ₹{formatCurrency(holding.ltp)}
                  </span>
                </div>

                {/* P&L */}
                <div className="col-span-3 text-right flex flex-col items-end justify-center">
                  <span className={`text-sm font-medium ${Number(holding.pnl) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {Number(holding.pnl) >= 0 ? "+" : ""}₹{formatCurrency(holding.pnl)}
                  </span>
                  <span className={`text-xs ${Number(holding.pnl_pct) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ({Number(holding.pnl_pct || 0).toFixed(2)}%)
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <MdPieChart className="text-4xl mb-2" />
              <p>No holdings yet</p>
              <p className="text-xs mt-1">Start trading to build your portfolio</p>
            </div>
          )}
        </div>

        {/* Allocation Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Allocation</h2>

          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="mt-4 space-y-2">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {summary?.allocation?.[index]?.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-60 text-gray-400">
              <MdPieChart className="text-4xl mb-2" />
              <p className="text-sm">No allocation data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}