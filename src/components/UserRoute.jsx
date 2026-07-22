import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function UserRoute({ children }) {
  const { user, ready } = useAuth();

  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;

  return children;
}

export default UserRoute;
