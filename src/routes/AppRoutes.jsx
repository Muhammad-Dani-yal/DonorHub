import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";
import UserRoute from "../components/UserRoute";
import Navbar from "../components/Navbar";

const Landing = lazy(() => import("../pages/Landing/Landing"));
const Login = lazy(() => import("../pages/Login/Login"));
const Register = lazy(() => import("../pages/Register/Register"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const Profile = lazy(() => import("../pages/Profile/Profile"));
const Donors = lazy(() => import("../pages/Donors/Donors"));
const Donate = lazy(() => import("../pages/Donate/Donate"));
const RequestBlood = lazy(() => import("../pages/RequestBlood/RequestBlood"));
const Requests = lazy(() => import("../pages/Requests/Requests"));
const Activity = lazy(() => import("../pages/Activity/Activity"));
const Admin = lazy(() => import("../pages/Admin/Admin"));
const RequestHistory = lazy(() => import("../pages/RequestHistory/RequestHistory"));
const DonorHistory = lazy(() => import("../pages/DonorHistory/DonorHistory"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));

function AppRoutes() {

  return (

    <BrowserRouter>

      <Navbar />

      <Suspense fallback={<div className="route-loading">Loading DonorHub...</div>}>
      <Routes>

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <UserRoute>
              <Dashboard />
            </UserRoute>
          }
        />

        <Route
          path="/donors"
          element={
            <ProtectedRoute>
              <Donors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/donate"
          element={
            <UserRoute>
              <Donate />
            </UserRoute>
          }
        />

        <Route
          path="/request"
          element={
            <UserRoute>
              <RequestBlood />
            </UserRoute>
          }
        />

        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <Requests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <Activity />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        <Route
          path="/profile"
          element={<UserRoute><Profile /></UserRoute>}
        />

        <Route
          path="/admin/request-history"
          element={
            <AdminRoute>
              <RequestHistory />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/donor-history"
          element={
            <AdminRoute>
              <DonorHistory />
            </AdminRoute>
          }
        />

        <Route path="*" element={<NotFound />} />

      </Routes>
      </Suspense>

    </BrowserRouter>

  );

}

export default AppRoutes;
