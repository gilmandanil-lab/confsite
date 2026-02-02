import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  createTalk,
  fetchMyTalks,
  fetchPublicSections,
  fetchTalk,
  updateTalk,
  uploadTalkFile,
  fetchPublicDocumentTemplates,
  downloadDocumentTemplate,
} from "../../../shared/api";
import { FormField } from "../../../shared/ui/FormField";

type TalkForm = {
  title: string;
  affiliation: string;
  abstract: string;
  kind: "PLENARY" | "ORAL" | "POSTER";
  sectionId?: string;
  authors: { fullName: string; affiliation: string }[];
};

export default function TalkEdit({ mode }: { mode: "create" | "edit" }) {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [licenseAgreementUploaded, setLicenseAgreementUploaded] = useState(false);

  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: fetchPublicDocumentTemplates,
  });

  const sectionsQuery = useQuery({
    queryKey: ["public-sections", i18n.language],
    queryFn: fetchPublicSections,
  });
  const talkQuery = useQuery({
    queryKey: ["talk", id, i18n.language],
    queryFn: () => fetchTalk(id || ""),
    enabled: mode === "edit" && Boolean(id),
  });
  const talksQuery = useQuery({
    queryKey: ["my-talks", i18n.language],
    queryFn: fetchMyTalks,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TalkForm>({
    defaultValues: {
      title: "",
      affiliation: "",
      abstract: "",
      kind: "ORAL",
      sectionId: "",
      authors: [{ fullName: "", affiliation: "" }],
    },
  });

  const authorsArray = useFieldArray({ control, name: "authors" });

  useEffect(() => {
    if (talkQuery.data) {
      reset({
        title: talkQuery.data.title,
        affiliation: talkQuery.data.affiliation,
        abstract: talkQuery.data.abstract,
        kind: talkQuery.data.kind,
        sectionId: talkQuery.data.sectionId || "",
        authors: talkQuery.data.authors?.length ? talkQuery.data.authors : [{ fullName: "", affiliation: "" }],
      });
      setCurrentFileUrl(talkQuery.data.fileUrl || null);
    }
  }, [reset, talkQuery.data]);

  const createMutation = useMutation({
    mutationFn: createTalk,
    onSuccess: () => {},
  });

  const updateMutation = useMutation({
    mutationFn: ({ talkId, payload }: { talkId: string; payload: Omit<TalkForm, "sectionId"> & { sectionId?: string } }) =>
      updateTalk(talkId, payload as any),
    onSuccess: () => navigate("/cabinet/talks"),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ talkId, file }: { talkId: string; file: File }) => uploadTalkFile(talkId, file),
    onSuccess: (data) => {
      setCurrentFileUrl(data.url);
      setSelectedFile(null);
      setUploadSuccess(true);
      // Hide success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    },
    onError: (error) => {
      console.error("File upload error:", error);
      alert(t("talks.uploadError"));
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);
    if (data.abstract.length < 250 || data.abstract.length > 350) {
      setFormError(t("talks.abstractRule"));
      return;
    }
    if (!data.authors.length || data.authors.some((a) => !a.fullName.trim() || !a.affiliation.trim())) {
      setFormError(t("talks.authorsRequired"));
      return;
    }
    try {
      if (mode === "create") {
        const res = await createMutation.mutateAsync({
          title: data.title,
          affiliation: data.affiliation,
          abstract: data.abstract,
          kind: data.kind,
          sectionId: data.sectionId || undefined,
          authors: data.authors,
        });
        // if user attached a file during creation, upload it
        if (selectedFile && res?.id) {
          await uploadMutation.mutateAsync({ talkId: res.id, file: selectedFile });
        }
        navigate("/cabinet/talks");
      } else if (id) {
        await updateMutation.mutateAsync({
          talkId: id,
          payload: {
            title: data.title,
            affiliation: data.affiliation,
            abstract: data.abstract,
            kind: data.kind,
            sectionId: data.sectionId || undefined,
            authors: data.authors,
          },
        });
      }
    } catch (err: any) {
      setFormError(err?.message || t("talks.saveError"));
    }
  });

  const talkLimitReached = useMemo(() => (talksQuery.data?.length || 0) >= 3, [talksQuery.data]);

  const handleFile = async (file?: File) => {
    if (!file || !id) return;
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) {
      alert(t("registration.badFile"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert(t("talks.fileTooLarge"));
      return;
    }
    await uploadMutation.mutateAsync({ talkId: id, file });
    alert(t("talks.fileUploaded"));
  };

  const getLicenseTemplate = () => {
    return documentsQuery.data?.find((t) => t.documentType === "LICENSE_AGREEMENT");
  };

  const handleDownloadLicenseTemplate = () => {
    const template = getLicenseTemplate();
    if (template) {
      downloadDocumentTemplate(template.fileURL, "LICENSE_AGREEMENT.pdf");
    }
  };

  if (mode === "create" && talkLimitReached) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-100">
        {t("talks.limitReached")}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{t("talks.formTitle")}</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {mode === "create" ? t("talks.new") : t("talks.edit")}
          </h1>
        </div>
        <div className="pill bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-100">max 3</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label={t("talks.title")} required error={errors.title?.message}>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            {...register("title", { required: t("validation.required") as string })}
          />
        </FormField>
        <FormField label={t("talks.affiliation")} required error={errors.affiliation?.message}>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            {...register("affiliation", { required: t("validation.required") as string })}
          />
        </FormField>
        <FormField label={t("talks.section")} error={errors.sectionId?.message}>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            {...register("sectionId")}
          >
            <option value="">{t("talks.sectionNotSet")}</option>
            {sectionsQuery.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t("talks.kind.label")} required error={errors.kind?.message}>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            {...register("kind", { required: t("validation.required") as string })}
          >
            <option value="PLENARY">{t("talks.kind.plenary")}</option>
            <option value="ORAL">{t("talks.kind.oral")}</option>
            <option value="POSTER">{t("talks.kind.poster")}</option>
          </select>
        </FormField>
      </div>

      <FormField label={t("talks.abstract")} required error={errors.abstract?.message} hint={t("talks.abstractHint")}>
        <textarea
          rows={4}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
          {...register("abstract", { required: t("validation.required") as string })}
        />
      </FormField>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">{t("talks.authors")}</div>
          <button
            type="button"
            onClick={() => authorsArray.append({ fullName: "", affiliation: "" })}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {t("talks.addAuthor")}
          </button>
        </div>
        {authorsArray.fields.map((field, idx) => (
          <div key={field.id} className="grid gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700 md:grid-cols-[1fr_1fr_auto]">
            <input
              placeholder={t("talks.authorNamePlaceholder")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              {...register(`authors.${idx}.fullName` as const, { required: t("validation.required") as string })}
            />
            <input
              placeholder={t("talks.authorAffiliationPlaceholder")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              {...register(`authors.${idx}.affiliation` as const, { required: t("validation.required") as string })}
            />
            <button
              type="button"
              onClick={() => authorsArray.remove(idx)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              {t("actions.delete")}
            </button>
          </div>
        ))}
      </div>

      {formError ? <div className="text-sm text-red-500">{formError}</div> : null}

      {/* License Agreement Section */}
      {mode === "edit" && id && getLicenseTemplate() ? (
        <div className="space-y-2 border-b border-slate-200 pb-4 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {t("talks.licenseAgreement") || "License Agreement"}
          </h3>
          <div className="rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t("talks.licenseAgreementTitle") || "License Agreement for Publication"}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {t("talks.licenseAgreementHint") || "Upload signed license agreement"}
                </div>
                <button
                  type="button"
                  onClick={handleDownloadLicenseTemplate}
                  className="mt-2 inline-block text-xs text-brand-600 hover:text-brand-700 underline dark:text-brand-400"
                >
                  {t("actions.download")} {t("registration.template")}
                </button>
              </div>
              <label className="cursor-pointer rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow">
                {t("actions.upload")}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && id) {
                      handleFile(file);
                      setLicenseAgreementUploaded(true);
                    }
                  }}
                />
              </label>
            </div>
            {licenseAgreementUploaded ? (
              <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-200">
                {t("registration.fileUploaded")}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-[2px] hover:shadow-xl disabled:opacity-60"
        >
          {mode === "create" ? t("actions.create") : t("actions.save")}
        </button>
        <button
          type="button"
          onClick={() => navigate("/cabinet/talks")}
          className="rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          {t("actions.cancel")}
        </button>
      </div>
      
      {mode === "create" ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{t("talks.fileUploadTitle")}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t("talks.fileUploadHint")}</div>
            </div>
            <label className="cursor-pointer rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow">
              {t("actions.selectFile")}
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>
          {selectedFile ? <div className="mt-2 text-sm">{selectedFile.name}</div> : null}
        </div>
      ) : null}

      {mode === "edit" && id ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{t("talks.fileUploadTitle")}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t("talks.fileUploadHint")}</div>
            </div>
            <label className="cursor-pointer rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow">
              {t("actions.upload")}
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
          </div>
          {currentFileUrl && (
            <div className="mt-2 text-sm">
              <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">
                {t("talks.fileCurrentlyAttached")}
              </a>
            </div>
          )}
          {uploadMutation.isPending ? (
            <div className="mt-2 text-sm text-slate-500">{t("actions.loading")}</div>
          ) : uploadSuccess ? (
            <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-200">{t("talks.fileUploaded")}</div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
