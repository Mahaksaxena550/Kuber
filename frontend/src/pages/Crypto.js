import React, { useState, useEffect } from "react";
import cryptoService from "../services/cryptoService";
import toast, { Toaster } from "react-hot-toast";
import dayjs from "dayjs";
import {
  MdCurrencyBitcoin,
  MdSwapHoriz,
  MdHistory,
  MdMenuBook,
  MdArrowDownward,
  MdArrowUpward,
} from "react-icons/md";

export default function Crypto() {
  const [pairs, setPairs] = useState([]);
  const [selectedPair, setSelectedPair] = useState(null);
  const [orderBook, setOrderBook] = useState(null);
  const [swapHistory, setSwapHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("swap"); // swap, orderbook, history

  // Swap form
  const [swapData, setSwapData] = useState({
    side: "buy",
    from_amount: "",
  });
  const [swapping, setSwapping] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedPair && tab === "orderbook") {
      fetchOrderBook(selectedPair.uuid);
    }
  }, [selectedPair, tab]);

  const fetchData = async () => {
    try {
      const [pairsRes, historyRes] = await Promise.all([
        cryptoService.getPairs(),
        cryptoService.getSwapHistory().catch(() => ({ data: { results: [] } })),
      ]);
      const pairsList = pairsRes.data.results || pairsRes.data || [];
      setPairs(pairsList);
      if (pairsList.length > 0) setSelectedPair(pairsList[0]);
      setSwapHistory(historyRes.data.results || []);
    } catch (error) {
      console.error("Crypto error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderBook = async (uuid) => {
    try {
      const res = await cryptoService.getOrderBook(uuid);
      setOrderBook(res.data.data);
    } catch (error) {
      console.error("Order book error:", error);
    }
  };

  const handleSwap = async () => {
    if (!selectedPair) {
      toast.error("Select a pair first");
      return;
    }
    if (!swapData.from_amount || Number(swapData.from_amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setSwapping(true);
    try {
      const res = await cryptoService.swap({
        pair_id: selectedPair.id,
        side: swapData.side,
        from_amount: Number(swapData.from_amount),
      });
      toast.success(res.data.message || "Swap completed!");
      setSwapData({ ...swapData, from_amount: "" });
      // Refresh history
      const historyRes = await cryptoService.getSwapHistory();
      setSwapHistory(historyRes.data.results || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Swap failed");
    } finally {
      setSwapping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-right" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crypto</h1>
          <p className="text-gray-500 mt-1">Swap crypto pairs and view order book</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
          <MdCurrencyBitcoin />
          {pairs.length} Pairs
        </div>
      </div>

      {/* Pair Selector */}
      <div className="flex gap-3 mb-6">
        {pairs.map((pair) => (
          <button
            key={pair.id}
            onClick={() => setSelectedPair(pair)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all card-hover
              ${selectedPair?.id === pair.id
                ? "bg-orange-500 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
              }`}
          >
            {pair.symbol}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        {[
          { value: "swap", label: "Swap", icon: MdSwapHoriz },
          { value: "orderbook", label: "Order Book", icon: MdMenuBook },
          { value: "history", label: "History", icon: MdHistory },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition
              ${tab === t.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <t.icon className="text-base" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Swap Tab */}
      {tab === "swap" && selectedPair && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Swap Form */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Swap {selectedPair.symbol}
            </h2>

            {/* Pair Info */}
            <div className="bg-orange-50 rounded-lg p-4 mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">Base</p>
                  <p className="font-bold text-gray-900">{selectedPair.base_symbol}</p>
                </div>
                <MdSwapHoriz className="text-2xl text-orange-400" />
                <div className="text-right">
                  <p className="text-sm text-orange-600">Quote</p>
                  <p className="font-bold text-gray-900">{selectedPair.quote_symbol}</p>
                </div>
              </div>
              <div className="flex justify-between mt-3 text-xs text-orange-600">
                <span>Maker Fee: {selectedPair.maker_fee_pct}%</span>
                <span>Taker Fee: {selectedPair.taker_fee_pct}%</span>
              </div>
            </div>

            {/* Buy / Sell Toggle */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setSwapData({ ...swapData, side: "buy" })}
                className={`py-2.5 rounded-lg font-medium transition
                  ${swapData.side === "buy"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                BUY {selectedPair.base_symbol}
              </button>
              <button
                onClick={() => setSwapData({ ...swapData, side: "sell" })}
                className={`py-2.5 rounded-lg font-medium transition
                  ${swapData.side === "sell"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                SELL {selectedPair.base_symbol}
              </button>
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ({swapData.side === "buy" ? selectedPair.quote_symbol : selectedPair.base_symbol})
              </label>
              <input
                type="number"
                value={swapData.from_amount}
                onChange={(e) => setSwapData({ ...swapData, from_amount: e.target.value })}
                placeholder="Enter amount"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                min="0"
                step="any"
              />
            </div>

            {/* Quick amounts */}
            <div className="flex gap-2 mb-5">
              {[0.1, 0.5, 1, 5, 10].map((val) => (
                <button
                  key={val}
                  onClick={() => setSwapData({ ...swapData, from_amount: String(val) })}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
                >
                  {val}
                </button>
              ))}
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              disabled={swapping}
              className={`w-full py-3 rounded-lg font-medium text-white transition btn-press disabled:opacity-50
                ${swapData.side === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
            >
              {swapping ? "Processing..." : `${swapData.side.toUpperCase()} ${selectedPair.base_symbol}`}
            </button>
          </div>

          {/* Pair Details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pair Details</h2>
            <div className="space-y-4">
              <DetailRow label="Symbol" value={selectedPair.symbol} />
              <DetailRow label="Base Asset" value={`${selectedPair.base_name} (${selectedPair.base_symbol})`} />
              <DetailRow label="Quote Asset" value={selectedPair.quote_symbol} />
              <DetailRow label="Status" value={selectedPair.is_active ? "Active" : "Inactive"} badge={selectedPair.is_active ? "green" : "red"} />
              <DetailRow label="Maker Fee" value={`${selectedPair.maker_fee_pct}%`} />
              <DetailRow label="Taker Fee" value={`${selectedPair.taker_fee_pct}%`} />
              <DetailRow label="Tick Size" value={selectedPair.tick_size} />
              <DetailRow label="Min Quantity" value={selectedPair.min_quantity} />
            </div>
          </div>
        </div>
      )}

      {/* Order Book Tab */}
      {tab === "orderbook" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              Order Book — {selectedPair?.symbol}
            </h2>
            {orderBook?.spread && (
              <p className="text-sm text-gray-400 mt-1">Spread: {orderBook.spread}</p>
            )}
          </div>

          <div className="grid grid-cols-2 divide-x divide-gray-100">
            {/* Bids */}
            <div>
              <div className="px-5 py-2 bg-green-50 text-sm font-medium text-green-700 flex justify-between">
                <span>Price (Bid)</span>
                <span>Quantity</span>
              </div>
              {orderBook?.bids?.length > 0 ? (
                orderBook.bids.map((bid, idx) => (
                  <div key={idx} className="px-5 py-2.5 flex justify-between text-sm border-b border-gray-50 hover:bg-green-50/50">
                    <span className="text-green-600 font-medium">{Number(bid.price).toFixed(4)}</span>
                    <span className="text-gray-600">{Number(bid.quantity).toFixed(4)}</span>
                  </div>
                ))
              ) : (
                <p className="p-5 text-sm text-gray-400">No bids</p>
              )}
            </div>

            {/* Asks */}
            <div>
              <div className="px-5 py-2 bg-red-50 text-sm font-medium text-red-700 flex justify-between">
                <span>Price (Ask)</span>
                <span>Quantity</span>
              </div>
              {orderBook?.asks?.length > 0 ? (
                orderBook.asks.map((ask, idx) => (
                  <div key={idx} className="px-5 py-2.5 flex justify-between text-sm border-b border-gray-50 hover:bg-red-50/50">
                    <span className="text-red-600 font-medium">{Number(ask.price).toFixed(4)}</span>
                    <span className="text-gray-600">{Number(ask.quantity).toFixed(4)}</span>
                  </div>
                ))
              ) : (
                <p className="p-5 text-sm text-gray-400">No asks</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {tab === "history" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Swap History</h2>
          </div>

          {swapHistory.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {swapHistory.map((swap) => (
                <div key={swap.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                      ${swap.side === "buy" ? "bg-green-50" : "bg-red-50"}`}>
                      {swap.side === "buy" ? <MdArrowDownward className="text-green-600" /> : <MdArrowUpward className="text-red-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {swap.side?.toUpperCase()} — {swap.pair_symbol}
                      </p>
                      <p className="text-xs text-gray-400">
                        {dayjs(swap.created_at).format("DD MMM YYYY, hh:mm A")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {Number(swap.from_amount).toFixed(4)} → {Number(swap.to_amount).toFixed(4)}
                    </p>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xs text-gray-400">Rate: {Number(swap.rate).toFixed(4)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${swap.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {swap.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <MdHistory className="text-4xl mb-2" />
              <p>No swap history yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, badge }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50">
      <span className="text-sm text-gray-500">{label}</span>
      {badge ? (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
          ${badge === "green" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {value}
        </span>
      ) : (
        <span className="text-sm font-medium text-gray-900">{value}</span>
      )}
    </div>
  );
}