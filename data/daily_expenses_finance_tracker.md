# Daily Expenses & Finance Tracker - Google Sheets Template

**For:** NursingCare.pk HR Department  
**Purpose:** Track daily office expenses, petty cash, employee reimbursements, and departmental finances

---

## 📊 Sheet Structure (7 Tabs)

### Tab 1: **DASHBOARD** (Summary View)

| Metric | Formula | Target |
|--------|---------|--------|
| **Total Budget (Monthly)** | `=SUM(Budget!C:C)` | Rs. 50,000 |
| **Total Spent (Month-to-Date)** | `=SUM(Daily_Expenses!G:G)` | - |
| **Remaining Budget** | `=B2-B3` | - |
| **Petty Cash Balance** | `=Petty_Cash!L100` | Rs. 10,000 |
| **Pending Reimbursements** | `=SUMIF(Employee_Expenses!H:H,"Pending",Employee_Expenses!G:G)` | - |
| **Expenses This Week** | `=SUMIFS(Daily_Expenses!G:G,Daily_Expenses!A:A,">="&TODAY()-WEEKDAY(TODAY(),2)+1)` | - |
| **Burn Rate (Daily Avg)** | `=B3/DAY(TODAY())` | - |
| **Runway (Days)** | `=B5/B7` | 30+ days |

**Charts:**
- Pie chart: Expenses by Category
- Bar chart: Weekly spending trend
- Line chart: Budget vs Actual

---

### Tab 2: **DAILY_EXPENSES** (Main Transaction Log)

| Column | Header | Type | Validation/Notes |
|--------|--------|------|------------------|
| A | Date | Date | DD-MMM-YYYY |
| B | Day | Formula | `=TEXT(A2,"ddd")` |
| C | Expense ID | Text | Auto: `EXP-YYYY-MM-001` |
| D | Category | Dropdown | See Category List below |
| E | Sub-Category | Dropdown | Dynamic based on Category |
| F | Description | Text | Detailed expense purpose |
| G | Vendor/Payee | Text | Who received payment |
| H | Amount (Rs.) | Number | Positive values only |
| I | Payment Method | Dropdown | Cash/Card/Bank Transfer/Petty Cash |
| J | Receipt # | Text | Attach/link receipt |
| K | Approved By | Dropdown | HR Manager/Finance/Admin |
| L | Status | Dropdown | Pending/Approved/Rejected |
| M | Notes | Text | Additional comments |

**Category Dropdown Options:**
```
├── Office Supplies
│   ├── Stationery
│   ├── Printing/Copying
│   └── Equipment
├── Employee Expenses
│   ├── Recruitment
│   ├── Training
│   ├── Onboarding
│   └── Team Events
├── Utilities
│   ├── Electricity
│   ├── Internet/Phone
│   ├── Water
│   └── Maintenance
├── Travel & Transport
│   ├── Fuel
│   ├── Public Transport
│   ├── Ride Sharing
│   └── Parking/Tolls
├── Client Relations
│   ├── Meetings
│   ├── Entertainment
│   └── Gifts
├── Professional Services
│   ├── Legal
│   ├── Accounting
│   └── Consulting
├── Miscellaneous
│   ├── Emergency
│   └── Other
```

**Sample Data:**
| Date | Day | Expense ID | Category | Amount | Status |
|------|-----|------------|----------|--------|--------|
| 01-Mar-26 | Sun | EXP-2026-03-001 | Office Supplies | 2,500 | Approved |
| 01-Mar-26 | Sun | EXP-2026-03-002 | Employee Expenses | 1,200 | Approved |
| 02-Mar-26 | Mon | EXP-2026-03-003 | Travel & Transport | 800 | Pending |

---

### Tab 3: **PETTY_CASH** (Imprest System)

**Header Section:**
| Field | Value |
|-------|-------|
| Fund Custodian | [Name] |
| Maximum Limit | Rs. 10,000 |
| Current Balance | Rs. [Auto-calculated] |
| Last Replenished | [Date] |

**Transaction Log:**

| Column | Header | Formula/Notes |
|--------|--------|---------------|
| A | Date | Transaction date |
| B | Voucher # | PC-YYYY-MM-001 |
| C | Particulars | What was purchased |
| D | Paid To | Employee/Recipient name |
| E | Approved By | Manager name |
| F | Cash Out | Disbursement amount |
| G | Cash In | Return/replenishment |
| H | Running Balance | `=Previous_Balance-F2+G2` |
| I | Receipt Attached | Yes/No + Link |
| J | Category | Expense category |
| K | Notes | Additional info |

**Reconciliation Section:**
| Item | Amount |
|------|--------|
| Opening Balance | Rs. 10,000 |
| Total Cash Out | `=SUM(F:F)` |
| Total Cash In | `=SUM(G:G)` |
| **Expected Balance** | `=B2-B3+B4` |
| Actual Cash Count | Rs. [Manual entry] |
| **Difference** | `=B5-B6` |
| Reimbursed By | [Name] |
| Date | [Date] |

---

### Tab 4: **EMPLOYEE_EXPENSES** (Reimbursement Tracker)

| Column | Header | Type | Notes |
|--------|--------|------|-------|
| A | Request ID | Text | REIMB-YYYY-MM-001 |
| B | Employee Name | Text | |
| C | Employee ID | Text | NC-XXX |
| D | Department | Dropdown | HR/Operations/Admin |
| E | Expense Date | Date | When expense occurred |
| F | Submission Date | Date | When claim submitted |
| G | Category | Dropdown | Same as Daily Expenses |
| H | Description | Text | Business purpose |
| I | Amount (Rs.) | Number | Claim amount |
| J | Receipt Count | Number | Number of receipts |
| K | Manager Approval | Dropdown | Pending/Approved/Rejected |
| L | Finance Verified | Dropdown | Pending/Verified/Rejected |
| M | Payment Status | Dropdown | Pending/Processing/Paid |
| N | Payment Date | Date | When reimbursed |
| O | Payment Method | Dropdown | Bank Transfer/Cash |
| P | Notes | Text | Comments/rejections |

**Summary Section:**
| Metric | Formula |
|--------|---------|
| Total Pending Approval | `=SUMIF(K:K,"Pending",I:I)` |
| Total Pending Payment | `=SUMIF(M:M,"Pending",I:I)` |
| Paid This Month | `=SUMIFS(I:I,M:M,"Paid",N:N,">="&EOMONTH(TODAY(),-1)+1,N:N,"<="&EOMONTH(TODAY(),0))` |

---

### Tab 5: **BUDGET** (Monthly Planning)

| Category | Monthly Budget (Rs.) | Spent (MTD) | Remaining | % Used | Status |
|----------|---------------------|-------------|-----------|--------|--------|
| Office Supplies | 5,000 | `=SUMIFS(...)` | Formula | Formula | 🟢/🟡/🔴 |
| Employee Expenses | 15,000 | ... | ... | ... | ... |
| Utilities | 10,000 | ... | ... | ... | ... |
| Travel & Transport | 8,000 | ... | ... | ... | ... |
| Client Relations | 5,000 | ... | ... | ... | ... |
| Professional Services | 5,000 | ... | ... | ... | ... |
| Miscellaneous | 2,000 | ... | ... | ... | ... |
| **TOTAL** | **50,000** | **=SUM()** | **=SUM()** | **=AVG()** | |

**Status Indicators:**
- 🟢 Green: <70% used
- 🟡 Yellow: 70-90% used  
- 🔴 Red: >90% used

---

### Tab 6: **VENDOR_MASTER** (Reference List)

| Vendor ID | Vendor Name | Category | Contact Person | Phone | Email | Payment Terms | Notes |
|-----------|-------------|----------|----------------|-------|-------|---------------|-------|
| V-001 | ABC Stationers | Office Supplies | Mr. Ahmed | 0300-1234567 | abc@email.com | Cash | Regular supplier |
| V-002 | XYZ Travels | Travel | Ms. Fatima | 0300-7654321 | xyz@email.com | 15 days | Corporate rates |

---

### Tab 7: **REPORTS** (Monthly Summary)

**Monthly Expense Summary:**

| Month | Total Budget | Total Spent | Variance | Top Category | Top Vendor |
|-------|-------------|-------------|----------|--------------|------------|
| Jan-26 | 50,000 | 47,500 | +2,500 | Employee Expenses | ABC Stationers |
| Feb-26 | 50,000 | 52,000 | -2,000 | Utilities | XYZ Travels |
| Mar-26 | 50,000 | [Auto] | [Auto] | [Auto] | [Auto] |

**Category-wise Breakdown:**
| Category | Jan | Feb | Mar | Q1 Total | % of Total |
|----------|-----|-----|-----|----------|------------|
| Office Supplies | | | | | |
| Employee Expenses | | | | | |
| Utilities | | | | | |
| Travel | | | | | |

---

## 🔧 Key Formulas

### Auto-Generate Expense ID
```
="EXP-"&TEXT(A2,"YYYY")&"-"&TEXT(A2,"MM")&"-"&TEXT(COUNTIF($C$2:C2,"EXP-*")+1,"000")
```

### Running Balance (Petty Cash)
```
=H1-F2+G2
```

### Budget Status Indicator
```
=IF(E2<0.7,"🟢",IF(E2<0.9,"🟡","🔴"))
```

### Days Since Last Entry
```
=TODAY()-MAX(A:A)
```

### Weekly Total
```
=SUMIFS(G:G,A:A,">="&TODAY()-WEEKDAY(TODAY(),2)+1,A:A,"<="&TODAY())
```

---

## 📋 Setup Instructions

### Step 1: Create Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **+ Blank**
3. Name it: `HR Daily Expenses Tracker - 2026`

### Step 2: Create Tabs
Create 7 tabs with exact names:
- DASHBOARD
- DAILY_EXPENSES
- PETTY_CASH
- EMPLOYEE_EXPENSES
- BUDGET
- VENDOR_MASTER
- REPORTS

### Step 3: Set Up Data Validation

**For Category Dropdown:**
1. Select column D in DAILY_EXPENSES
2. Data → Data Validation
3. Criteria: List of items
4. Enter categories (comma-separated)

**For Status Dropdown:**
1. Select column L in DAILY_EXPENSES
2. Data → Data Validation
3. Criteria: List of items
4. Enter: `Pending,Approved,Rejected`

### Step 4: Add Conditional Formatting

**Over Budget Alert:**
1. Select Budget column F (% Used)
2. Format → Conditional Formatting
3. Custom formula: `=F2>0.9`
4. Format: Red background

**Pending Approvals:**
1. Select Status columns
2. Format → Conditional Formatting
3. Text contains: `Pending`
4. Format: Yellow background

### Step 5: Create Charts

**Pie Chart (Expenses by Category):**
1. Insert → Chart
2. Chart type: Pie chart
3. Data range: Category column + Amount column
4. Customize: Show percentages

**Bar Chart (Weekly Trend):**
1. Insert → Chart
2. Chart type: Column chart
3. Data range: Week column + Amount column

---

## 🎯 Best Practices

### Daily
- [ ] Record all expenses same-day
- [ ] Attach receipt photos (Google Drive links)
- [ ] Update petty cash after each transaction
- [ ] Review pending approvals

### Weekly
- [ ] Reconcile petty cash (every Friday)
- [ ] Review budget vs actual
- [ ] Process approved reimbursements
- [ ] Send summary to management

### Monthly
- [ ] Close month-end reports
- [ ] Replenish petty cash to imprest level
- [ ] Archive receipts (digital + physical)
- [ ] Review and adjust budget categories
- [ ] Generate management report

### Quarterly
- [ ] Analyze spending trends
- [ ] Review vendor contracts
- [ ] Update budget allocations
- [ ] Audit expense compliance

---

## 🔐 Access Control

| Role | Permissions |
|------|-------------|
| **HR Admin** | Full edit access |
| **HR Manager** | Approve expenses, view all |
| **Finance** | View + verify reimbursements |
| **Employees** | Submit expense claims only |

---

## 📎 Receipt Management

### Google Drive Folder Structure
```
HR Expenses/
├── 2026/
│   ├── 01-January/
│   │   ├── EXP-2026-01-001.jpg
│   │   ├── EXP-2026-01-002.pdf
│   │   └── ...
│   ├── 02-February/
│   └── ...
└── Petty_Cash_Receipts/
```

### Naming Convention
```
EXP-YYYY-MM-NNN_Description_Date.jpg
Example: EXP-2026-03-001_Stationery_01Mar26.jpg
```

---

## 📊 Sample Dashboard View

```
╔══════════════════════════════════════════════════════════════╗
║         HR DAILY EXPENSES DASHBOARD - March 2026            ║
╠══════════════════════════════════════════════════════════════╣
║  Budget: Rs. 50,000  │  Spent: Rs. 28,500  │  Remaining: Rs. 21,500  ║
║                                                              ║
║  Petty Cash: Rs. 7,200  │  Pending Reimbursements: Rs. 3,400 ║
╠══════════════════════════════════════════════════════════════╣
║  EXPENSES BY CATEGORY (Pie Chart)                            ║
║  ████████ Office Supplies (35%)                              ║
║  ██████ Employee Expenses (28%)                              ║
║  ████ Utilities (18%)                                        ║
║  ██ Travel (12%)                                             ║
║  █ Other (7%)                                                ║
╠══════════════════════════════════════════════════════════════╣
║  WEEKLY TREND (Bar Chart)                                    ║
║  Week 1: ████████████████ Rs. 8,500                          ║
║  Week 2: ██████████████ Rs. 7,200                            ║
║  Week 3: ███████████████ Rs. 7,800                           ║
║  Week 4: ██████ Rs. 5,000                                    ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 🚀 Quick Start Checklist

- [ ] Create Google Sheet with 7 tabs
- [ ] Set up all column headers
- [ ] Add data validation for dropdowns
- [ ] Configure conditional formatting
- [ ] Add formulas for auto-calculations
- [ ] Create charts in Dashboard
- [ ] Set up Google Drive folder for receipts
- [ ] Share with appropriate team members
- [ ] Enter opening petty cash balance
- [ ] Import any existing expense data
- [ ] Test with sample entries
- [ ] Train team on usage

---

**Template Version:** 1.0  
**Last Updated:** March 2026  
**For:** NursingCare.pk HR Department
