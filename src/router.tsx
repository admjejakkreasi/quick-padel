import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Public pages
import Index from "@/pages/Index";
import Booking from "@/pages/Booking";
import Payment from "@/pages/Payment";
import NotFound from "@/pages/NotFound";

// Dashboard pages
import UserDashboard from "@/pages/dashboard/user/Dashboard";
import KasirDashboard from "@/pages/dashboard/kasir/Dashboard";
import AdminDashboard from "@/pages/dashboard/admin/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/booking",
    element: <Booking />,
  },
  {
    path: "/payment",
    element: <Payment />,
  },
  // User dashboard
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute requiredRole="user">
        <DashboardLayout>
          <UserDashboard />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  // Kasir dashboard
  {
    path: "/dashboard/kasir",
    element: (
      <ProtectedRoute requiredRole="kasir">
        <DashboardLayout>
          <KasirDashboard />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  // Admin dashboard
  {
    path: "/dashboard/admin",
    element: (
      <ProtectedRoute requiredRole="admin">
        <DashboardLayout>
          <AdminDashboard />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);