# Holiday Scheduling System Design

## Overview
This design addresses the challenge of scheduling nursing staff during religious holidays when significant portions of the workforce may be unavailable due to observance. The system will enhance the existing HR management system to automatically assign staff to patients during holiday periods while respecting religious observances and ensuring adequate patient coverage.

## Current System Analysis
- **Staff Data**: 286 records in master_staff_report.md
- **Data Fields**: Assigned ID, Name, Father's/Husband's Name, Date of Birth, Gender, CNIC, Designation, Contact 1, Official District, Religion, Marital Status, Age, Payment Mode, Languages
- **Issue**: Religion field appears to be unpopulated (shows district data instead)
- **Existing Infrastructure**: 
  - Data validation scripts (data_validator.js)
  - Export systems to Google Sheets and Supabase
  - n8n workflows for data ingestion
  - Node.js based architecture

## Problem Statement
During holiday weekends with multiple religious observances:
1. Muslim staff observe Eid al-Fitr (dates vary)
2. Christian staff observe Christmas (December 25)
3. This creates staffing shortages for ~200 patients requiring continuous care
4. Manual scheduling is error-prone and time-consuming
5. Need to balance religious accommodation with patient care requirements

## Design Solution: Combined Elements Approach

### 1. Enhanced Data Collection Module
**Purpose**: Accurately capture staff religious observance preferences and holiday availability

**Components**:
- **Religion Field Enhancement**: 
  - Add standardized religion options (Islam, Christianity, Hinduism, etc.)
  - Allow multiple selections for interfaith families
  - Include "Prefer not to disclose" option
- **Holiday Availability Tracking**:
  - Per-holiday availability status (Available/Unavailable/Partial)
  - Preferred shift timing during holidays
  - Willingness to work extra hours for holiday coverage
- **Implementation**:
  - Extend data_validator.js to validate religion field
  - Update master_staff_report.md template
  - Create data import script for existing staff religion survey

### 2. Rule-Based Holiday Scheduling Engine
**Purpose**: Automatically assign staff to patients during holiday periods based on availability, preferences, and coverage requirements

**Components**:
- **Holiday Calendar**:
  - Configurable holiday dates (Eid al-Fitr, Christmas, etc.)
  - Regional variation support
  - Recurring annual patterns
- **Staff Availability Matrix**:
  - 3D array: [Staff Member] × [Holiday Date] × [Shift Type]
  - Values: Available, Unavailable, Preferred, Requires Accommodation
- **Assignment Rules Engine**:
  - Priority 1: Cover all patient assignments with available staff
  - Priority 2: Respect religious observances (don't schedule observant staff)
  - Priority 3: Honor staff preferences where possible
  - Priority 4: Distribute holiday workload fairly
  - Priority 5: Maintain continuity of care where possible
- **Conflict Resolution**:
  - Automatic escalation when coverage insufficient
  - Suggestion of staff swaps or overtime options
  - Manager override capabilities

### 3. Staff Availability Portal (Web Interface)
**Purpose**: Enable staff to indicate holiday availability and managers to oversee scheduling

**Components**:
- **Staff View**:
  - Personal holiday calendar
  - Availability submission form (per holiday/shift)
  - Schedule viewing (approved assignments)
  - Shift swap requests
- **Manager View**:
  - Aggregate availability dashboard
  - Holiday coverage heatmap
  - Assignment review and approval
  - Conflict resolution tools
  - Export capabilities
- **Technical Stack**:
  - Frontend: React (leveraging existing frontend directory)
  - Backend: Node.js API (extend existing exports)
  - Database: Supabase (already integrated)

### 4. AI-Powered Optimization Layer
**Purpose**: Improve assignment quality through intelligent optimization

**Components**:
- **Objective Function**:
  - Maximize staff preference satisfaction
  - Minimize consecutive holiday assignments
  - Balance workload distribution
  - Minimize last-minute changes
- **Constraints**:
  - Hard: Religious observance, minimum coverage per patient
  - Soft: Staff preferences, fairness, continuity
- **Algorithm**:
  - Genetic algorithm or constraint programming
  - Fallback to rule-based engine if optimization fails to converge
  - Configurable optimization timebox (e.g., 30 seconds)
- **Integration**:
  - Micro-service calling optimization engine
  - Results feed back to assignment engine
  - A/B testing capability for different objectives

### 5. Notification and Communication System
**Purpose**: Keep staff informed of assignments and changes

**Components**:
- **Automated Notifications**:
  - Email/SMS when holiday schedule published
  - Reminders 48hrs and 24hrs before shifts
  - Change notifications
- **Preference Collection Reminders**:
  - Automated requests for holiday availability input
  - Deadline tracking
  - Completion reporting
- **Integration**:
  - Leverage existing webhook-server.js
  - Extend WhatsApp notifications if desired

## Data Flow

1. **Data Collection Phase** (Ongoing):
   - Staff submit religion/availability via portal
   - HR updates master records periodically
   - Validation scripts ensure data quality

2. **Pre-Holiday Phase** (4-6 weeks prior):
   - System loads holiday calendar
   - Availability requests sent to staff
   - Staff portal open for input
   - Managers monitor response rates

3. **Scheduling Phase** (2 weeks prior):
   - Rule-based engine generates initial assignments
   - Optimization layer refines assignments
   - Manager review and adjustment
   - Final schedule published
   - Notifications sent to staff

4. **Holiday Execution Phase**:
   - Staff view assignments in portal
   - Shift swap requests processed
   - Real-time coverage monitoring
   - Emergency reassignment capabilities

5. **Post-Holiday Phase**:
   - Feedback collection
   - Performance metrics calculation
   - System improvement suggestions

## Technical Implementation Plan

### Phase 1: Data Foundation (Weeks 1-2)
1. Fix religion field in data collection
   - Update data_validator.js validation rules
   - Create staff survey for religion collection
   - Import results into master records
2. Extend export_to_sheets.js to include religion field
3. Create holiday calendar configuration module

### Phase 2: Core Scheduling Engine (Weeks 3-4)
1. Develop staff availability data model
2. Create rule-based assignment engine
3. Build availability portal (staff view only)
4. Implement notification system

### Phase 3: Optimization and Manager Tools (Weeks 5-6)
1. Develop AI optimization layer
2. Build manager dashboard and approval workflow
3. Implement conflict resolution tools
4. Complete bidirectional portal functionality

### Phase 4: Integration and Testing (Weeks 7-8)
1. Connect to existing n8n workflows
2. Test with historical holiday data
3. User acceptance testing with HR team
4. Performance optimization and security review

## Success Criteria

### Quantitative Metrics
- **Coverage Rate**: ≥95% of patient assignments staffed during holidays
- **Preference Satisfaction**: ≥80% of staff get preferred holiday shifts when possible
- **Reduction in Manual Effort**: 70% decrease in holiday scheduling time
- **Staff Satisfaction**: ≥4/5 rating on holiday scheduling process
- **Observance Compliance**: 0% scheduling violations of known religious observances

### Qualitative Benefits
- Reduced administrative burden on HR/managers
- Improved staff work-life balance during holidays
- Better patient care continuity
- Transparent and fair scheduling process
- Scalable solution for future holiday periods

## Risks and Mitigation Strategies

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Incomplete religion data | High | Medium | Phased data collection with incentives; default to "unknown" with manager follow-up |
| Low staff portal adoption | Medium | High | Mobile-friendly design; integration with existing communication channels; manager advocacy |
| Optimization engine performance | Low | Medium | Rule-based fallback; configurable time limits; caching of common scenarios |
| Change resistance from staff | Medium | Medium | Transparent communication; pilot program; feedback incorporation |
| Technical debt accumulation | Low | High | Modular design; clear interfaces; regular refactoring sprints |

## Dependencies
- Existing HR Manager - Home Nursing Care system
- Google Sheets export functionality (for backup/reporting)
- Supabase database (primary storage)
- n8n workflow automation platform
- Staff availability and willingness to use new system

## Next Steps
1. Approve this design document
2. Create detailed implementation plan using writing-plans skill
3. Begin Phase 1 development
4. Schedule bi-weekly review checkpoints
5. Plan pilot deployment for next major holiday period

---
*Design created: 2026-03-16*
*For: NursingCare.pk HR Manager System*
*Approach: Combined Elements (Enhanced Data + Rule-Based Scheduling + Optimization + Portal)*