package policy

import "github.com/google/uuid"

// RoleAssignment view for RBAC checks without importing domain to avoid cycles in some setups.
type RoleAssignment struct {
	Role      string
	SectionID *uuid.UUID
}

func HasRole(roles []RoleAssignment, need string) bool {
	for _, r := range roles {
		if r.Role == need {
			return true
		}
	}
	return false
}

func IsAdmin(roles []RoleAssignment) bool {
	return HasRole(roles, "ADMIN")
}

func IsSectionAdminOf(roles []RoleAssignment, sectionID uuid.UUID) bool {
	for _, r := range roles {
		if r.Role == "SECTION_ADMIN" && r.SectionID != nil && *r.SectionID == sectionID {
			return true
		}
	}
	return false
}
