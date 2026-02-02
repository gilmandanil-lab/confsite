package dto

type RegistrationSubmitRequest struct {
	Surname              string  `json:"surname" binding:"required"`
	Name                 string  `json:"name" binding:"required"`
	Patronymic           string  `json:"patronymic" binding:"required"`
	BirthDate            string  `json:"birthDate" binding:"required"` // YYYY-MM-DD
	City                 string  `json:"city" binding:"required"`
	AcademicDegree       *string `json:"academicDegree"`
	Affiliation          string  `json:"affiliation" binding:"required"`
	Position             string  `json:"position" binding:"required"`
	Phone                string  `json:"phone" binding:"required"`
	PostalAddress        string  `json:"postalAddress" binding:"required"`
	ConsentDataProcessing bool    `json:"consentDataProcessing" binding:"required"`
	ConsentDataTransfer   bool    `json:"consentDataTransfer" binding:"required"`}