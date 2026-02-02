import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

type Props = {
  children?: React.ReactNode;
};

export function RegistrationGuard({ children }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  // Если не залогинен - редирект на логин
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Если статус не WAITING - регистрация завершена, редирект в кабинет
  if (user?.status !== "WAITING") {
    return <Navigate to="/cabinet" replace />;
  }

  // Если WAITING - пускаем на страницу регистрации
  return children ? <>{children}</> : <Outlet />;
}
