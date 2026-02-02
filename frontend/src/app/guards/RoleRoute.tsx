import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

type Props = {
  roles: string[];
  children?: React.ReactNode;
};

export function RoleRoute({ roles, children }: Props) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const hasRole = roles.some((r) => user?.roles?.includes(r as any));

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!hasRole) {
    return <div className="p-6 text-center text-red-500">Access denied</div>;
  }
  return children ? <>{children}</> : <Outlet />;
}
