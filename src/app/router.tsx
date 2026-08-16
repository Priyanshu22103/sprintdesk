import { lazy, Suspense } from "react";
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

const Dashboard = lazy(
  () => import("../pages/Dashboard"),
);

const Board = lazy(
  () => import("../pages/Board"),
);

const Analytics = lazy(
  () => import("../pages/Analytics"),
);

const Login = lazy(
  () => import("../pages/Login"),
);

function RouteLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />

        <p className="mt-4 text-sm text-slate-500">
          Loading...
        </p>
      </div>
    </div>
  );
}

function AppRouter() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/board"
              element={<Board />}
            />

            <Route
              path="/analytics"
              element={<Analytics />}
            />
          </Route>
        </Route>

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;