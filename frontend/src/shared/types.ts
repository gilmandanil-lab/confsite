export type UserStatus = "WAITING" | "APPROVED" | "REJECTED";
export type UserRole = "USER" | "PARTICIPANT" | "ADMIN" | "SECTION_ADMIN";

export interface MeResponse {
  id: string;
  email: string;
  status: UserStatus;
  roles: UserRole[];
}

export interface PublicPage {
  title: string;
  body: string;
}

export interface PublicNewsItem {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  publishedAt: string;
}

export interface PublicParticipant {
  fullName: string;
  affiliation: string;
  city: string;
}

export interface PublicSection {
  id: string;
  title: string;
  titleRu: string;
  titleEn: string;
  sortOrder?: number;
}

export interface Material {
  id: string;
  title: string;
  titleRu: string;
  titleEn: string;
  type?: string;
  descriptionRu?: string;
  descriptionEn?: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileDto {
  userID?: string;
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
}

export interface TalkAuthor {
  fullName: string;
  affiliation: string;
}

export interface TalkDto {
  id: string;
  title: string;
  affiliation: string;
  abstract: string;
  kind: "PLENARY" | "ORAL" | "POSTER";
  status?: UserStatus;
  sectionId?: string | null;
  fileUrl?: string | null;
  authors: TalkAuthor[];
}

export interface SectionDto {
  id: string;
  titleRu: string;
  titleEn: string;
  sortOrder: number;
}

export interface NewsDto {
  id: string;
  titleRu: string;
  titleEn: string;
  bodyRu: string;
  bodyEn: string;
  pinned: boolean;
  publishedAt: string;
}

export interface PageDto {
  slug: string;
  titleRu: string;
  bodyRu: string;
  titleEn: string;
  bodyEn: string;
}

export interface AdminUserDto {
  id: string;
  email: string;
  status: UserStatus;
  roles: string[];
  surname?: string;
  name?: string;
  patronymic?: string;
  birthDate?: string;
  city?: string;
  academicDegree?: string | null;
  affiliation?: string;
  position?: string;
  phone?: string;
  postalAddress?: string;
  consentAccepted?: boolean;
  consentDataProcessingFile?: string;
  consentDataTransferFile?: string;
}

export interface ConsentFile {
  id: string;
  userId: string;
  consentType: "DATA_PROCESSING" | "DATA_TRANSFER";
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  uploadedAt: string;
}

export interface AdminTalkRow {
  id: string;
  title: string;
  kind: string;
  status: UserStatus;
  sectionId?: string | null;
  sectionTitleRu?: string | null;
  sectionTitleEn?: string | null;
  fileUrl?: string | null;
  speakerFullName: string;
  speakerCity: string;
  speakerAffiliation: string;
  authorsJSON: string;
  abstract: string;
  scheduleTime?: string | null;
}

export interface SectionResponsiblesRow {
  sectionId: string;
  sectionTitleRu: string;
  sectionTitleEn: string;
  emails: string[];
}

export interface AuditLogEntry {
  id: string;
  actorUserID?: string | null;
  action: string;
  entity: string;
  entityID?: string | null;
  createdAt: string;
}
