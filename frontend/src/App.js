import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Market from "./pages/Market";
import Portfolio from "./pages/Portfolio";
import WalletPage from "./pages/Wallet";
import Orders from "./pages/Orders";
import Subscriptions from "./pages/Subscriptions";
import AiBot from "./pages/AiBot";
import Profile from "./pages/Profile";
import Crypto from "./pages/Crypto";

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
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/market"
            element={
              <ProtectedRoute>
                <Layout>
                  <Market />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Layout>
                  <Orders />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <Layout>
                  <Portfolio />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Layout>
                  <WalletPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/crypto"
            element={
              <ProtectedRoute>
                <Layout>
                  <Crypto />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-bot"
            element={
              <ProtectedRoute>
                <Layout>
                  <AiBot />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <Layout>
                  <Subscriptions />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
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