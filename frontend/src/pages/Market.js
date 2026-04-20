import React, { useState, useEffect } from "react";
import marketService from "../services/marketService";
import TradingViewChart from "../components/market/TradingViewChart";
import { MdSearch, MdTrendingUp, MdTrendingDown } from "react-icons/md";

export default function Market() {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedChart, setSelectedChart] = useState("RELIANCE");

  useEffect(() => {
    fetchInstruments();
  }, [filter, page]);

  const fetchInstruments = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (filter !== "all") params.asset_type = filter;
      if (search) params.search = search;

      const res = await marketService.getInstruments(params);
      setInstruments(res.data.results || []);
      setTotalPages(res.data.total_pages || 1);
    } catch (error) {
      console.error("Market error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchInstruments();
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Market</h1>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stocks & crypto..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </form>

          <div className="flex gap-2">
            {[
              { value: "all", label: "All" },
              { value: "stock", label: "Stocks" },
              { value: "crypto", label: "Crypto" },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => { setFilter(btn.value); setPage(1); }}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${filter === btn.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TradingView Chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Live Chart</h2>
          <div className="flex gap-2">
            {["RELIANCE", "TCS", "HDFCBANK", "BTCUSDT", "ETHUSDT"].map((sym) => (
              <button
                key={sym}
                onClick={() => setSelectedChart(sym)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                  ${selectedChart === sym
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
        <TradingViewChart symbol={selectedChart} />
      </div>

      {/* Instruments Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 text-sm font-medium text-gray-500 border-b border-gray-100">
          <div className="col-span-4">Instrument</div>
          <div className="col-span-2 text-right">LTP</div>
          <div className="col-span-2 text-right">Change</div>
          <div className="col-span-2 text-right">Volume</div>
          <div className="col-span-2 text-right">Market Cap</div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : instruments.length > 0 ? (
          instruments.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="col-span-4 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm
                  ${item.asset_type === "crypto" ? "bg-orange-500" : "bg-blue-500"}`}
                >
                  {item.symbol?.slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.symbol}</p>
                  <p className="text-xs text-gray-400">
                    {item.name} · {item.exchange}
                  </p>
                </div>
              </div>

              <div className="col-span-2 flex items-center justify-end">
                <span className="font-medium text-gray-900">
                  ₹{formatPrice(item.price?.ltp)}
                </span>
              </div>

              <div className="col-span-2 flex items-center justify-end">
                {Number(item.price?.change_pct) >= 0 ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <MdTrendingUp />
                    +{item.price?.change_pct}%
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                    <MdTrendingDown />
                    {item.price?.change_pct}%
                  </span>
                )}
              </div>

              <div className="col-span-2 flex items-center justify-end">
                <span className="text-sm text-gray-600">
                  {Number(item.price?.volume || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="col-span-2 flex items-center justify-end">
                <span className="text-sm text-gray-600">
                  {item.market_cap
                    ? `₹${(Number(item.market_cap) / 100000).toFixed(0)}L`
                    : "—"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <MdSearch className="text-4xl mb-2" />
            <p>No instruments found</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}