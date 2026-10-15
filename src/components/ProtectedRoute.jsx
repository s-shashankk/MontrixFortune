import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { auth } = useAuth();

  const isAdmin =
    auth?.user?.role === "ADMIN" ||
    auth?.user?.role === "ROLE_ADMIN" ||
    (auth?.user?.roles
      ? Array.isArray(auth.user.roles)
        ? auth.user.roles.includes("ROLE_ADMIN")
        : auth.user.roles.includes("ROLE_ADMIN")
      : false);

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
