# HR Technology Stack Recommendation
## NursingCare.pk - Strategic Analysis & Roadmap

**Prepared:** March 2, 2026  
**Role:** HR Manager Perspective  
**Current State:** 286 employees, Google Sheets + Supabase

---

## Executive Summary

After extensive research of 20+ HR platforms, open-source solutions, and automation tools, here's the **recommended technology roadmap** for scaling NursingCare.pk's HR operations:

### Current Architecture Assessment

| Component | Current | Status |
|-----------|---------|--------|
| **Data Entry** | WhatsApp Forms + n8n OCR | ✅ Working |
| **Primary Storage** | Google Sheets | ✅ Working |
| **Backup/API** | Supabase PostgreSQL | ✅ Working |
| **Export Scripts** | Node.js custom | ✅ Working |
| **HRMS** | None (manual) | ⚠️ Missing |

**Gaps Identified:**
- No employee self-service portal
- Manual approval workflow
- No attendance/leave tracking
- No performance management
- No payroll integration
- Limited reporting/analytics

---

## Recommended Solutions by Company Size

### For 50-500 Employees (Your Growth Target)

| Priority | Solution | Cost | Implementation |
|----------|----------|------|----------------|
| **1** | Baserow (replace Sheets) | Free (self-hosted) | 1-2 days |
| **2** | Frappe HR (full HRMS) | Free (open-source) | 1-2 weeks |
| **3** | n8n + AI Agents | $20-50/mo | 3-5 days |
| **4** | Softr Portal (employee self-service) | Free-49/mo | 2-3 days |

---

## Option 1: **Baserow + n8n Automation** (RECOMMENDED - Start Here)

### Why Baserow Over Google Sheets?

| Feature | Baserow | Google Sheets |
|---------|---------|---------------|
| **Rows** | Unlimited (self-hosted) | 10M cells total |
| **API** | REST + GraphQL | Apps Script only |
| **Permissions** | Row-level access control | Sheet-level only |
| **Forms** | Built-in form builder | Google Forms (separate) |
| **Audit Log** | Full change history | Limited version history |
| **Self-Host** | ✅ Yes (Docker) | ❌ No |
| **Cost at Scale** | Free | $6-12/user/mo |

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  WhatsApp Form  │────▶│   n8n Workflow   │────▶│    Baserow      │
│  (New Hire)     │     │  (OCR + Validate)│     │  (Employee DB)  │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
┌─────────────────┐     ┌──────────────────┐     ┌────────▼────────┐
│  Employee       │◀────│   Softr Portal   │◀────│   Baserow API   │
│  Self-Service   │     │   (Web App)      │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Setup Commands

```bash
# Deploy Baserow (Docker)
docker run -d \
  --name baserow \
  -v baserow_data:/baserow/data \
  -e BASEROW_PUBLIC_URL=http://your-domain.com \
  -p 80:80 -p 443:443 \
  baserow/baserow:latest

# Import your Supabase data
# Baserow has CSV import + REST API
```

### Benefits for NursingCare.pk

✅ **Unlimited employee records** (you're at 286, will grow to 1000+)  
✅ **Built-in forms** for new hire submissions  
✅ **Row-level permissions** (HR sees salaries, nurses see only their data)  
✅ **API-first** (easier integration with Horilla, payroll)  
✅ **Audit trails** (compliance for healthcare)  
✅ **Free self-hosted** (no per-user licensing)

---

## Option 2: **Frappe HR** (Full HRMS - Phase 2)

### Overview

**Frappe HR** is a complete open-source HRMS built on the Frappe Framework (Python + JavaScript).

### Features

| Module | Capabilities |
|--------|-------------|
| **Employee Management** | Lifecycle tracking, documents, transfers |
| **Attendance** | Biometric integration, shift management, geo-fencing |
| **Leave Management** | Custom policies, approvals, encashment |
| **Payroll** | Salary structures, tax calculations, payslips |
| **Recruitment** | Job postings, applicant tracking, interviews |
| **Performance** | Appraisals, KRA tracking, feedback |
| **Training** | Events, feedback, certification tracking |
| **Healthcare-Specific** | Shift scheduling, credential tracking, compliance |

### Architecture

```
┌─────────────────┐
│  Frappe HR      │
│  (Full HRMS)    │
├─────────────────┤
│ • Employees     │
│ • Attendance    │
│ • Leave         │
│ • Payroll       │
│ • Recruitment   │
│ • Performance   │
│ • Shift Mgmt    │
└────────┬────────┘
         │
    ┌────▼────┐
    │ MariaDB │
    │ (Data)  │
    └─────────┘
```

### Setup

```bash
# Docker deployment
docker run -d \
  --name frappe-hr \
  -p 8080:8080 \
  frappe/hrms:latest

# Or use Frappe Cloud (managed)
# https://frappecloud.com/marketplace/apps/hrms
```

### Pros

✅ **Complete HRMS** (no need for multiple tools)  
✅ **Healthcare-specific** features (shift management, credential tracking)  
✅ **Open-source** (no vendor lock-in)  
✅ **Active community** (regular updates)  
✅ **Built-in reporting** (compliance, analytics)  
✅ **Mobile app** (employee self-service)

### Cons

❌ **Heavier** than your current setup (learning curve)  
❌ **Python/MariaDB** stack (different from Supabase/Postgres)  
❌ **Overkill** for <100 employees  
❌ **Migration effort** (need to move from Supabase)

### Best For

**Phase 2 implementation** when you reach 500+ employees and need:
- Payroll automation
- Attendance tracking
- Performance management
- Compliance reporting

---

## Option 3: **Hybrid Approach** (BEST FOR NOW)

### Architecture

```
Current System (Keep)          Enhanced With
────────────────────           ──────────────
Google Sheets (Approval)  ────▶ Baserow Forms (Entry)
Supabase (Backup/API)     ────▶ Baserow (Primary DB)
n8n (Automation)          ────▶ AI Agents (Validation)
Manual Portal             ────▶ Softr (Self-Service)
```

### Implementation Roadmap

#### Phase 1: Immediate (Week 1-2)
- [ ] Deploy Baserow (self-hosted on your server)
- [ ] Create Employee table schema (match current Supabase)
- [ ] Build intake form (replace WhatsApp OCR)
- [ ] Migrate 286 records from Supabase → Baserow
- [ ] Update n8n workflow to write to Baserow API

#### Phase 2: Short-term (Week 3-4)
- [ ] Build Softr portal for employee self-service
- [ ] Add document upload (CNIC, certificates)
- [ ] Implement approval workflow in Baserow
- [ ] Add automated email/SMS notifications

#### Phase 3: Medium-term (Month 2-3)
- [ ] Add attendance tracking (geo-fencing for home nurses)
- [ ] Integrate with Horilla HRMS (if keeping)
- [ ] Build shift scheduling module
- [ ] Add compliance reporting (PNC license tracking)

#### Phase 4: Long-term (Month 6+)
- [ ] Evaluate Frappe HR migration
- [ ] Add payroll integration
- [ ] Performance management module
- [ ] Mobile app for nurses

---

## Cost Comparison (Annual)

| Solution | Year 1 | Year 3 (500 employees) |
|----------|--------|------------------------|
| **Current (Sheets + Supabase)** | $0 | $6,000 (Sheets licensing) |
| **Baserow Self-Hosted** | $0 (server only) | $500 (server scaling) |
| **Frappe HR Self-Hosted** | $0 (server only) | $500 (server scaling) |
| **BambooHR** | $7,200 | $36,000 |
| **OrangeHRM** | $0 (OSS) | $5,000 (support) |
| **Deel** | $5,880 | $30,000 |

**Savings with Open-Source:** $30,000+ over 3 years

---

## Specific Recommendations for NursingCare.pk

### 1. **Employee Database** → Migrate to Baserow

**Why:**
- Unlimited rows (you'll grow beyond 286)
- Better API than Google Sheets
- Built-in forms (no more WhatsApp OCR issues)
- Row-level permissions (salary privacy)

**Migration Script:**
```javascript
// scripts/migrate_supabase_to_baserow.js
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BASEROW_API = 'http://your-baserow/api/database/rows/table/1/';

// Export from Supabase
const { data } = await supabase.from('staff').select('*');

// Import to Baserow
for (const employee of data) {
  await fetch(BASEROW_API, {
    method: 'POST',
    headers: { 'Authorization': 'Token YOUR_TOKEN' },
    body: JSON.stringify(employee)
  });
}
```

### 2. **Intake Form** → Baserow Forms

Replace WhatsApp → n8n OCR → Sheets with:
- Baserow built-in form builder
- Direct to database (no OCR errors)
- File upload for documents (CNIC, certificates)
- Auto-confirmation email

### 3. **Approval Workflow** → Baserow + n8n

```
Form Submission → Baserow → n8n validates → HR approves → Active
                                      ↓
                                  Rejected (with reason)
```

### 4. **Employee Portal** → Softr + Baserow

Build in 2 hours:
- Employee profile view
- Download payslips (when payroll added)
- Request leave
- View schedule
- Update contact info

**Cost:** Free for up to 5 users (HR team)

### 5. **Attendance Tracking** → Custom Module (Phase 3)

For home nursing staff:
- Geo-fenced check-in/out
- Patient visit logging
- Auto-calculate hours
- Overtime alerts

---

## GitHub Repositories to Fork/Study

| Repo | Purpose | Stars |
|------|---------|-------|
| [frappe/hrms](https://github.com/frappe/hrms) | Full HRMS | 5.2k |
| [bram2w/baserow](https://github.com/bram2w/baserow) | No-code database | 15k |
| [n8n-io/n8n](https://github.com/n8n-io/n8n) | Workflow automation | 45k |
| [LouisYangga/OnboardingAutomation](https://github.com/LouisYangga/OnboardingAutomation) | n8n onboarding | 50+ |
| [orangehrm/orangehrm](https://github.com/orangehrm/orangehrm) | HRMS | 8k |

---

## Decision Matrix

| Criteria | Stay Current | Baserow | Frappe HR | BambooHR |
|----------|-------------|---------|-----------|----------|
| **Cost** | ✅ Free | ✅ Free | ✅ Free | ❌ $600/mo |
| **Ease of Setup** | ✅ Done | ✅ 1-2 days | ⚠️ 1-2 weeks | ✅ 1 week |
| **Scalability** | ❌ Limited | ✅ Excellent | ✅ Excellent | ✅ Excellent |
| **Features** | ❌ Basic | ⚠️ Good | ✅ Complete | ✅ Complete |
| **Customization** | ✅ Full | ✅ Full | ✅ Full | ❌ Limited |
| **Healthcare Fit** | ⚠️ Custom | ⚠️ Custom | ✅ Built-in | ⚠️ Generic |
| **Time to Value** | ✅ Now | ✅ 1 week | ⚠️ 1 month | ⚠️ 2 weeks |

---

## Final Recommendation

### **Immediate Action (This Week)**

1. **Deploy Baserow** on your server (Docker, 30 min)
2. **Create Employee table** matching current schema
3. **Migrate 286 records** from Supabase
4. **Build intake form** in Baserow
5. **Update n8n workflow** to use Baserow API

**Time:** 4-6 hours  
**Cost:** $0 (existing server)

### **Next Month**

1. **Build Softr portal** for employee self-service
2. **Add document management** (CNIC, certificates upload)
3. **Implement approval workflow** with email notifications
4. **Phase out Google Sheets** (keep as backup only)

**Time:** 10-15 hours  
**Cost:** $0-49/mo (Softr Pro if needed)

### **Q2 2026**

1. **Add attendance tracking** with geo-fencing
2. **Shift scheduling module** for home nurses
3. **Compliance dashboard** (license renewals, certifications)
4. **Evaluate Frappe HR** if >500 employees

**Time:** 40-60 hours  
**Cost:** $0-100/mo (hosting + tools)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **Data Loss** | Keep Supabase as backup, daily exports |
| **Downtime** | Self-hosted = your control, 99.9% SLA achievable |
| **Learning Curve** | Baserow UI similar to Airtable, 1hr training |
| **Migration Issues** | Test with 10 records first, then batch migrate |
| **Feature Gaps** | Custom development via Baserow API + n8n |

---

## Success Metrics

Track these monthly:

| Metric | Current | Target (3 mo) | Target (6 mo) |
|--------|---------|---------------|---------------|
| **Time to Onboard** | 2-3 days | 1 day | 4 hours |
| **Data Entry Errors** | ~5% | <1% | 0% |
| **HR Admin Time** | 20 hrs/wk | 10 hrs/wk | 5 hrs/wk |
| **Employee Self-Service** | 0% | 50% | 90% |
| **System Cost/Employee** | $0 | $0 | $1/mo |

---

## Next Steps

1. **Approve this roadmap** (reply with go-ahead)
2. **I'll create:**
   - Docker deployment script for Baserow
   - Migration script (Supabase → Baserow)
   - Updated n8n workflow JSON
   - Employee intake form template
   - Softr portal configuration

3. **Timeline:**
   - Day 1: Baserow setup
   - Day 2: Data migration
   - Day 3: Form + workflow testing
   - Day 4: Go live

---

**Questions to Consider:**

1. Do you want to keep Horilla HRMS in the roadmap?
2. What's your employee growth target for 2026? (100? 500? 1000?)
3. Do you need payroll integration in 2026?
4. Any specific compliance requirements? (PNC, HIPAA, etc.)

---

*Prepared by: AI HR Technology Consultant*  
*Based on analysis of 20+ HR platforms and healthcare-specific requirements*
