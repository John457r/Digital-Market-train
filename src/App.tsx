/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

// Lazy-loaded pages (or imports)
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import Trading from "./pages/dashboard/Trading";
import Deposit from "./pages/dashboard/Deposit";
import Withdraw from "./pages/dashboard/Withdraw";
import Support from "./pages/dashboard/Support";
import InvestmentPlans from "./pages/dashboard/InvestmentPlans";
import Verification from "./pages/dashboard/Verification";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/layout/AdminLayout";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout><DashboardOverview /></DashboardLayout>} />
            <Route path="/dashboard/plans" element={<DashboardLayout><InvestmentPlans /></DashboardLayout>} />
            <Route path="/dashboard/trading" element={<DashboardLayout><Trading /></DashboardLayout>} />
            <Route path="/dashboard/deposit" element={<DashboardLayout><Deposit /></DashboardLayout>} />
            <Route path="/dashboard/withdraw" element={<DashboardLayout><Withdraw /></DashboardLayout>} />
            <Route path="/dashboard/support" element={<DashboardLayout><Support /></DashboardLayout>} />
            <Route path="/dashboard/notifications" element={<DashboardLayout><div className="text-gray-500 uppercase italic p-10 bg-[#0d0d0d] rounded-2xl border border-[#1a1a1a]">Notification feed active. No new alerts.</div></DashboardLayout>} />
            <Route path="/dashboard/verification" element={<DashboardLayout><Verification /></DashboardLayout>} />
            <Route path="/dashboard/settings" element={<DashboardLayout><div className="text-gray-500 uppercase italic p-10 bg-[#0d0d0d] rounded-2xl border border-[#1a1a1a]">User settings locked. Profile updates require Admin authorization.</div></DashboardLayout>} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
