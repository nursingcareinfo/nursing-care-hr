# HR Data Protection & Security Policy

## 1. Data Classification
All employee data captured via this system is classified as **RESTRICTED**.

## 2. Ingestion Security (WhatsApp)
- Images sent via WhatsApp are encrypted in-transit.
- Images must be deleted from the WhatsApp gateway server immediately after processing by n8n.
- n8n execution data (binaries) should be set to auto-prune every 24 hours.

## 3. Storage Security (Google Sheets)
- Access to the staging Google Sheet must be restricted to the HR Manager and designated personnel.
- Multi-Factor Authentication (MFA) must be enabled on all accounts with access.
- Avoid storing clear-text sensitive IDs (like full Tax IDs) in Google Sheets if possible; use masking or temporary storage.

## 4. Production Security (Horilla)
- Use API Keys with the minimum necessary scope (Least Privilege).
- Rotate API keys every 90 days.

## 5. Compliance
This system is designed to comply with local data protection regulations (e.g., GDPR/CCPA equivalents) by:
- Providing data minimization (only collecting what's needed).
- Ensuring data accuracy through validation.
- Allowing for the "Right to Erasure" via Horilla and Google Sheets manual deletions.
