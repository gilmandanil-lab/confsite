import { createContext, ReactNode, useContext } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchMe, login as apiLogin, logout as apiLogout, registerAccount } from "../../shared/api";
import { queryClient } from "../queryClient";
import { MeResponse } from "../../shared/types";

type AuthContextValue = {
  user?: MeResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return await fetchMe();
      } catch (err) {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => apiLogin(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: apiLogout,
    onSettled: () => {
      queryClient.removeQueries({ queryKey: ["me"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => registerAccount(email, password),
  });

  const value: AuthContextValue = {
    user: meQuery.data,
    isAuthenticated: Boolean(meQuery.data?.id),
    isLoading: meQuery.isLoading,
    login: async (email, password) => {
      await loginMutation.mutateAsync({ email, password });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
      queryClient.removeQueries({ queryKey: ["me"] });
    },
    register: async (email, password) => {
      await registerMutation.mutateAsync({ email, password });
    },
    refresh: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
