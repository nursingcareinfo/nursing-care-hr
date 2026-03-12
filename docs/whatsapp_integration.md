# WhatsApp AI Employee Onboarding System
## NursingCare.pk - 2000+ Employee Scale Solution

**Overview:** Complete WhatsApp-based recruitment system with AI-powered form filling, image capture, and automatic database entry.

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  WhatsApp       │────▶│  Typebot         │────▶│  n8n Workflow   │
│  (New Nurse)    │     │  (Chat Interface)│     │  (AI Processing)│
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                    ┌─────────────────────────────────────┼─────────────────────────────────────┐
                    │                                     │                                     │
              ┌─────▼─────┐                    ┌──────────▼────────┐                 ┌──────────▼────────┐
              │  Baserow  │                    │   Google Sheets   │                 │    Supabase       │
              │  (Primary)│                    │   (HR Approval)   │                 │    (Backup)       │
              └───────────┘                    └───────────────────┘                 └───────────────────┘
```

---

## Solution Components

### 1. WhatsApp Business API (Meta)

**Purpose:** Receive employee submissions via WhatsApp

**Setup Steps:**

#### A. Create Meta Business Account
1. Go to https://business.facebook.com
2. Create/ login to Facebook account
3. Complete business verification

#### B. Create WhatsApp App
1. Visit https://developers.facebook.com
2. Click **Create App** → Select **Business** type
3. Add **WhatsApp** product
4. Complete app setup

#### C. Get Credentials
Navigate to **WhatsApp → API Setup**:

| Credential | Purpose |
|------------|---------|
| **Phone Number ID** | Identifies WhatsApp number |
| **WhatsApp Business Account ID (WABA)** | Business identifier |
| **Access Token** | API authentication (generate permanent token) |

#### D. Generate Permanent Access Token
1. **Meta Business Settings** → **Users** → **System Users**
2. **Add** → Name: "n8n-integration" → Role: **Admin**
3. **Assign Assets** → Select your WhatsApp app → Grant **Full Control**
4. **Generate New Token**:
   - Permissions: `whatsapp_business_messaging`, `whatsapp_business_management`
   - Copy token immediately (won't show again)

**Cost for Pakistan:**
- **Free tier:** 1,000 service conversations/month
- **Paid:** ~$0.01-0.03 per conversation (user-initiated)
- **Estimated for 2000 employees:** $20-60/month

---

### 2. Typebot (Chat Interface)

**Purpose:** Visual chatbot builder for WhatsApp form

**Why Typebot:**
- Drag-and-drop form builder
- Built-in session management
- Rich media support (images, buttons)
- WhatsApp native integration
- Free self-hosted option

**Setup Steps:**

#### A. Deploy Typebot

```bash
# Create directory
mkdir -p /opt/typebot
cd /opt/typebot

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: "3.8"

services:
  typebot-builder:
    image: baptistearno/typebot-builder:latest
    container_name: typebot-builder
    ports:
      - "3001:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/typebot
      - NEXTAUTH_URL=http://localhost:3001
      - NEXTAUTH_SECRET=your-secret-key-change-this
      - ENCRYPTION_SECRET=your-encryption-secret
    volumes:
      - typebot_builder_data:/app/builder-data
    restart: unless-stopped

  typebot-viewer:
    image: baptistearno/typebot-viewer:latest
    container_name: typebot-viewer
    ports:
      - "3002:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/typebot
      - NEXTAUTH_URL=http://localhost:3001
      - NEXTAUTH_SECRET=your-secret-key-change-this
      - ENCRYPTION_SECRET=your-encryption-secret
    volumes:
      - typebot_viewer_data:/app/viewer-data
    restart: unless-stopped

  db:
    image: postgres:15
    container_name: typebot-db
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=typebot
    volumes:
      - typebot_db_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  typebot_builder_data:
  typebot_viewer_data:
  typebot_db_data:
EOF

# Start Typebot
docker-compose up -d
```

**Access:**
- Builder: http://localhost:3001 (create chatbots)
- Viewer: http://localhost:3002 (embed/test)

#### B. Create Employee Intake Chatbot

**Flow Design:**

```
Welcome Message
    ↓
[Buttons: Join as Nurse / Join as Attendant / Other Staff]
    ↓
Collect Personal Info:
  - Full Name
  - Father/Husband Name
  - CNIC (with validation)
  - Date of Birth
  - Gender
    ↓
Collect Contact Info:
  - Phone Number (auto from WhatsApp)
  - Alternative Contact
  - District (dropdown)
    ↓
Collect Professional Info:
  - Qualification
  - PNC License Number (for nurses)
  - Years of Experience
  - Previous Employer
    ↓
Upload Documents:
  - CNIC Photo (front)
  - CNIC Photo (back)
  - Profile Picture
  - Certificates (optional)
    ↓
Review & Confirm
    ↓
Submit → n8n Webhook
    ↓
Confirmation Message
```

**Typebot Configuration:**

1. **Create New Typebot** → "Employee Intake 2026"
2. **Add Blocks:**

```yaml
Welcome:
  type: text
  content: |
    👋 Welcome to NursingCare.pk Recruitment!
    
    I'll help you apply for a position.
    This will take 5-7 minutes.
    
    Ready to start?
  buttons: ["Start Application", "Learn More"]

Position Selection:
  type: buttons
  options:
    - "Registered Nurse (RN)"
    - "Nurse Assistant"
    - "Attendant / Caregiver"
    - "Other Staff"

Name Collection:
  type: input
  label: "What is your full name?"
  placeholder: "As shown on CNIC"

CNIC Input:
  type: input
  label: "Enter your CNIC number (without dashes)"
  validation: "^\d{13}$"
  error_message: "CNIC must be 13 digits (e.g., 4210112345671)"

# ... continue for all fields

Image Upload (CNIC Front):
  type: picture
  label: "Please upload a photo of your CNIC (front side)"
  accept: "image/*"

# ... more uploads

Review:
  type: text
  content: |
    Please review your information:
    
    Name: {{name}}
    CNIC: {{cnic}}
    Position: {{position}}
    District: {{district}}
    
    Is everything correct?
  buttons: ["Submit Application", "Edit"]

Confirmation:
  type: text
  content: |
    ✅ Application Submitted!
    
    Your Assigned ID: {{assigned_id}}
    
    Our HR team will review your application within 24-48 hours.
    
    You'll receive a WhatsApp message with:
    - Interview schedule
    - Document verification
    - Next steps
    
    Thank you for applying to NursingCare.pk!
```

3. **Connect WhatsApp:**
   - Go to **Settings** → **WhatsApp**
   - Enter Meta credentials (from Step 1)
   - Click **Connect**

4. **Add Webhook Integration:**
   - Add **Webhook** block at end
   - URL: `http://your-n8n-url/webhook/typebot-employee-intake`
   - Method: POST
   - Enable "Wait for response"

---

### 3. n8n AI Processing Workflow

**Purpose:** Process submissions, extract data from images, validate, and store

**Workflow Nodes:**

```json
{
  "name": "WhatsApp Employee Intake Processing",
  "nodes": [
    {
      "name": "Typebot Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "typebot-employee-intake",
        "responseMode": "responseNode"
      }
    },
    {
      "name": "Generate Assigned ID",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "const item = items[0].json;\n\n// Generate unique ID based on district + timestamp\nconst district = item.district || 'UNK';\nconst prefix = district.substring(0, 3).toUpperCase();\nconst timestamp = Date.now().toString(36).toUpperCase();\nconst assignedId = `NC-${prefix}-${timestamp}`;\n\nreturn [{ json: { ...item, assigned_id: assignedId, status: 'Pending Review', submitted_at: new Date().toISOString() } }];"
      }
    },
    {
      "name": "Extract CNIC Data (AI Vision)",
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "parameters": {
        "operation": "image",
        "model": "gpt-4o-mini",
        "prompt": "=Analyze this CNIC image and extract: CNIC number, Name, Father's Name, Date of Birth, Address. Return as JSON.",
        "imageProperty": "cnic_front_image_url"
      }
    },
    {
      "name": "Validate & Merge Data",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "const item = items[0].json;\nconst ocrData = items[1].json;\n\n// Merge AI-extracted data with form data\nconst validated = {\n  ...item,\n  cnic_verified: ocrData.cnic_number?.replace(/[- ]/g, '') === item.cnic,\n  name_verified: ocrData.name === item.name,\n  ocr_extracted: ocrData,\n  validation_status: (ocrData.cnic_number && item.cnic) ? 'verified' : 'manual_review'\n};\n\nreturn [{ json: validated }];"
      }
    },
    {
      "name": "Create in Baserow",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "={{ $env.BASEROW_URL }}/api/database/rows/table/{{ $env.BASEROW_TABLE_ID }}/",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [{
            "name": "Authorization",
            "value": "Token {{ $env.BASEROW_TOKEN }}"
          }]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ $json }}"
      }
    },
    {
      "name": "Backup to Supabase",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "={{ $env.SUPABASE_URL }}/rest/v1/staff",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [\n            { "name": "apikey", "value": "{{ $env.SUPABASE_SERVICE_KEY }}" },\n            { "name": "Authorization", "value": "Bearer {{ $env.SUPABASE_SERVICE_KEY }}" },\n            { "name": "Prefer", "value": "return=representation" }\n          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ $json }}"
      }
    },
    {
      "name": "Upload Images to Storage",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "={{ $env.SUPABASE_URL }}/storage/v1/object/employee-documents/{{ $json.assigned_id }}/{{ $item.json.filename }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [\n            { "name": "apikey", "value": "{{ $env.SUPABASE_SERVICE_KEY }}" },\n            { "name": "Authorization", "value": "Bearer {{ $env.SUPABASE_SERVICE_KEY }}" }\n          ]
        },
        "sendBody": true,
        "bodyContentType": "binary",
        "binaryPropertyName": "={{ $item.binary.image }}"
      }
    },
    {
      "name": "Send WhatsApp Confirmation",
      "type": "n8n-nodes-base.whatsapp",
      "parameters": {
        "operation": "sendMessage",
        "recipientPhone": "={{ $json.whatsapp_number }}",
        "textBody": "=✅ Application Received!\n\nYour Assigned ID: {{ $json.assigned_id }}\n\nHR will contact you within 24-48 hours.\n\nThank you for applying to NursingCare.pk!"
      }
    },
    {
      "name": "Notify HR Team",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "to": "hr@nursingcare.pk",
        "subject": "=New Employee Application - {{ $json.assigned_id }}",
        "emailType": "html",
        "html": "=<h2>New Employee Application</h2><p><strong>ID:</strong> {{ $json.assigned_id }}</p><p><strong>Name:</strong> {{ $json.name }}</p><p><strong>Position:</strong> {{ $json.position }}</p><p><strong>CNIC Verified:</strong> {{ $json.cnic_verified ? '✅ Yes' : '⚠️ Manual Review Needed' }}</p><p><strong>Documents:</strong> {{ $json.document_count }} uploaded</p><p>Review in Baserow: <a href='{{ $env.BASEROW_URL }}'>{{ $env.BASEROW_URL }}</a></p>"
      }
    },
    {
      "name": "Respond to Typebot",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json",
        "responseBody": "={ \"success\": true, \"assigned_id\": \"{{ $json.assigned_id }}\", \"message\": \"Application submitted successfully\" }"
      }
    }
  ]
}
```

---

## Complete Setup Script

```bash
#!/bin/bash
# Complete WhatsApp + Baserow + n8n Setup for NursingCare.pk

set -e

echo "🚀 Setting up complete HR automation stack..."
echo "=============================================="

# 1. Deploy Baserow
echo ""
echo "📊 Step 1: Deploying Baserow..."
mkdir -p /opt/baserow
cd /opt/baserow

cat > docker-compose.yml << 'EOF'
version: "3.8"
services:
  baserow:
    image: baserow/baserow:latest
    container_name: baserow
    environment:
      BASEROW_PUBLIC_URL: http://localhost
      BASEROW_ADMIN_EMAIL: admin@nursingcare.pk
      BASEROW_ADMIN_PASSWORD: ChangeMe123!
    volumes:
      - baserow_data:/baserow/data
    ports:
      - "80:80"
      - "443:443"
    restart: unless-stopped
volumes:
  baserow_data:
EOF

docker-compose up -d
echo "✅ Baserow deployed at http://localhost"

# 2. Deploy Typebot
echo ""
echo "💬 Step 2: Deploying Typebot..."
mkdir -p /opt/typebot
cd /opt/typebot

cat > docker-compose.yml << 'EOF'
version: "3.8"
services:
  typebot-builder:
    image: baptistearno/typebot-builder:latest
    container_name: typebot-builder
    ports:
      - "3001:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/typebot
      - NEXTAUTH_URL=http://localhost:3001
      - NEXTAUTH_SECRET=change-this-secret-key
      - ENCRYPTION_SECRET=change-this-encryption-secret
    volumes:
      - typebot_builder_data:/app/builder-data
    restart: unless-stopped
  typebot-viewer:
    image: baptistearno/typebot-viewer:latest
    container_name: typebot-viewer
    ports:
      - "3002:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/typebot
      - NEXTAUTH_URL=http://localhost:3001
      - NEXTAUTH_SECRET=change-this-secret-key
      - ENCRYPTION_SECRET=change-this-encryption-secret
    volumes:
      - typebot_viewer_data:/app/viewer-data
    restart: unless-stopped
  db:
    image: postgres:15
    container_name: typebot-db
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=typebot
    volumes:
      - typebot_db_data:/var/lib/postgresql/data
    restart: unless-stopped
volumes:
  typebot_builder_data:
  typebot_viewer_data:
  typebot_db_data:
EOF

docker-compose up -d
echo "✅ Typebot deployed at http://localhost:3001 (builder)"

# 3. n8n (if not already running)
echo ""
echo "⚙️  Step 3: Checking n8n..."
if ! docker ps | grep -q n8n; then
  mkdir -p /opt/n8n
  cd /opt/n8n
  
  cat > docker-compose.yml << 'EOF'
version: "3.8"
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=http://localhost:5678
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=ChangeMe123!
      - WEBHOOK_URL=http://localhost:5678/
    volumes:
      - n8n_data:/home/node/.n8n
    restart: unless-stopped
volumes:
  n8n_data:
EOF

  docker-compose up -d
  echo "✅ n8n deployed at http://localhost:5678"
else
  echo "✅ n8n already running"
fi

# Summary
echo ""
echo "=============================================="
echo "🎉 Complete Stack Deployed!"
echo "=============================================="
echo ""
echo "Services:"
echo "  📊 Baserow:   http://localhost (port 80)"
echo "  💬 Typebot:   http://localhost:3001 (builder)"
echo "  ⚙️  n8n:      http://localhost:5678"
echo ""
echo "Next Steps:"
echo "  1. Configure WhatsApp Business API (Meta Developers)"
echo "  2. Create employee intake form in Typebot"
echo "  3. Import n8n workflow"
echo "  4. Test end-to-end"
echo ""
echo "Documentation: docs/whatsapp_integration.md"
```

---

## Cost Breakdown (2000 Employees/Month)

| Component | Monthly Cost | Annual |
|-----------|-------------|--------|
| **WhatsApp API** | $40-60 (2000 conversations) | $480-720 |
| **Server (VPS)** | $20-40 (4GB RAM, 2 CPU) | $240-480 |
| **OpenAI API** | $10-20 (CNIC verification) | $120-240 |
| **Domain/SSL** | $1 | $12 |
| **Total** | **$71-121/month** | **$852-1,452/year** |

**vs Traditional HR:**
- HR Admin salary: $300-500/month
- **Savings:** $2,400-4,800/year

---

## Implementation Timeline

| Week | Tasks |
|------|-------|
| **Week 1** | Deploy stack, configure WhatsApp API |
| **Week 2** | Build Typebot form, test flow |
| **Week 3** | Create n8n workflow, AI integration |
| **Week 4** | Pilot with 50 employees, refine |
| **Week 5** | Full launch, marketing |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| **Application Completion Rate** | >80% |
| **CNIC Auto-Verification** | >90% |
| **Time to Process Application** | <2 minutes |
| **HR Review Time** | <24 hours |
| **Cost per Hire** | <$0.50 |

---

**Ready to deploy?** Run the setup script and follow the configuration guide!
