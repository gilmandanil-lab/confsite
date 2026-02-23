-- +goose Up
ALTER TABLE document_templates
DROP CONSTRAINT IF EXISTS document_templates_document_type_check;

ALTER TABLE document_templates
ADD CONSTRAINT document_templates_document_type_check
CHECK (document_type IN ('CONSENT_DATA_PROCESSING', 'CONSENT_DATA_TRANSFER', 'LICENSE_AGREEMENT', 'ABSTRACT_TEMPLATE'));

-- +goose Down
ALTER TABLE document_templates
DROP CONSTRAINT IF EXISTS document_templates_document_type_check;

ALTER TABLE document_templates
ADD CONSTRAINT document_templates_document_type_check
CHECK (document_type IN ('CONSENT_DATA_PROCESSING', 'CONSENT_DATA_TRANSFER', 'LICENSE_AGREEMENT'));
