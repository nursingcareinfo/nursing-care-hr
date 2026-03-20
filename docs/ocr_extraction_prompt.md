# AI Data Extraction Prompt for Employee Forms & CNIC Images

Use this prompt with an AI vision model (e.g., GPT-4o, Claude, Gemini) to extract structured data from employee hiring forms and CNIC images.

---

## Expected Output Format (Markdown Table)

Output must be a single row in this exact format:

```
| Assigned ID | Name | Father's / Husband's Name | Date of Birth | Gender | CNIC | Designation | Contact 1 | Official District | Religion | Marital Status | Age | Payment Mode | Languages |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| NC-KHI-XXX | EXTRACTED | EXTRACTED | EXTRACTED | EXTRACTED | EXTRACTED | EXTRACTED | EXTRACTED | EXTRACTED | EXTRACTED | EXTRACTED | EXTRACTED | EXTRACTED | EXTRACTED |
```

---

## Field-by-Field Extraction Guide

### 1. Assigned ID
- **Format**: `NC-KHI-XXX` (sequential number)
- **Source**: Look for stamp, handwritten number, or printed ID on the form
- **If missing**: Use "No record"
- **Example**: NC-KHI-346

### 2. Name
- **Source**: Full legal name as written on form/CNIC
- **Extract**: First and last name, honorifics (Mr., Mrs., etc.) removed
- **If missing**: Use "No record"
- **Example**: Muhammad Hammad

### 3. Father's / Husband's Name
- **Source**: Father's name (for unmarried) or husband's name (for married women)
- **Look for**: "S/W/D of" or "Father/Husband" field
- **If missing**: Use "No record"
- **Example**: Ahmed Khan

### 4. Date of Birth
- **Format**: Day/Month/Year (e.g., 15/03/1995) or written format
- **Source**: DOB field on form or CNIC
- **If missing**: Use "No record"
- **Example**: 15/03/1995

### 5. Gender
- **Source**: Gender field on form or inferred from CNIC
- **Valid values**: `Male`, `Female`, `Other`
- **If missing**: Use "No record"
- **Example**: Male

### 6. CNIC (Computerized National Identity Card)
- **Format**: XXXXX-XXXXXXX-X (15 digits with dashes)
- **Source**: CNIC number on ID card or form
- **If missing**: Use "No record"
- **Example**: 42201-1234567-5

### 7. Designation
- **Source**: Job title field on hiring form
- **Common values**: Nurse Assistant, Attendant, Staff Nurse, R/N, Mid Wife, Baby Sitter, Driver, Helper
- **If missing**: Use "No record"
- **Example**: Nurse Assistant

### 8. Contact 1 (Primary Phone)
- **Format**: 03XX-XXXXXXX (Pakistani mobile format)
- **Source**: Phone number field on form
- **If missing**: Use "No record"
- **Example**: 0305-6657685

### 9. Official District
- **Source**: Area/district field on form or address
- **Common values**: Karachi (South), Korangi, Gulshan, Landhi, Clifton, Orangi, Nazimabad, Keamari
- **If missing**: Use "No record"
- **Example**: Korangi

### 10. Religion
- **Source**: Religion field on form
- **Common values**: Muslim, Christian, Hindu, Sikh
- **If missing**: Use "No record"
- **Example**: Muslim

### 11. Marital Status
- **Source**: Marital status field on form
- **Valid values**: Single, Married, Divorced, Widowed
- **If missing**: Use "No record"
- **Example**: Married

### 12. Age
- **Format**: Number (years)
- **Source**: Age field OR calculate from Date of Birth
- **If missing**: Use "No record"
- **Example**: 28

### 13. Payment Mode
- **Source**: Payment preference on hiring form
- **Common values**: Cash, Bank Transfer, EasyPaisa, JazzCash
- **If missing**: Use "No record"
- **Example**: Bank Transfer

### 14. Languages
- **Source**: Languages known field on form
- **Format**: Comma-separated list
- **If missing**: Use "No record"
- **Example**: Urdu, English, Punjabi

---

## CNIC Image Specific Extraction

When processing a CNIC image, extract:

| Field | Priority | Notes |
|-------|----------|-------|
| Name | Required | Top section, below photo |
| Father/Husband Name | Required | "S/W/D of" field |
| CNIC Number | Required | 15-digit format with dashes |
| Date of Birth | Required | In date of birth field |
| Gender | Required | In gender field |
| Address | Medium | Extract district from address |
| Nationality | Low | Usually "Pakistani" |

---

## Employee Hiring Form Specific Extraction

When processing a hiring form, extract ALL fields present:

| Field | Priority | Notes |
|-------|----------|-------|
| Assigned ID | Required | Look for company stamp or ID number |
| Name | Required | Full name as written |
| Designation | Required | Job title applied for |
| Contact Number | Required | Primary phone |
| District | Required | Work area/district |
| Father/Husband Name | Important | Family details section |
| Religion | Important | Personal details |
| Marital Status | Important | Personal details |
| Languages | Important | Skills section |
| Payment Mode | If present | Banking/payment details |
| Date of Birth | If present | Age calculation |

---

## Quality Rules

1. **Missing fields = "No record"** - Never leave a field blank
2. **Exact CNIC format** - Must be XXXXX-XXXXXXX-X (15 digits)
3. **Phone format** - Pakistani mobile: 03XX-XXXXXXX
4. **Consistent naming** - Use exact spelling from source
5. **Date format preference** - Day/Month/Year (DD/MM/YYYY)
6. **District spelling** - Use standard Karachi districts:
   - Karachi (South)
   - Korangi
   - Gulshan
   - Landhi
   - Clifton
   - Orangi
   - Nazimabad
   - Keamari

---

## Example Output

### Input: Employee Form Image
```
Nursing Care Home Nursing
Staff Hiring Form

ID: NC-KHI-350
Name: Ayesha Khan
Father's Name: Rashid Khan
DOB: 10/05/1998
Gender: Female
CNIC: 42201-9876543-2
Designation: Nurse Assistant
Phone: 0315-1234567
District: Korangi
Religion: Muslim
Marital Status: Single
Languages: Urdu, English
```

### Expected Output:
```
| NC-KHI-350 | Ayesha Khan | Rashid Khan | 10/05/1998 | Female | 42201-9876543-2 | Nurse Assistant | 0315-1234567 | Korangi | Muslim | Single | 28 | No record | Urdu, English |
```

---

## Validation Checklist

Before outputting, verify:
- [ ] All 14 fields are present
- [ ] CNIC format is correct (XXXXX-XXXXXXX-X)
- [ ] Phone format is correct (03XX-XXXXXXX)
- [ ] No fields left blank (use "No record" if missing)
- [ ] Name has no honorifics (Mr., Mrs., etc.)
- [ ] District uses standard Karachi names
