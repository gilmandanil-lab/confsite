import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";
import { fetchProfile, submitRegistration, fetchPublicDocumentTemplates, downloadDocumentTemplate } from "../../../shared/api";
import { apiUpload } from "../../../shared/api/client";
import { FormField } from "../../../shared/ui/FormField";

type RegistrationForm = {
  surname: string;
  name: string;
  patronymic: string;
  birthDate: string;
  city: string;
  academicDegree?: string;
  affiliation: string;
  position: string;
  phone: string;
  postalAddress: string;
  consentDataProcessing: boolean;
  consentDataTransfer: boolean;
};

const PHONE_PATTERN = /^[0-9+()\s-]{6,}$/;

export default function Register() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [fileUploadedProcessing, setFileUploadedProcessing] = useState(false);
  const [fileUploadedTransfer, setFileUploadedTransfer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ["profile", i18n.language],
    queryFn: fetchProfile,
    enabled: isAuthenticated,
  });

  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: fetchPublicDocumentTemplates,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegistrationForm>({
    defaultValues: {
      surname: profileQuery.data?.surname,
      name: profileQuery.data?.name,
      patronymic: profileQuery.data?.patronymic,
      birthDate: profileQuery.data?.birthDate?.slice(0, 10),
      city: profileQuery.data?.city,
      academicDegree: profileQuery.data?.academicDegree || "",
      affiliation: profileQuery.data?.affiliation,
      position: profileQuery.data?.position,
      phone: profileQuery.data?.phone,
      postalAddress: profileQuery.data?.postalAddress,
      consentDataProcessing: profileQuery.data?.consentDataProcessing || false,
      consentDataTransfer: profileQuery.data?.consentDataTransfer || false,
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      const p = profileQuery.data;
      setValue("surname", p.surname || "");
      setValue("name", p.name || "");
      setValue("patronymic", p.patronymic || "");
      setValue("birthDate", (p.birthDate || "").slice(0, 10));
      setValue("city", p.city || "");
      setValue("academicDegree", p.academicDegree || "");
      setValue("affiliation", p.affiliation || "");
      setValue("position", p.position || "");
      setValue("phone", p.phone || "");
      setValue("postalAddress", p.postalAddress || "");
      setFileUploadedProcessing(profileQuery.data.consentDataProcessing);
      setFileUploadedTransfer(profileQuery.data.consentDataTransfer);
    }
  }, [profileQuery.data, setValue]);

  const registrationMutation = useMutation({
    mutationFn: submitRegistration,
  });

  const uploadMutation = useMutation({
    mutationFn: (payload: { file: File; type: string }) => {
      const formData = new FormData();
      formData.append("file", payload.file);
      return apiUpload<{ ok: boolean; url: string; key: string }>(`/api/files/consent?type=${payload.type}`, formData);
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    try {
      if (!fileUploadedProcessing || !fileUploadedTransfer) {
        setError(t("registration.consentFilesRequired"));
        return;
      }
      await registrationMutation.mutateAsync({
        ...data,
        academicDegree: data.academicDegree || null,
      });
      alert(t("registration.success"));
    } catch (err: any) {
      setError(err?.message || t("registration.error"));
    }
  });

  const handleFile = async (file?: File, type?: string) => {
    if (!file || !type) return;
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      setError(t("registration.badFile"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(t("registration.fileTooLarge"));
      return;
    }
    try {
      await uploadMutation.mutateAsync({ file, type });
      setError(null);
      if (type === "DATA_PROCESSING") {
        setFileUploadedProcessing(true);
      } else if (type === "DATA_TRANSFER") {
        setFileUploadedTransfer(true);
      }
    } catch (err: any) {
      setError(err?.message || t("registration.error"));
    }
  };

  const handleDownloadTemplate = (fileURL: string, documentType: string) => {
    const fileName = `${documentType}.pdf`;
    downloadDocumentTemplate(fileURL, fileName);
  };

  const getTemplateByType = (docType: string) => {
    return documentsQuery.data?.find((t) => t.documentType === docType);
  };

  if (!isAuthenticated) {
    return (
      <div className="card space-y-4 p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("registration.title")}</h1>
        <p className="text-slate-600 dark:text-slate-300">{t("registration.needLogin")}</p>
        <div className="flex gap-3">
          <Link to="/login" className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow">
            {t("actions.login")}
          </Link>
          <Link to="/" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-100">
            {t("actions.back")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-2 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{t("registration.subtitle")}</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("registration.title")}</h1>
        <p className="text-slate-600 dark:text-slate-300">{t("registration.helper")}</p>
        {user?.status === "APPROVED" && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100">
            {t("registration.alreadyApproved")}
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label={t("fields.surname")} required error={errors.surname?.message}>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              {...register("surname", { required: t("validation.required") as string })}
            />
          </FormField>
          <FormField label={t("fields.name")} required error={errors.name?.message}>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              {...register("name", { required: t("validation.required") as string })}
            />
          </FormField>
          <FormField label={t("fields.patronymic")} required error={errors.patronymic?.message}>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              {...register("patronymic", { required: t("validation.required") as string })}
            />
          </FormField>
          <FormField label={t("fields.birthDate")} required error={errors.birthDate?.message}>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              {...register("birthDate", { required: t("validation.required") as string })}
            />
          </FormField>
          <FormField label={t("fields.city")} required error={errors.city?.message}>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              {...register("city", { required: t("validation.required") as string })}
            />
          </FormField>
          <FormField label={t("fields.academicDegree")} hint={t("fields.optional")}>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              {...register("academicDegree")}
            />
          </FormField>
          <FormField label={t("fields.affiliation")} required error={errors.affiliation?.message}>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              {...register("affiliation", { required: t("validation.required") as string })}
            />
          </FormField>
          <FormField label={t("fields.position")} required error={errors.position?.message}>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              {...register("position", { required: t("validation.required") as string })}
            />
          </FormField>
          <FormField label={t("fields.phone")} required error={errors.phone?.message}>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              {...register("phone", {
                required: t("validation.required") as string,
                pattern: { value: PHONE_PATTERN, message: t("validation.phone") as string },
              })}
            />
          </FormField>
          <FormField label={t("fields.postalAddress")} required error={errors.postalAddress?.message}>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              {...register("postalAddress", { required: t("validation.required") as string })}
            />
          </FormField>
        </div>

        {/* Consent Files */}
        <div className="space-y-3 border-b border-slate-200 pb-4 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white">{t("registration.consentTitle")}</h3>
          
          {/* Data Processing Consent */}
          <div className="rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t("registration.consentDataProcessing")}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {t("registration.uploadHint")}
                </div>
                {getTemplateByType("CONSENT_DATA_PROCESSING") && (
                  <button
                    type="button"
                    onClick={() => {
                      const template = getTemplateByType("CONSENT_DATA_PROCESSING");
                      if (template) {
                        handleDownloadTemplate(template.fileURL, "CONSENT_DATA_PROCESSING");
                      }
                    }}
                    className="mt-2 inline-block text-xs text-brand-600 hover:text-brand-700 underline dark:text-brand-400"
                  >
                    {t("actions.download")} {t("registration.template")}
                  </button>
                )}
              </div>
              <label className="cursor-pointer rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow">
                {t("actions.upload")}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0], "DATA_PROCESSING")}
                />
              </label>
            </div>
            {uploadMutation.isPending ? (
              <div className="mt-2 text-sm text-slate-500">{t("actions.loading")}</div>
            ) : fileUploadedProcessing ? (
              <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-200">
                {t("registration.fileUploaded")}
              </div>
            ) : null}
          </div>

          {/* Data Transfer Consent */}
          <div className="rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t("registration.consentDataTransfer")}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {t("registration.uploadHint")}
                </div>
                {getTemplateByType("CONSENT_DATA_TRANSFER") && (
                  <button
                    type="button"
                    onClick={() => {
                      const template = getTemplateByType("CONSENT_DATA_TRANSFER");
                      if (template) {
                        handleDownloadTemplate(template.fileURL, "CONSENT_DATA_TRANSFER");
                      }
                    }}
                    className="mt-2 inline-block text-xs text-brand-600 hover:text-brand-700 underline dark:text-brand-400"
                  >
                    {t("actions.download")} {t("registration.template")}
                  </button>
                )}
              </div>
              <label className="cursor-pointer rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow">
                {t("actions.upload")}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0], "DATA_TRANSFER")}
                />
              </label>
            </div>
            {uploadMutation.isPending ? (
              <div className="mt-2 text-sm text-slate-500">{t("actions.loading")}</div>
            ) : fileUploadedTransfer ? (
              <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-200">
                {t("registration.fileUploaded")}
              </div>
            ) : null}
          </div>
        </div>

        {/* Consent Checkboxes */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500 dark:border-slate-700"
              {...register("consentDataProcessing", {
                required: t("validation.required") as string,
              })}
            />
            <span>
              {t("registration.consentDataProcessing")}
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {t("registration.consentDataProcessingNote")}
              </div>
            </span>
          </label>
          {errors.consentDataProcessing && (
            <div className="text-xs text-red-500">{errors.consentDataProcessing.message}</div>
          )}

          <label className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500 dark:border-slate-700"
              {...register("consentDataTransfer", {
                required: t("validation.required") as string,
              })}
            />
            <span>
              {t("registration.consentDataTransfer")}
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {t("registration.consentDataTransferNote")}
              </div>
            </span>
          </label>
          {errors.consentDataTransfer && (
            <div className="text-xs text-red-500">{errors.consentDataTransfer.message}</div>
          )}
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <button
          type="submit"
          disabled={registrationMutation.isPending || uploadMutation.isPending}
          className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-[2px] hover:shadow-xl disabled:opacity-60"
        >
          {registrationMutation.isPending ? t("actions.loading") : t("registration.submit")}
        </button>
      </form>
    </div>
  );
}
