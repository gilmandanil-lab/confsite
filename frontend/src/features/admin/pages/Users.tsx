import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { adminListUsers, adminSetUserStatus, adminGetUserConsents } from "../../../shared/api";
import { apiPost } from "../../../shared/api/client";
import { queryClient } from "../../../app/queryClient";
import { AdminUserDto, UserStatus } from "../../../shared/types";

export default function Users() {
  const { t } = useTranslation();
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: adminListUsers,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) => adminSetUserStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-users"] });
      const previousUsers = queryClient.getQueryData<AdminUserDto[]>(["admin-users"]);
      queryClient.setQueryData<AdminUserDto[]>(["admin-users"], (current = []) =>
        current.map((user) => (user.id === id ? { ...user, status } : user)),
      );
      return { previousUsers };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(["admin-users"], context.previousUsers);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData<AdminUserDto[]>(["admin-users"], (current = []) =>
        current.map((user) => (user.id === variables.id ? { ...user, status: data.status } : user)),
      );
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (userId: string) =>
      apiPost<{ password: string }>("/api/admin/users/reset-password", { userId }),
    onSuccess: (data) => {
      setGeneratedPassword(data.password);
    },
  });

  const consentsQuery = useQuery({
    queryKey: ["admin-user-consents", expandedUser],
    queryFn: () => (expandedUser ? adminGetUserConsents(expandedUser) : Promise.resolve([])),
    enabled: !!expandedUser,
  });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{t("admin.users")}</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("admin.usersTitle")}</h1>
      </div>

      {usersQuery.isLoading ? (
        <div className="animate-pulse rounded-xl border border-dashed border-slate-300 p-6 text-slate-400 dark:border-slate-700">
          {t("actions.loading")}
        </div>
      ) : (
        <div className="space-y-3">
          {(usersQuery.data || []).map((user) => (
            <div key={user.id} className="card p-6">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{user.email}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{user.roles.join(", ")}</div>
                </div>
                <button
                  onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  {expandedUser === user.id ? t("actions.close") : t("actions.expand")}
                </button>
              </div>

              {expandedUser === user.id && (
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t("admin.profile")}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>{t("profile.surname")}:</strong> {user.surname}</div>
                      <div><strong>{t("profile.name")}:</strong> {user.name}</div>
                      <div><strong>{t("profile.patronymic")}:</strong> {user.patronymic}</div>
                      <div><strong>{t("profile.birthDate")}:</strong> {user.birthDate}</div>
                      <div><strong>{t("profile.city")}:</strong> {user.city}</div>
                      <div><strong>{t("profile.academicDegree")}:</strong> {user.academicDegree || ""}</div>
                      <div><strong>{t("profile.affiliation")}:</strong> {user.affiliation}</div>
                      <div><strong>{t("profile.position")}:</strong> {user.position}</div>
                      <div><strong>{t("profile.phone")}:</strong> {user.phone}</div>
                      <div><strong>{t("profile.postalAddress")}:</strong> {user.postalAddress}</div>
                      <div><strong>{t("profile.consent")}:</strong> {user.consentAccepted ? t("yes") : t("no")}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {t("admin.status")}
                    </div>
                    <div className="flex gap-2">
                      {(["WAITING", "APPROVED", "REJECTED"] as UserStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => statusMutation.mutate({ id: user.id, status: st })}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            user.status === st
                              ? "bg-brand-700 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100"
                          }`}
                        >
                          {t(`status.${st.toLowerCase()}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {t("admin.consentFiles")}
                    </div>
                    {consentsQuery.isLoading ? (
                      <div className="text-xs text-slate-500">{t("actions.loading")}</div>
                    ) : (consentsQuery.data || []).length > 0 ? (
                      <div className="space-y-2">
                        {(consentsQuery.data || []).map((file) => (
                          <div key={file.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                                {file.consentType === "DATA_PROCESSING"
                                  ? t("registration.consentDataProcessing")
                                  : t("registration.consentDataTransfer")}
                              </div>
                              {file.fileSize && (
                                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                  {(file.fileSize / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            {file.fileUrl && (
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700"
                              >
                                {t("actions.download")}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 dark:text-slate-400">{t("admin.noConsentFiles")}</div>
                    )}
                  </div>

                  <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {t("admin.password")}
                    </div>
                    {generatedPassword && expandedUser === user.id ? (
                      <div className="mt-2 space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/40">
                        <div className="text-xs text-emerald-600 dark:text-emerald-200">
                          {t("admin.passwordGenerated")}
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 rounded bg-slate-900 px-3 py-2 text-xs text-slate-100 dark:bg-slate-800">
                            {generatedPassword}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(generatedPassword);
                            }}
                            className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            {t("actions.copy")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => passwordMutation.mutate(user.id)}
                        disabled={passwordMutation.isPending}
                        className="mt-2 rounded-full bg-slate-600 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
                      >
                        {passwordMutation.isPending ? t("actions.loading") : t("admin.resetPassword")}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
