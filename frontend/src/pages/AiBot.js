import React, { useState, useEffect } from "react";
import aiService from "../services/aiService";
import subscriptionService from "../services/subscriptionService";
import { Link } from "react-router-dom";
import {
  MdAutoAwesome,
  MdTrendingUp,
  MdTrendingDown,
  MdRemove,
  MdLock,
  MdAccessTime,
  MdGpsFixed,
  MdShield,
} from "react-icons/md";

export default function AiBot() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Check subscription first
      const subRes = await subscriptionService.getMySubscription();
      const hasPremium = subRes.data.data?.plan?.tier === "premium";
      setIsPremium(hasPremium);

      if (hasPremium) {
        const sugRes = await aiService.getSuggestions();
        setSuggestions(sugRes.data.results || []);
      }
    } catch (error) {
      console.error("AI Bot error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "buy": return <MdTrendingUp className="text-green-600" />;
      case "sell": return <MdTrendingDown className="text-red-600" />;
      case "hold": return <MdRemove className="text-yellow-600" />;
      default: return <MdRemove className="text-gray-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case "buy": return "bg-green-100 text-green-700 border-green-200";
      case "sell": return "bg-red-100 text-red-700 border-red-200";
      case "hold": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceBar = (confidence) => {
    if (confidence >= 80) return "bg-green-500";
    if (confidence >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatTimeframe = (tf) => {
    switch (tf) {
      case "intraday": return "Intraday";
      case "short_term": return "1-7 Days";
      case "medium_term": return "1-3 Months";
      case "long_term": return "3+ Months";
      default: return tf;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not premium — show upgrade screen
  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
          <MdLock className="text-4xl text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          AI Trade Suggestions
        </h1>
        <p className="text-gray-500 max-w-md mb-6">
          Get AI-powered trade recommendations with confidence scores,
          target prices, and technical analysis. Upgrade to Premium to unlock.
        </p>
        <Link
          to="/subscriptions"
          className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition"
        >
          Upgrade to Premium →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Trade Suggestions</h1>
          <p className="text-gray-500 mt-1">AI-powered recommendations based on technical analysis</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
          <MdAutoAwesome />
          Premium
        </div>
      </div>

      {/* Suggestions Grid */}
      {suggestions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                    ${suggestion.asset_type === "crypto" ? "bg-orange-50" : "bg-blue-50"}`}>
                    {getActionIcon(suggestion.action)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{suggestion.symbol}</p>
                    <p className="text-xs text-gray-400">{suggestion.instrument_name}</p>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${getActionColor(suggestion.action)}`}>
                  {suggestion.action?.toUpperCase()}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5">
                {/* Confidence Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">Confidence</span>
                    <span className={`text-sm font-bold ${getConfidenceColor(Number(suggestion.confidence))}`}>
                      {Number(suggestion.confidence).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getConfidenceBar(Number(suggestion.confidence))}`}
                      style={{ width: `${suggestion.confidence}%` }}
                    ></div>
                  </div>
                </div>

                {/* Price Info */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Current</p>
                    <p className="font-bold text-gray-900 text-sm">
                      ₹{Number(suggestion.ltp || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MdGpsFixed className="text-xs text-green-500" />
                      <p className="text-xs text-green-600">Target</p>
                    </div>
                    <p className="font-bold text-green-700 text-sm">
                      ₹{Number(suggestion.target_price || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MdShield className="text-xs text-red-500" />
                      <p className="text-xs text-red-600">Stop Loss</p>
                    </div>
                    <p className="font-bold text-red-700 text-sm">
                      ₹{Number(suggestion.stop_loss_price || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Timeframe */}
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                  <MdAccessTime />
                  <span>Timeframe: {formatTimeframe(suggestion.timeframe)}</span>
                </div>

                {/* Reasoning */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-700 mb-1">AI Analysis</p>
                  <p className="text-sm text-blue-900">{suggestion.reasoning}</p>
                </div>

                {/* Signals */}
                {suggestion.signals && Object.keys(suggestion.signals).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {Object.entries(suggestion.signals).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium"
                      >
                        {key.toUpperCase()}: {String(value)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <MdAutoAwesome className="text-5xl mb-3" />
          <p className="font-medium">No suggestions available right now</p>
          <p className="text-sm mt-1">Check back later for new AI recommendations</p>
        </div>
      )}
    </div>
  );
}