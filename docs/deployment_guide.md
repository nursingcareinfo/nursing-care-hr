# Step-by-Step Deployment Guide: HR Management System

This guide will walk you through setting up the entire automated employee data system from scratch.

## Step 1: Prepare the Google Sheets "Backend"
1.  **Create a New Sheet**: Open Google Sheets and create a new, empty spreadsheet.
2.  **Open Apps Script**: Click on **Extensions** > **Apps Script**.
3.  **Add the Script**: Delete any existing code and paste the code from [this guide](file:///home/archbtw/dev/HR_manager_home_nursing_care/scripts/google_apps_script.js) (I am providing a separate copy below for convenience).
4.  **Initial Setup**: In the Script Editor, select `setupStaffSheet` from the dropdown and click **Run**. This will create your headers.
5.  **Deploy as Web App**:
    - Click **Deploy** > **New Deployment**.
    - Select **Type**: Web App.
    - **Execute As**: "Me".
    - **Who has access**: "Anyone".
6.  **Save the URL**: Copy the **Web App URL** provided at the end. You will need this for the next steps.

---

## Step 2: Push the Master Data (Initial Migration)
Now that your sheet is ready, let's upload the 282 staff members.
1.  **Set Environment Variable**: In your terminal, run:
    ```bash
    export GOOGLE_SHEETS_WEB_APP_URL="PASTE_YOUR_URL_HERE"
    ```
2.  **Run the Export Script**:
    ```bash
    cd /home/archbtw/dev/HR_manager_home_nursing_care
    node scripts/export_to_sheets.js
    ```
    *This will parse the [master_staff_report.md](file:///home/archbtw/dev/HR_manager_home_nursing_care/data/master_report/master_staff_report.md) and upload it to your sheet.*

---

## Step 3: Configure n8n Automation
This handles incoming WhatsApp images for new employees.
1.  **Open n8n**: Log in to your n8n instance.
2.  **Import Workflow**: Click **Workflows** > **Import from File...** and select [hr_ingestion_workflow.json](file:///home/archbtw/dev/HR_manager_home_nursing_care/workflows/hr_ingestion_workflow.json).
3.  **Update Endpoint**: Open the "Google Sheets Staging" node and paste your Web App URL.
4.  **Configure WhatsApp**: (requires a gateway like Evolution API). Connect your gateway to the n8n Webhook node.

---

## Step 4: Final Link to Horilla HRMS (Optional)
*Note: This step is currently skipped as per user request. The system is fully functional using Google Sheets and Supabase.*
1.  **API Credentials**: Get your API Key from the Horilla dashboard.
2.  **Update Integration Script**:
    - Open [horilla_integration.js](file:///home/archbtw/dev/HR_manager_home_nursing_care/scripts/horilla_integration.js).
    - Ensure your `HORILLA_BASE_URL` and `API_KEY` are configured.
3.  **Trigger Push**: In your Google Sheet, setting the status to "Approved" will trigger the final push via n8n if the corresponding workflow is configured.

---

## Summary of Files
- **Database**: [master_staff_report.md](file:///home/archbtw/dev/HR_manager_home_nursing_care/data/master_report/master_staff_report.md)
- **Export Tool**: [export_to_sheets.js](file:///home/archbtw/dev/HR_manager_home_nursing_care/scripts/export_to_sheets.js)
- **n8n Workflow**: [hr_ingestion_workflow.json](file:///home/archbtw/dev/HR_manager_home_nursing_care/workflows/hr_ingestion_workflow.json)
- **SOP Guide**: [operating_procedures.md](file:///home/archbtw/dev/HR_manager_home_nursing_care/docs/operating_procedures.md)
