import React, { useState, useEffect } from "react";
import subscriptionService from "../services/subscriptionService";
import toast, { Toaster } from "react-hot-toast";
import {
  MdCheck,
  MdClose,
  MdStar,
  MdRocketLaunch,
  MdWorkspacePremium,
} from "react-icons/md";

export default function Subscriptions() {
  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getMySubscription(),
      ]);
      setPlans(plansRes.data.results || []);
      setCurrentSub(subRes.data.data);
    } catch (error) {
      console.error("Subscription error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    setSubscribing(true);
    try {
      await subscriptionService.subscribe({
        plan_id: planId,
        gateway: "razorpay",
      });
      toast.success("Subscription activated!");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Subscription failed");
    } finally {
      setSubscribing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) return;
    try {
      await subscriptionService.cancel();
      toast.success("Subscription cancelled");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cancel failed");
    }
  };

  const getPlanIcon = (tier) => {
    switch (tier) {
      case "free": return <MdStar className="text-3xl text-gray-400" />;
      case "premium": return <MdWorkspacePremium className="text-3xl text-yellow-500" />;
      case "enterprise": return <MdRocketLaunch className="text-3xl text-purple-500" />;
      default: return <MdStar className="text-3xl text-gray-400" />;
    }
  };

  const getPlanColor = (tier) => {
    switch (tier) {
      case "free": return "border-gray-200";
      case "premium": return "border-yellow-400 ring-2 ring-yellow-100";
      case "enterprise": return "border-purple-400";
      default: return "border-gray-200";
    }
  };

  const getButtonStyle = (tier) => {
    switch (tier) {
      case "free": return "bg-gray-600 hover:bg-gray-700";
      case "premium": return "bg-yellow-500 hover:bg-yellow-600";
      case "enterprise": return "bg-purple-600 hover:bg-purple-700";
      default: return "bg-gray-600 hover:bg-gray-700";
    }
  };

  const featureList = (features) => {
    const allFeatures = [
      { key: "max_watchlists", label: "Watchlists", format: (v) => `${v} watchlist${v > 1 ? "s" : ""}` },
      { key: "ai_suggestions", label: "AI Trade Suggestions", format: (v) => v },
      { key: "realtime_data", label: "Real-time Market Data", format: (v) => v },
      { key: "api_access", label: "API Access", format: (v) => v },
      { key: "dedicated_support", label: "Dedicated Support", format: (v) => v },
    ];

    return allFeatures.map((f) => {
      const value = features?.[f.key];
      const hasFeature = value !== undefined && value !== false && value !== 0;
      return {
        label: typeof f.format(value) === "string" ? f.format(value) : f.label,
        available: hasFeature,
      };
    });
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

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-gray-500 mt-2">Choose the plan that fits your trading needs</p>
      </div>

      {/* Current Subscription Banner */}
      {currentSub && (
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MdWorkspacePremium className="text-2xl text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-900">
                Active: {currentSub.plan?.name}
              </p>
              <p className="text-sm text-yellow-700">
                ₹{currentSub.plan?.price}/{currentSub.plan?.billing_cycle}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-yellow-400 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition"
          >
            Cancel Plan
          </button>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentSub?.plan?.id === plan.id;
          const features = featureList(plan.features);

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden transition-transform hover:-translate-y-1 ${getPlanColor(plan.tier)}`}
            >
              {/* Plan Header */}
              <div className="p-6 text-center border-b border-gray-100">
                {getPlanIcon(plan.tier)}
                <h3 className="text-lg font-bold text-gray-900 mt-3">{plan.name}</h3>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{Number(plan.price).toLocaleString("en-IN")}
                  </span>
                  <span className="text-gray-400 text-sm">/{plan.billing_cycle}</span>
                </div>
              </div>

              {/* Features */}
              <div className="p-6">
                <ul className="space-y-3">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm">
                      {feature.available ? (
                        <MdCheck className="text-green-500 text-lg flex-shrink-0" />
                      ) : (
                        <MdClose className="text-gray-300 text-lg flex-shrink-0" />
                      )}
                      <span className={feature.available ? "text-gray-700" : "text-gray-400"}>
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || subscribing || plan.tier === "free"}
                  className={`w-full mt-6 py-3 rounded-lg font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed
                    ${isCurrentPlan ? "bg-green-600" : getButtonStyle(plan.tier)}`}
                >
                  {isCurrentPlan
                    ? "Current Plan ✓"
                    : plan.tier === "free"
                    ? "Free Forever"
                    : subscribing
                    ? "Processing..."
                    : `Subscribe to ${plan.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}