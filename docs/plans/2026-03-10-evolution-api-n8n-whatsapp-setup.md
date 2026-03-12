# Evolution API + n8n WhatsApp Automation Setup

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up open-source Evolution API with Docker, connect to n8n, and create WhatsApp automation workflows for HR management (shift notifications, attendance, leave requests).

**Architecture:** Evolution API runs as Docker container exposing REST endpoints. n8n communicates with Evolution API to send/receive WhatsApp messages. Staff interact via WhatsApp commands.

**Tech Stack:** 
- Evolution API (Docker)
- n8n (existing, Docker)
- Supabase (existing database)
- WhatsApp (via Evolution API)

---

## Prerequisites

- Docker and Docker Compose installed
- n8n running at http://localhost:5678
- WhatsApp Business account (for scanning QR)

---

### Task 1: Install Evolution API via Docker

**Files:**
- Create: `docker-compose.evolution-api.yml`
- Create: `evolution-api/.env`

**Step 1: Create docker-compose file**

```yaml
version: '3.8'

services:
  evolution-api:
    image: atendai/evolution-api:latest
    container_name: evolution-api
    ports:
      - "8080:8080"
    volumes:
      - evolution_data:/evolution/app
    environment:
      - SERVER_TYPE=http
      - SERVER_PORT=8080
      - AUTHENTICATION_API_KEY=your_secure_api_key_here
      - DATABASE_ENABLED=true
      - DATABASE_PROVIDER=sqlite
      - DATABASE_SAVE_DATA_INSTANCE=true
      - DATABASE_SAVE_DATA_NEW_MESSAGE=true
      - WEBHOOK_GLOBAL_ENABLED=false
      - CONFIG_SESSION_PHONE_CLIENT=NursingCare
    restart: unless-stopped
    networks:
      - evolution-network

volumes:
  evolution_data:

networks:
  evolution-network:
    driver: bridge
```

**Step 2: Create environment file**

```
# Evolution API Configuration
SERVER_TYPE=http
SERVER_PORT=8080
AUTHENTICATION_API_KEY=evolution_nursingcare_2026
DATABASE_ENABLED=true
DATABASE_PROVIDER=sqlite
```

**Step 3: Start Evolution API**

Run: `docker-compose -f docker-compose.evolution-api.yml up -d`

Expected: Container running on port 8080

**Step 4: Verify API is running**

Run: `curl http://localhost:8080/health`

Expected: Returns health status JSON

---

### Task 2: Configure Evolution API Instance

**Files:**
- Modify: `evolution-api/.env`

**Step 1: Get API documentation**

Run: `curl -X GET http://localhost:8080/instance/connect -H "apikey: evolution_nursingcare_2026"`

Expected: Returns instance connection info with QR code URL

**Step 2: Check instance status**

Run: `curl -X GET http://localhost:8080/instance/connectionState/NursingCare -H "apikey: evolution_nursingcare_2026"`

Expected: Shows connection state (need to scan QR)

**Step 3: Scan QR Code**

- Open http://localhost:8080 instance/qrcode/page/NursingCare in browser
- Scan QR with WhatsApp Business phone
- Verify connection shows "open" state

---

### Task 3: Install n8n Evolution API Node

**Files:**
- Modify: `n8n/docker-compose.yml` (if exists)

**Step 1: Check n8n version**

Run: `curl http://localhost:5678`

Expected: n8n UI loads

**Step 2: Install Evolution node (via n8n UI)**

- Open n8n at http://localhost:5678
- Go to Settings > Community Nodes
- Install: `n8n-nodes-evolution-api`

---

### Task 4: Create n8n Workflow - Send Message

**Files:**
- Create: `n8n/workflows/whatsapp-send-message.json`

**Step 1: Create basic HTTP Request node**

```json
{
  "name": "WhatsApp Send Message",
  "nodes": [
    {
      "parameters": {
        "method": "POST",
        "url": "http://evolution-api:8080/message/sendText/NursingCare",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "apikey", "value": "evolution_nursingcare_2026" }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "number", "value": "{{ $json.phone }}" },
            { "name": "text", "value": "{{ $json.message }}" }
          ]
        }
      },
      "id": "send-message",
      "name": "Send WhatsApp",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [500, 300]
    }
  ]
}
```

**Step 2: Test sending a message**

Run workflow with test data:
```json
{
  "phone": "+923001234567",
  "message": "Test message from n8n!"
}
```

Expected: Message delivered to WhatsApp

---

### Task 5: Create n8n Workflow - Receive Message (Webhook)

**Files:**
- Create: `n8n/workflows/whatsapp-receive-message.json`

**Step 1: Create webhook-triggered workflow**

```json
{
  "name": "WhatsApp Receive",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "whatsapp-webhook",
        "responseMode": "onComplete"
      },
      "id": "webhook",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "jsCode": "const body = $input.first().json;\n\n// Extract message\nconst message = {\n  from: body.key.remoteJid,\n  message: body.message?.conversation || body.message?.extendedTextMessage?.text,\n  timestamp: body.messageTimestamp\n};\n\nreturn message;"
      },
      "id": "process",
      "name": "Process Message",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [500, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "{\"status\": \"received\"}"
      },
      "id": "respond",
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [750, 300]
    }
  ],
  "connections": {
    "Webhook": { "main": [[{ "node": "Process Message", "type": "main", "index": 0 }]] },
    "Process Message": { "main": [[{ "node": "Respond", "type": "main", "index": 0 }]] }
  }
}
```

**Step 2: Configure Evolution API webhooks**

Run: `curl -X PUT http://localhost:8080/webhook/update/NursingCare \
  -H "apikey: evolution_nursingcare_2026" \
  -H "Content-Type: application/json" \
  -d '{"url": "http://host.docker.internal:5678/webhook/whatsapp-webhook", "enabled": true, "events": ["messages.upsert"]}'`

**Step 3: Test incoming message**

Send a message from WhatsApp to the connected number.

Expected: Webhook triggers n8n workflow

---

### Task 6: Create HR Automation - Staff Commands

**Files:**
- Create: `n8n/workflows/whatsapp-hr-automation.json`

**Step 1: Create command router workflow**

The workflow processes these commands:
- `IN` - Check in
- `OUT` - Check out  
- `LEAVE` - Request leave
- `SHIFT` - View shift info

**Step 2: Implement command processing**

```javascript
// Function node to route commands
const message = $input.first().json.message.toUpperCase().trim();
const from = $input.first().json.from;

let response = '';

switch(message) {
  case 'HI':
  case 'HELLO':
    response = 'Welcome to NursingCare.pk! 👋\n\nSend:\n- IN : Check in\n- OUT : Check out\n- LEAVE : Request leave\n- SHIFT : View shift info';
    break;
  case 'IN':
    // Save check-in to database
    response = '✅ Check-in recorded!\nHave a great shift!';
    break;
  case 'OUT':
    response = '✅ Check-out recorded!\nThank you for your work today!';
    break;
  case 'LEAVE':
    response = '📝 Leave Request\n\nPlease send:\nLEAVE [type] [dates] [reason]\n\nExample: LEAVE sick 15-03-2026 fever';
    break;
  case 'SHIFT':
    response = '📅 Shift Info\n\nDay: 08:00 - 20:00\nNight: 20:00 - 08:00';
    break;
  default:
    response = '❓ Unknown command.\n\nSend HI for help.';
}

return {
  from: from,
  message: response
};
```

**Step 3: Add send response node**

- Connect command processor to HTTP Request node (send back to Evolution API)

**Step 4: Test the automation**

Send `HI` from WhatsApp.

Expected: Automated response with help menu

---

### Task 7: Create Database Tables for WhatsApp

**Files:**
- Create: `supabase/migrations/20260310000000_create_whatsapp_tables.sql`

**Step 1: Create tables**

```sql
-- WhatsApp contacts (staff who have messaged)
CREATE TABLE whatsapp_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  staff_id UUID REFERENCES staff(id),
  name VARCHAR(100),
  first_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp message log
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_phone VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL, -- 'inbound' or 'outbound'
  message TEXT NOT NULL,
  command VARCHAR(20),
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance log
CREATE TABLE attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL,
  staff_phone VARCHAR(20) NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  shift_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave requests
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL,
  staff_phone VARCHAR(20) NOT NULL,
  leave_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Step 2: Run migration**

Run: Supabase dashboard or CLI to execute migration

---

### Task 8: Connect to Supabase in n8n

**Files:**
- Modify: `n8n/.env`

**Step 1: Add Supabase credentials to n8n**

- Open n8n > Settings > Credentials
- Add new credential type: "HTTP Header Auth"
- Name: `supabase-api`
- Headers:
  - `apikey`: Your Supabase service role key
  - `Authorization`: `Bearer YourSupabaseServiceKey`

---

### Task 9: Full Attendance Check-in Workflow

**Files:**
- Create: `n8n/workflows/whatsapp-attendance.json`

**Step 1: Create workflow**

1. **Webhook trigger** - receives message
2. **IF** command = "IN"
   - **Supabase** - Insert attendance_log (check_in = now)
   - **HTTP** - Send confirmation message
3. **IF** command = "OUT"
   - **Supabase** - Update attendance_log (check_out = now)
   - **HTTP** - Send confirmation message

**Step 2: Test check-in**

Send `IN` from WhatsApp.

Expected: 
- Record saved in attendance_logs
- Confirmation message sent

---

## Verification Commands

After each task, verify:

1. Evolution API running: `docker ps | grep evolution-api`
2. API health: `curl http://localhost:8080/health`
3. Instance connected: Check WhatsApp shows "Connected" in Evolution API dashboard
4. n8n workflow active: Check workflow is "Activated" in n8n
5. Test message: Send WhatsApp message and verify response

---

## Plan Complete

**Two execution options:**

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
