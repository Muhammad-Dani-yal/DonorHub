import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import Donors from "../pages/Donors/Donors";
import Donate from "../pages/Donate/Donate";
import RequestBlood from "../pages/RequestBlood/RequestBlood";
import Requests from "../pages/Requests/Requests";
import Activity from "../pages/Activity/Activity";
import Admin from "../pages/Admin/Admin";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";
import Navbar from "../components/Navbar";

function AppRoutes() {

  return (

    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
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
            <ProtectedRoute>
              <Donate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/request"
          element={
            <ProtectedRoute>
              <RequestBlood />
            </ProtectedRoute>
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

      </Routes>

    </BrowserRouter>

  );

}

export default AppRoutes;
