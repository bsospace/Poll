import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { SkeletonCard } from "./Skeleton";

interface RequireAuthProps {
  children: JSX.Element;
  requireAdmin?: boolean;
}

export default function RequireAuth({
  children,
  requireAdmin = false,
}: RequireAuthProps) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SkeletonCard />;
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
