import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

type Props = {
  children?: React.ReactNode;
};

export function CompletedRegistrationGuard({ children }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  // Если не залогинен - редирект на логин
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Если статус WAITING (регистрация не завершена) - редирект на страницу регистрации
  if (user?.status === "WAITING") {
    return <Navigate to="/register" replace />;
  }

  // Если регистрация завершена - пускаем дальше
  return children ? <>{children}</> : <Outlet />;
}
