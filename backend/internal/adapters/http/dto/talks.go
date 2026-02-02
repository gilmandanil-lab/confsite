package dto

import "github.com/google/uuid"

type TalkUpsertRequest struct {
	Title       string          `json:"title" binding:"required"`
	Affiliation string          `json:"affiliation" binding:"required"`
	Abstract    string          `json:"abstract" binding:"required"`
	Kind        string          `json:"kind" binding:"required"` // PLENARY/ORAL/POSTER
	SectionID   *uuid.UUID      `json:"sectionId"`
	Authors     []TalkAuthorDTO `json:"authors" binding:"required"`
}

type AdminUpdateTalkRequest struct {
	SectionID    *string `json:"sectionId"`
	ScheduleTime *string `json:"scheduleTime"`
}

type TalkAuthorDTO struct {
	FullName    string `json:"fullName" binding:"required"`
	Affiliation string `json:"affiliation" binding:"required"`
}
