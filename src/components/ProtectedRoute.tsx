
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

type ProtectedRouteProps = {
  allowedRoles: Array<"admin" | "user">;
};

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user } = useContext(UserContext);

  // For debugging purposes
  console.log("ProtectedRoute - Current user:", user);
  console.log("ProtectedRoute - Allowed roles:", allowedRoles);
  console.log("ProtectedRoute - Is allowed:", user.role ? allowedRoles.includes(user.role) : false);

  // If no role, redirect to login
  if (!user.role) {
    console.log("ProtectedRoute - No role, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // If role not allowed, redirect to dashboard
  if (!allowedRoles.includes(user.role)) {
    console.log("ProtectedRoute - Role not allowed, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("ProtectedRoute - Access granted");
  return <Outlet />;
};

export default ProtectedRoute;
