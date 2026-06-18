import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthProvider";
import PublicSite from "./app/PublicSite";
import ProtectedRoute from "./app/ProtectedRoute";
import Spinner from "./components/ui/Spinner";

// The authed workspace is its own bundle, loaded only after sign-in.
const AppLayout = lazy(() => import("./app/AppLayout"));
const OrdersPage = lazy(() => import("./features/orders/OrdersPage"));
const DashboardPage = lazy(() => import("./features/dashboard/DashboardPage"));
const CustomersPage = lazy(() => import("./features/customers/CustomersPage"));
const SettingsPage = lazy(() => import("./features/settings/SettingsPage"));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicSite />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Suspense fallback={<Spinner fullPage />}>
                  <AppLayout />
                </Suspense>
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<Spinner />}>
                  <OrdersPage />
                </Suspense>
              }
            />
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<Spinner />}>
                  <DashboardPage />
                </Suspense>
              }
            />
            <Route
              path="customers"
              element={
                <Suspense fallback={<Spinner />}>
                  <CustomersPage />
                </Suspense>
              }
            />
            <Route
              path="settings"
              element={
                <Suspense fallback={<Spinner />}>
                  <SettingsPage />
                </Suspense>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
