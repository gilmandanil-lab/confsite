import { apiDelete, apiDownload, apiGet, apiPatch, apiPost, apiPut, apiUpload, normalizeFileURL } from "./client";
import {
  AdminTalkRow,
  AdminUserDto,
  AuditLogEntry,
  ConsentFile,
  Material,
  MeResponse,
  NewsDto,
  PageDto,
  ProfileDto,
  PublicNewsItem,
  PublicPage,
  PublicParticipant,
  PublicSection,
  SectionDto,
  SectionResponsiblesRow,
  TalkDto,
  UserStatus,
} from "../types";

export type LoginResponse = {
  ok: boolean;
  userId: string;
  roles: string[];
  status: string;
  email: string;
};

export function fetchMe() {
  return apiGet<MeResponse>("/api/me");
}

export function login(email: string, password: string) {
  return apiPost<LoginResponse>("/api/auth/login", { email, password });
}

export function registerAccount(email: string, password: string) {
  return apiPost<{ ok: boolean }>("/api/auth/register", { email, password });
}

export function logout() {
  return apiPost<{ ok: boolean }>("/api/auth/logout");
}

export function verifyEmail(token: string) {
  return apiGet<{ ok: boolean }>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
}

export function fetchPublicPage(slug: string) {
  return apiGet<PublicPage>(`/api/public/pages/${slug}`);
}

export function fetchPublicNewsList() {
  return apiGet<PublicNewsItem[]>("/api/public/news");
}

export function fetchPublicNewsItem(id: string) {
  return apiGet<PublicNewsItem>(`/api/public/news/${id}`);
}

export function fetchPublicParticipants() {
  return apiGet<PublicParticipant[]>("/api/public/participants");
}

export function fetchMaterials() {
  return apiGet<Material[]>("/api/public/materials");
}

export function fetchPublicSections() {
  return apiGet<PublicSection[]>("/api/public/sections");
}

export async function fetchPublicProgram(): Promise<AdminTalkRow[]> {
  const rows = await apiGet<any[]>("/api/public/program");
  return rows.map((t) => ({
    id: t.id ?? t.ID,
    title: t.title ?? t.Title,
    kind: t.kind ?? t.Kind,
    status: t.status ?? t.Status ?? "APPROVED",
    sectionId: t.sectionId ?? t.SectionID ?? null,
    sectionTitleRu: t.sectionTitleRu ?? t.SectionTitleRu ?? null,
    sectionTitleEn: t.sectionTitleEn ?? t.SectionTitleEn ?? null,
    fileUrl: normalizeFileURL(t.fileUrl ?? t.FileURL ?? null) || null,
    speakerFullName: t.speakerFullName ?? t.SpeakerFullName ?? "",
    speakerCity: t.speakerCity ?? t.SpeakerCity ?? "",
    speakerAffiliation: t.speakerAffiliation ?? t.SpeakerAffiliation ?? "",
    authorsJSON: t.authorsJSON ?? t.AuthorsJSON ?? "[]",
    abstract: t.abstract ?? t.Abstract ?? "",
    scheduleTime: t.scheduleTime ?? t.ScheduleTime ?? null,
  }));
}

export async function fetchProfile(): Promise<ProfileDto> {
  const raw = await apiGet<any>("/api/participant/profile");
  return {
    userID: raw.userID ?? raw.UserID,
    surname: raw.surname ?? raw.Surname ?? "",
    name: raw.name ?? raw.Name ?? "",
    patronymic: raw.patronymic ?? raw.Patronymic ?? "",
    birthDate: raw.birthDate ?? raw.BirthDate ?? "",
    city: raw.city ?? raw.City ?? "",
    academicDegree: raw.academicDegree ?? raw.AcademicDegree ?? null,
    affiliation: raw.affiliation ?? raw.Affiliation ?? "",
    position: raw.position ?? raw.Position ?? "",
    phone: raw.phone ?? raw.Phone ?? "",
    postalAddress: raw.postalAddress ?? raw.PostalAddress ?? "",
    consentDataProcessing: raw.consentDataProcessing ?? raw.ConsentDataProcessing ?? false,
    consentDataTransfer: raw.consentDataTransfer ?? raw.ConsentDataTransfer ?? false,
  };
}

export function updateProfile(profile: ProfileDto) {
  const payload = {
    surname: profile.surname,
    name: profile.name,
    patronymic: profile.patronymic,
    birthDate: profile.birthDate,
    city: profile.city,
    academicDegree: profile.academicDegree,
    affiliation: profile.affiliation,
    position: profile.position,
    phone: profile.phone,
    postalAddress: profile.postalAddress,
    consentDataProcessing: profile.consentDataProcessing,
    consentDataTransfer: profile.consentDataTransfer,
  };
  return apiPut<{ ok: boolean }>("/api/participant/profile", payload);
}

export async function fetchMyTalks(): Promise<TalkDto[]> {
  const rows = await apiGet<any[]>("/api/participant/talks");
  return rows.map((t) => ({
    id: t.id,
    title: t.title,
    affiliation: t.affiliation,
    abstract: t.abstract,
    kind: t.kind,
    status: t.status ?? t.Status ?? "WAITING",
    sectionId: t.sectionId ?? null,
    fileUrl: normalizeFileURL(t.fileUrl ?? null) || null,
    authors: typeof t.authors === "string" ? JSON.parse(t.authors) : t.authors,
  }));
}

export async function fetchTalk(id: string): Promise<TalkDto> {
  const t = await apiGet<any>(`/api/participant/talks/${id}`);
  return {
    id: t.id,
    title: t.title,
    affiliation: t.affiliation,
    abstract: t.abstract,
    kind: t.kind,
    status: t.status ?? t.Status ?? "WAITING",
    sectionId: t.sectionId ?? null,
    fileUrl: normalizeFileURL(t.fileUrl ?? null) || null,
    authors: typeof t.authors === "string" ? JSON.parse(t.authors) : t.authors,
  };
}

export function createTalk(payload: Omit<TalkDto, "id">) {
  return apiPost<{ id: string }>("/api/participant/talks", {
    title: payload.title,
    affiliation: payload.affiliation,
    abstract: payload.abstract,
    kind: payload.kind,
    sectionId: payload.sectionId,
    authors: payload.authors,
  });
}

export function updateTalk(id: string, payload: Omit<TalkDto, "id">) {
  return apiPut<{ ok: boolean }>(`/api/participant/talks/${id}`, {
    title: payload.title,
    affiliation: payload.affiliation,
    abstract: payload.abstract,
    kind: payload.kind,
    sectionId: payload.sectionId,
    authors: payload.authors,
  });
}

export function deleteTalk(id: string) {
  return apiDelete<{ ok: boolean }>(`/api/participant/talks/${id}`);
}

export function uploadTalkFile(id: string, file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return apiUpload<{ ok: boolean; key: string; url: string }>(`/api/participant/talks/${id}/file`, fd);
}

export function uploadConsent(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return apiUpload<{ ok: boolean; key: string; url: string }>(`/api/files/consent`, fd);
}

export function submitRegistration(payload: {
  surname: string;
  name: string;
  patronymic: string;
  birthDate: string;
  city: string;
  academicDegree?: string | null;
  affiliation: string;
  position: string;
  phone: string;
  postalAddress: string;
  consentDataProcessing: boolean;
  consentDataTransfer: boolean;
}) {
  return apiPost<{ ok: boolean }>("/api/registration/submit", payload);
}

export async function adminListUsers(): Promise<AdminUserDto[]> {
  const rows = await apiGet<any[]>("/api/admin/users");
  return rows.map((u) => ({
    id: u.id ?? u.ID,
    email: u.email ?? u.Email,
    status: u.status ?? u.Status,
    roles: u.roles ?? u.Roles ?? [],
    surname: u.surname ?? u.Surname ?? "",
    name: u.name ?? u.Name ?? "",
    patronymic: u.patronymic ?? u.Patronymic ?? "",
    birthDate: u.birthDate ?? u.BirthDate ?? "",
    city: u.city ?? u.City ?? "",
    academicDegree: u.academicDegree ?? u.AcademicDegree ?? null,
    affiliation: u.affiliation ?? u.Affiliation ?? "",
    position: u.position ?? u.Position ?? "",
    phone: u.phone ?? u.Phone ?? "",
    postalAddress: u.postalAddress ?? u.PostalAddress ?? "",
    consentAccepted: u.consentAccepted ?? u.ConsentAccepted ?? false,
  }));
}

export function adminSetUserStatus(id: string, status: string) {
  return apiPatch<{ ok: boolean; status: UserStatus }>(`/api/admin/users/${id}/status`, { status });
}

export async function adminGetUserConsents(userId: string): Promise<ConsentFile[]> {
  const rows = await apiGet<any[]>(`/api/admin/users/${userId}/consents`);
  return rows.map((r) => ({
    id: r.id ?? r.ID,
    userId: r.userId ?? r.UserID,
    consentType: r.consentType ?? r.ConsentType,
    fileUrl: normalizeFileURL(r.fileUrl ?? r.FileURL),
    fileSize: r.fileSize ?? r.FileSize ?? undefined,
    mimeType: r.mimeType ?? r.MimeType ?? undefined,
    uploadedAt: r.uploadedAt ?? r.UploadedAt,
  }));
}

export async function adminListSections(): Promise<SectionDto[]> {
  const rows = await apiGet<any[]>("/api/admin/sections");
  return rows.map((r) => ({
    id: r.id ?? r.ID,
    titleRu: r.titleRu ?? r.TitleRu,
    titleEn: r.titleEn ?? r.TitleEn,
    sortOrder: r.sortOrder ?? r.SortOrder ?? 0,
  }));
}

export function adminCreateSection(input: { titleRu: string; titleEn: string; sortOrder: number }) {
  return apiPost<{ ok: boolean }>("/api/admin/sections", input);
}

export async function adminListNews(): Promise<NewsDto[]> {
  const rows = await apiGet<any[]>("/api/admin/news");
  return rows.map((n) => ({
    id: n.id ?? n.ID,
    titleRu: n.titleRu ?? n.TitleRu,
    bodyRu: n.bodyRu ?? n.BodyRu,
    titleEn: n.titleEn ?? n.TitleEn,
    bodyEn: n.bodyEn ?? n.BodyEn,
    pinned: n.pinned ?? n.Pinned ?? false,
    publishedAt: n.publishedAt ?? n.PublishedAt,
  }));
}

export function adminCreateNews(input: Omit<NewsDto, "id" | "publishedAt">) {
  return apiPost<{ ok: boolean }>("/api/admin/news", input);
}

export function adminUpdateNews(id: string, input: Omit<NewsDto, "id" | "publishedAt">) {
  return apiPut<{ ok: boolean }>(`/api/admin/news/${id}`, input);
}

export function adminDeleteNews(id: string) {
  return apiDelete<{ ok: boolean }>(`/api/admin/news/${id}`);
}

export async function adminListPages(): Promise<PageDto[]> {
  const rows = await apiGet<any[]>("/api/admin/pages");
  return rows.map((p) => ({
    slug: p.slug ?? p.Slug,
    titleRu: p.titleRu ?? p.TitleRu,
    bodyRu: p.bodyRu ?? p.BodyRu,
    titleEn: p.titleEn ?? p.TitleEn,
    bodyEn: p.bodyEn ?? p.BodyEn,
  }));
}

export function adminUpsertPage(slug: string, input: Omit<PageDto, "slug">) {
  return apiPut<{ ok: boolean }>(`/api/admin/pages/${slug}`, input);
}

export async function adminListTalks(): Promise<AdminTalkRow[]> {
  const rows = await apiGet<any[]>("/api/admin/talks");
  return rows.map((t) => ({
    id: t.id ?? t.ID,
    title: t.title ?? t.Title,
    kind: t.kind ?? t.Kind,
    status: t.status ?? t.Status ?? "WAITING",
    sectionId: t.sectionId ?? t.SectionID ?? null,
    sectionTitleRu: t.sectionTitleRu ?? t.SectionTitleRu ?? null,
    sectionTitleEn: t.sectionTitleEn ?? t.SectionTitleEn ?? null,
    fileUrl: normalizeFileURL(t.fileUrl ?? t.FileURL ?? null) || null,
    speakerFullName: t.speakerFullName ?? t.SpeakerFullName ?? "",
    speakerCity: t.speakerCity ?? t.SpeakerCity ?? "",
    speakerAffiliation: t.speakerAffiliation ?? t.SpeakerAffiliation ?? "",
    authorsJSON: t.authorsJSON ?? t.AuthorsJSON ?? "[]",
    abstract: t.abstract ?? t.Abstract ?? "",
    scheduleTime: t.scheduleTime ?? t.ScheduleTime ?? null,
  }));
}

export function adminSetTalkStatus(id: string, status: UserStatus) {
  return apiPatch<{ ok: boolean; status: UserStatus }>(`/api/admin/talks/${id}/status`, { status });
}

export async function adminListSectionResponsibles(): Promise<SectionResponsiblesRow[]> {
  const rows = await apiGet<any[]>("/api/admin/section-responsibles");
  return rows.map((r) => ({
    sectionId: r.sectionId ?? r.sectionID ?? r.SectionID,
    sectionTitleRu: r.sectionTitleRu ?? r.sectionTitleRU ?? r.SectionTitleRu ?? "",
    sectionTitleEn: r.sectionTitleEn ?? r.sectionTitleEN ?? r.SectionTitleEn ?? "",
    emails: Array.isArray(r.emails) ? r.emails : [],
  }));
}

export function adminSetSectionResponsibles(sectionId: string, emails: string[]) {
  return apiPut<{ ok: boolean }>(`/api/admin/sections/${sectionId}/responsibles`, { emails });
}

export function adminUpdateTalk(id: string, input: { sectionId: string | null; scheduleTime: string | null }) {
  return apiPut<{ ok: boolean }>(`/api/admin/talks/${id}`, {
    sectionId: input.sectionId,
    scheduleTime: input.scheduleTime ? new Date(input.scheduleTime).toISOString() : null,
  });
}

export async function adminListAudit(): Promise<AuditLogEntry[]> {
  const rows = await apiGet<any[]>("/api/admin/audit");
  return rows.map((a) => ({
    id: a.id ?? a.ID,
    actorUserID: a.actorUserID ?? a.ActorUserID ?? null,
    action: a.action ?? a.Action,
    entity: a.entity ?? a.Entity,
    entityID: a.entityID ?? a.EntityID ?? null,
    createdAt: a.createdAt ?? a.CreatedAt,
  }));
}

export function adminExportParticipantsCSV() {
  return apiDownload("/api/admin/exports/participants.csv", "participants.csv");
}

export function adminExportParticipantsXLSX() {
  return apiDownload("/api/admin/exports/participants.xlsx", "participants.xlsx");
}

export function adminExportTalksBySectionXLSX() {
  return apiDownload("/api/admin/exports/talks_by_section.xlsx", "talks_by_section.xlsx");
}

// Document Templates
export type DocumentTemplate = {
  id: string;
  name: string;
  description?: string;
  documentType: string;
  fileURL: string;
  fileSize?: number;
  mimeType?: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProgramFileDto = {
  id: string;
  filename: string;
  filePath: string;
  uploadedAt: string;
};

function normalizeDocumentTemplate(raw: any): DocumentTemplate {
  return {
    id: raw.id ?? raw.ID,
    name: raw.name ?? raw.Name,
    description: raw.description ?? raw.Description ?? undefined,
    documentType: raw.documentType ?? raw.DocumentType,
    fileURL: normalizeFileURL(raw.fileURL ?? raw.fileUrl ?? raw.FileURL),
    fileSize: raw.fileSize ?? raw.FileSize ?? undefined,
    mimeType: raw.mimeType ?? raw.MimeType ?? undefined,
    version: raw.version ?? raw.Version ?? 1,
    isActive: raw.isActive ?? raw.IsActive ?? true,
    createdAt: raw.createdAt ?? raw.CreatedAt,
    updatedAt: raw.updatedAt ?? raw.UpdatedAt,
  };
}

export async function fetchPublicProgramFile(): Promise<ProgramFileDto | null> {
  try {
    const raw = await apiGet<any>("/api/public/program-file");
    return {
      id: raw.id ?? raw.ID,
      filename: raw.filename ?? raw.Filename,
      filePath: raw.file_path ?? raw.filePath ?? raw.FilePath ?? "",
      uploadedAt: raw.uploaded_at ?? raw.uploadedAt ?? raw.UploadedAt,
    };
  } catch (_) {
    return null;
  }
}

export async function fetchAdminDocumentTemplates(): Promise<DocumentTemplate[]> {
  const rows = await apiGet<any[]>("/api/admin/documents/templates");
  return rows.map(normalizeDocumentTemplate);
}

export function fetchPublicDocumentTemplates() {
  return apiGet<any[]>("/api/public/documents/templates").then((rows) =>
    rows.map(normalizeDocumentTemplate)
  );
}

export function downloadDocumentTemplate(fileURL: string, fileName: string) {
  return apiDownload(fileURL, fileName);
}

export function uploadSignedDocument(file: File, documentType: string, talkId?: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", documentType);
  if (talkId) {
    formData.append("talk_id", talkId);
  }
  return apiUpload<{ ok: boolean; url: string }>("/api/participant/documents/signed", formData);
}
