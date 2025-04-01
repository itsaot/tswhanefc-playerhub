
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

type ProtectedRouteProps = {
  allowedRoles: Array<"admin" | "user">;
};

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user } = useContext(UserContext);

  // If no role, redirect to login
  if (!user.role) {
    return <Navigate to="/login" replace />;
  }

  // If role not allowed, redirect to dashboard
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
