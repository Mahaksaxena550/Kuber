import React, { useState, useEffect } from "react";
import walletService from "../services/walletService";
import toast, { Toaster } from "react-hot-toast";
import {
  MdAccountBalanceWallet,
  MdAdd,
  MdRemove,
  MdArrowUpward,
  MdArrowDownward,
  MdReceipt,
} from "react-icons/md";
import dayjs from "dayjs";

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [walletRes, txnRes] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(),
      ]);
      setWallet(walletRes.data.data);
      setTransactions(txnRes.data.results || []);
    } catch (error) {
      console.error("Wallet error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setActionLoading(true);
    try {
      await walletService.addFunds({
        amount: Number(amount),
        payment_method: "upi",
      });
      toast.success(`₹${Number(amount).toLocaleString("en-IN")} added to wallet!`);
      setAmount("");
      setShowAddFunds(false);
      fetchWalletData();
    } catch (error) {
      toast.error("Failed to add funds");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (Number(amount) > Number(wallet?.available_balance || 0)) {
      toast.error("Insufficient balance");
      return;
    }
    setActionLoading(true);
    try {
      await walletService.withdraw({
        amount: Number(amount),
        notes: "Withdrawal to bank account",
      });
      toast.success(`₹${Number(amount).toLocaleString("en-IN")} withdrawal initiated!`);
      setAmount("");
      setShowWithdraw(false);
      fetchWalletData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Withdrawal failed");
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  };

  const getTxnIcon = (type) => {
    switch (type) {
      case "deposit": return <MdArrowDownward className="text-green-600" />;
      case "withdrawal": return <MdArrowUpward className="text-red-600" />;
      case "buy": return <MdArrowUpward className="text-orange-600" />;
      case "sell": return <MdArrowDownward className="text-blue-600" />;
      default: return <MdReceipt className="text-gray-600" />;
    }
  };

  const getTxnColor = (type) => {
    switch (type) {
      case "deposit": case "sell": case "refund": return "text-green-600";
      case "withdrawal": case "buy": case "fee": case "subscription": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      failed: "bg-red-100 text-red-700",
      reversed: "bg-gray-100 text-gray-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
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
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Wallet</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm mb-1">Available Balance</p>
            <p className="text-4xl font-bold">
              ₹{formatCurrency(wallet?.available_balance)}
            </p>
            <div className="flex gap-6 mt-3 text-sm">
              <div>
                <span className="text-blue-200">Total: </span>
                <span className="font-medium">₹{formatCurrency(wallet?.balance)}</span>
              </div>
              <div>
                <span className="text-blue-200">Locked: </span>
                <span className="font-medium">₹{formatCurrency(wallet?.locked_balance)}</span>
              </div>
            </div>
          </div>
          <MdAccountBalanceWallet className="text-6xl text-blue-300 opacity-50" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => { setShowAddFunds(true); setShowWithdraw(false); setAmount(""); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
          >
            <MdAdd className="text-lg" />
            Add Funds
          </button>
          <button
            onClick={() => { setShowWithdraw(true); setShowAddFunds(false); setAmount(""); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition"
          >
            <MdRemove className="text-lg" />
            Withdraw
          </button>
        </div>
      </div>

      {/* Add Funds / Withdraw Form */}
      {(showAddFunds || showWithdraw) && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {showAddFunds ? "Add Funds" : "Withdraw Funds"}
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm text-gray-500 mb-1">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                min="1"
              />
            </div>

            {/* Quick amounts */}
            <div className="flex items-end gap-2">
              {[1000, 5000, 10000, 50000].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(String(val))}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  ₹{(val / 1000)}K
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={showAddFunds ? handleAddFunds : handleWithdraw}
              disabled={actionLoading}
              className={`px-6 py-2.5 rounded-lg font-medium text-white transition disabled:opacity-50
                ${showAddFunds ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
            >
              {actionLoading
                ? "Processing..."
                : showAddFunds
                ? "Add Funds"
                : "Withdraw"}
            </button>
            <button
              onClick={() => { setShowAddFunds(false); setShowWithdraw(false); }}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Transaction History</h2>
        </div>

        {transactions.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                    ${txn.txn_type === "deposit" ? "bg-green-50" :
                      txn.txn_type === "withdrawal" ? "bg-red-50" :
                      "bg-gray-50"}`}
                  >
                    {getTxnIcon(txn.txn_type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {txn.txn_type}
                    </p>
                    <p className="text-xs text-gray-400">
                      {txn.description || dayjs(txn.created_at).format("DD MMM YYYY, hh:mm A")}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-medium ${getTxnColor(txn.txn_type)}`}>
                    {["deposit", "sell", "refund"].includes(txn.txn_type) ? "+" : "-"}
                    ₹{formatCurrency(txn.amount)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadge(txn.status)}`}>
                    {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <MdReceipt className="text-4xl mb-2" />
            <p>No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}