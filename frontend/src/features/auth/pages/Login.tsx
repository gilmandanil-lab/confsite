import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";
import { FormField } from "../../../shared/ui/FormField";
import { apiPost } from "../../../shared/api/client";

type LoginForm = { email: string; password: string };

type RegistrationForm = { email: string; password: string };

const PHONE_PATTERN = /^[0-9+()\s-]{6,}$/;

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loginForm = useForm<LoginForm>();
  const registerForm = useForm<RegistrationForm>();

  const from = (location.state as any)?.from?.pathname || "/cabinet";

  // Login handler
  const onLogin = loginForm.handleSubmit(async (data) => {
    setError(null);
    setSuccessMessage(null);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || t("auth.loginError"));
    }
  });

  // Register account
  const registerAccountMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiPost<{ ok: boolean }>("/api/auth/register", data),
  });

  const onRegister = registerForm.handleSubmit(async (data) => {
    setError(null);
    setSuccessMessage(null);
    try {
      // Step 1: Register account (email/password)
      await registerAccountMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });

      // Step 2: Auto-login
      await login(data.email, data.password);

      // Step 3: Redirect to profile to complete registration
      setSuccessMessage(t("auth.registerSuccess"));
      setTimeout(() => {
        navigate("/register", { replace: true });
      }, 1000);
    } catch (err: any) {
      setError(err?.message || t("registration.error"));
    }
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [from, isAuthenticated, navigate]);

  // Login Mode
  if (mode === "login") {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card space-y-4 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
              {t("auth.loginTitle")}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t("auth.signIn")}
            </h1>
            <p className="text-slate-600 dark:text-slate-300">{t("auth.loginHint")}</p>
          </div>
          <form className="space-y-4" onSubmit={onLogin}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {t("fields.email")}
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
                {...loginForm.register("email", {
                  required: t("validation.required") as string,
                })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {t("fields.password")}
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
                {...loginForm.register("password", {
                  required: t("validation.required") as string,
                })}
              />
            </div>
            {error ? <div className="text-sm text-red-500">{error}</div> : null}
            <button
              type="submit"
              className="w-full rounded-full bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-[2px] hover:shadow-xl"
            >
              {t("actions.login")}
            </button>
          </form>
        </div>

        <div className="card space-y-4 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
              {t("auth.signupTitle")}
            </p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t("auth.createAccount")}
            </h2>
            <p className="text-slate-600 dark:text-slate-300">{t("auth.signupHint")}</p>
          </div>
          <button
            onClick={() => setMode("register")}
            className="w-full rounded-full border border-brand-200 px-4 py-3 text-sm font-semibold text-brand-800 transition hover:-translate-y-[2px] hover:border-brand-400 dark:border-brand-800 dark:text-brand-100"
          >
            {t("auth.register")}
          </button>
        </div>
      </div>
    );
  }

  // Registration Mode - Simple email/password only
  return (
    <div className="space-y-6">
      <button
        onClick={() => setMode("login")}
        className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
      >
        ← {t("actions.back")}
      </button>

      <div className="card space-y-4 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
            {t("auth.signupTitle")}
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("registration.title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-300">{t("registration.helper")}</p>
        </div>

        <form onSubmit={onRegister} className="space-y-4">
          <FormField label={t("fields.email")} required error={registerForm.formState.errors.email?.message}>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              {...registerForm.register("email", {
                required: t("validation.required") as string,
              })}
            />
          </FormField>

          <FormField label={t("fields.password")} required error={registerForm.formState.errors.password?.message}>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              {...registerForm.register("password", {
                required: t("validation.required") as string,
                minLength: {
                  value: 8,
                  message: t("validation.password") as string,
                },
              })}
            />
          </FormField>

          {error ? <div className="text-sm text-red-500">{error}</div> : null}
          {successMessage ? <div className="text-sm text-emerald-600 dark:text-emerald-200">{successMessage}</div> : null}

          <button
            type="submit"
            disabled={registerAccountMutation.isPending}
            className="w-full rounded-full bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-[2px] hover:shadow-xl disabled:opacity-60"
          >
            {registerAccountMutation.isPending ? t("actions.loading") : t("actions.register")}
          </button>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            {t("auth.haveAccount")} 
            <button
              type="button"
              onClick={() => setMode("login")}
              className="ml-1 font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              {t("auth.signIn")}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
