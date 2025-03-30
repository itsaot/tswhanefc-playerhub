
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

type ProtectedRouteProps = {
  allowedRoles: Array<"admin" | "user">;
};

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isAdmin } = useContext(UserContext);

  if (!user.role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
