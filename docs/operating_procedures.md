# Standard Operating Procedures (SOP): Employee Ingestion

## 1. Capture Process
1. Use the designated WhatsApp business line.
2. Ensure the form is on a flat surface with good lighting.
3. Capture the entire form clearly; avoid shadows or blur.
4. Send the image to the n8n WhatsApp Webhook.

## 2. Review Process
1. Open the [Staging Google Sheet](https://docs.google.com/spreadsheets/d/your-id-here).
2. Check the "Pending Approval" tab.
3. Verify that the computer-extracted data matches the handwritten image (link provided in the sheet).
4. Correct any minor OCR errors in the sheet.

## 3. Finalization
1. Once data is verified, change the "Status" column to **"Approved"**.
2. Approved records are stored in Google Sheets and synced with **Supabase**.
3. (Optional) If Horilla integration is enabled, the record will be pushed to Horilla.

## 4. Error Handling
- If a record fails validation, it will be marked as **"Failed"** in the sheet with an error message.
- Correct the error in the sheet and set status back to **"Re-validate"**.
