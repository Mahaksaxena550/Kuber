import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes — wrapped in Layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-gray-500 mt-2">Welcome to Kuber! Full dashboard coming soon...</p>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/market"
            element={
              <ProtectedRoute>
                <Layout>
                  <h1 className="text-2xl font-bold text-gray-900">Market</h1>
                  <p className="text-gray-500 mt-2">Market page coming soon...</p>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Layout>
                  <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                  <p className="text-gray-500 mt-2">Orders page coming soon...</p>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <Layout>
                  <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
                  <p className="text-gray-500 mt-2">Portfolio page coming soon...</p>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Layout>
                  <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
                  <p className="text-gray-500 mt-2">Wallet page coming soon...</p>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/crypto"
            element={
              <ProtectedRoute>
                <Layout>
                  <h1 className="text-2xl font-bold text-gray-900">Crypto</h1>
                  <p className="text-gray-500 mt-2">Crypto page coming soon...</p>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-bot"
            element={
              <ProtectedRoute>
                <Layout>
                  <h1 className="text-2xl font-bold text-gray-900">AI Bot</h1>
                  <p className="text-gray-500 mt-2">AI Bot page coming soon...</p>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <Layout>
                  <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
                  <p className="text-gray-500 mt-2">Plans page coming soon...</p>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                  <p className="text-gray-500 mt-2">Profile page coming soon...</p>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}