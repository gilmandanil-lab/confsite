package dto

type SetUserStatusRequest struct {
	Status string `json:"status" binding:"required"` // WAITING/APPROVED/REJECTED
}

type SetTalkStatusRequest struct {
	Status string `json:"status" binding:"required"` // WAITING/APPROVED/REJECTED
}

type CreateSectionRequest struct {
	TitleRu   string `json:"titleRu" binding:"required"`
	TitleEn   string `json:"titleEn" binding:"required"`
	SortOrder int32  `json:"sortOrder"`
}

type SetSectionResponsiblesRequest struct {
	Emails []string `json:"emails"`
}

type NewsUpsertRequest struct {
	TitleRu string `json:"titleRu" binding:"required"`
	BodyRu  string `json:"bodyRu" binding:"required"`
	TitleEn string `json:"titleEn" binding:"required"`
	BodyEn  string `json:"bodyEn" binding:"required"`
	Pinned  bool   `json:"pinned"`
}

type PageUpsertRequest struct {
	TitleRu string `json:"titleRu" binding:"required"`
	BodyRu  string `json:"bodyRu" binding:"required"`
	TitleEn string `json:"titleEn" binding:"required"`
	BodyEn  string `json:"bodyEn" binding:"required"`
}
