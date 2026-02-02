import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { fetchProfile, updateProfile } from "../../../shared/api";
import { FormField } from "../../../shared/ui/FormField";

type ProfileForm = {
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
};

export default function Profile() {
  const { t, i18n } = useTranslation();
  const profileQuery = useQuery({
    queryKey: ["profile", i18n.language],
    queryFn: fetchProfile,
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => alert(t("profile.saved")),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileForm>();

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
    }
  }, [profileQuery.data, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    if (!profileQuery.data) return;
    await mutation.mutateAsync({
      ...data,
      academicDegree: data.academicDegree || null,
      consentDataProcessing: profileQuery.data.consentDataProcessing || false,
      consentDataTransfer: profileQuery.data.consentDataTransfer || false,
      userID: profileQuery.data.userID,
    });
  });

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{t("cabinet.profile")}</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("profile.title")}</h1>
        <p className="text-slate-600 dark:text-slate-300">{t("profile.subtitle")}</p>
      </div>

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
            {...register("phone", { required: t("validation.required") as string })}
          />
        </FormField>
        <FormField label={t("fields.postalAddress")} required error={errors.postalAddress?.message}>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            {...register("postalAddress", { required: t("validation.required") as string })}
          />
        </FormField>
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-[2px] hover:shadow-xl disabled:opacity-60"
      >
        {mutation.isPending ? t("actions.loading") : t("actions.save")}
      </button>
    </form>
  );
}
