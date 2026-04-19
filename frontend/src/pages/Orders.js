import React, { useState, useEffect } from "react";
import orderService from "../services/orderService";
import marketService from "../services/marketService";
import toast, { Toaster } from "react-hot-toast";
import dayjs from "dayjs";
import {
  MdShoppingCart,
  MdSearch,
  MdClose,
} from "react-icons/md";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [tab, setTab] = useState("all"); // all, open, history

  // Order form state
  const [instruments, setInstruments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [orderData, setOrderData] = useState({
    side: "buy",
    order_type: "market",
    quantity: "",
    price: "",
    validity: "day",
  });
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderService.getOrders();
      setOrders(res.data.results || []);
    } catch (error) {
      console.error("Orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchInstruments = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setInstruments([]);
      return;
    }
    try {
      const res = await marketService.searchInstruments(query);
      setInstruments(res.data.results || []);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const selectInstrument = (instrument) => {
    setSelectedInstrument(instrument);
    setSearchQuery(instrument.symbol);
    setInstruments([]);
  };

  const handlePlaceOrder = async () => {
    if (!selectedInstrument) {
      toast.error("Select an instrument first");
      return;
    }
    if (!orderData.quantity || Number(orderData.quantity) <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    if (orderData.order_type === "limit" && !orderData.price) {
      toast.error("Enter limit price");
      return;
    }

    setPlacing(true);
    try {
      const payload = {
        instrument_id: selectedInstrument.id,
        side: orderData.side,
        order_type: orderData.order_type,
        quantity: Number(orderData.quantity),
        validity: orderData.validity,
      };
      if (orderData.order_type === "limit") {
        payload.price = Number(orderData.price);
      }

      await orderService.placeOrder(payload);
      toast.success(
        `${orderData.side.toUpperCase()} order placed for ${selectedInstrument.symbol}!`
      );
      setShowOrderForm(false);
      setSelectedInstrument(null);
      setSearchQuery("");
      setOrderData({ side: "buy", order_type: "market", quantity: "", price: "", validity: "day" });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Order placement failed");
    } finally {
      setPlacing(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await orderService.cancelOrder(orderId);
      toast.success("Order cancelled");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cannot cancel this order");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      filled: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      open: "bg-blue-100 text-blue-700",
      cancelled: "bg-red-100 text-red-700",
      rejected: "bg-red-100 text-red-700",
      partially_filled: "bg-orange-100 text-orange-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const filteredOrders = orders.filter((order) => {
    if (tab === "open") return ["pending", "open", "partially_filled"].includes(order.status);
    if (tab === "history") return ["filled", "cancelled", "rejected", "expired"].includes(order.status);
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <button
          onClick={() => setShowOrderForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          <MdShoppingCart />
          Place Order
        </button>
      </div>

      {/* Place Order Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Place Order</h2>
              <button
                onClick={() => setShowOrderForm(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <MdClose className="text-xl text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Instrument Search */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Instrument
                </label>
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => searchInstruments(e.target.value)}
                    placeholder="Type stock or crypto name..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                {/* Search Results Dropdown */}
                {instruments.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-10 max-h-48 overflow-y-auto">
                    {instruments.map((inst) => (
                      <button
                        key={inst.id}
                        onClick={() => selectInstrument(inst)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{inst.symbol}</p>
                          <p className="text-xs text-gray-400">{inst.name} · {inst.exchange}</p>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          ₹{Number(inst.price?.ltp || 0).toLocaleString("en-IN")}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Instrument Info */}
              {selectedInstrument && (
                <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">{selectedInstrument.symbol}</p>
                    <p className="text-xs text-blue-600">{selectedInstrument.name}</p>
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    ₹{Number(selectedInstrument.price?.ltp || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              )}

              {/* Buy / Sell Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOrderData({ ...orderData, side: "buy" })}
                  className={`py-2.5 rounded-lg font-medium transition
                    ${orderData.side === "buy"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  BUY
                </button>
                <button
                  onClick={() => setOrderData({ ...orderData, side: "sell" })}
                  className={`py-2.5 rounded-lg font-medium transition
                    ${orderData.side === "sell"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  SELL
                </button>
              </div>

              {/* Order Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                <select
                  value={orderData.order_type}
                  onChange={(e) => setOrderData({ ...orderData, order_type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="market">Market</option>
                  <option value="limit">Limit</option>
                  <option value="stop_loss">Stop Loss</option>
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={orderData.quantity}
                  onChange={(e) => setOrderData({ ...orderData, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  min="1"
                />
              </div>

              {/* Limit Price (only for limit orders) */}
              {orderData.order_type === "limit" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Limit Price (₹)</label>
                  <input
                    type="number"
                    value={orderData.price}
                    onChange={(e) => setOrderData({ ...orderData, price: e.target.value })}
                    placeholder="Enter limit price"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}

              {/* Estimated Value */}
              {selectedInstrument && orderData.quantity && (
                <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Estimated Value</span>
                  <span className="font-bold text-gray-900">
                    ₹{(Number(orderData.quantity) * Number(orderData.order_type === "limit" ? orderData.price : selectedInstrument.price?.ltp || 0)).toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className={`w-full py-3 rounded-lg font-medium text-white transition disabled:opacity-50
                  ${orderData.side === "buy"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                {placing
                  ? "Placing..."
                  : `${orderData.side.toUpperCase()} ${selectedInstrument?.symbol || ""}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        {[
          { value: "all", label: "All Orders" },
          { value: "open", label: "Open" },
          { value: "history", label: "History" },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition
              ${tab === t.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-100">
          <div className="col-span-3">Instrument</div>
          <div className="col-span-1 text-center">Side</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-1 text-right">Qty</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2 text-right">Date</div>
        </div>

        {/* Table Body */}
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-12 gap-2 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors items-center"
            >
              {/* Instrument */}
              <div className="col-span-3">
                <p className="font-medium text-gray-900">{order.instrument_symbol}</p>
                <p className="text-xs text-gray-400">{order.instrument_name}</p>
              </div>

              {/* Side */}
              <div className="col-span-1 text-center">
                <span className={`text-xs font-bold px-2 py-1 rounded
                  ${order.side === "buy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {order.side?.toUpperCase()}
                </span>
              </div>

              {/* Type */}
              <div className="col-span-2">
                <span className="text-sm text-gray-600 capitalize">{order.order_type}</span>
              </div>

              {/* Quantity */}
              <div className="col-span-1 text-right">
                <span className="text-sm text-gray-900">{Number(order.quantity).toFixed(0)}</span>
              </div>

              {/* Price */}
              <div className="col-span-2 text-right">
                <span className="text-sm font-medium text-gray-900">
                  {order.price ? `₹${Number(order.price).toLocaleString("en-IN")}` : "Market"}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-1 text-center">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Date + Cancel */}
              <div className="col-span-2 text-right">
                <p className="text-xs text-gray-400">
                  {dayjs(order.created_at).format("DD MMM, HH:mm")}
                </p>
                {["pending", "open"].includes(order.status) && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="text-xs text-red-600 hover:underline mt-1"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <MdShoppingCart className="text-4xl mb-2" />
            <p>No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}