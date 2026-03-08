export type Designation = 
  | 'R/N'
  | 'BSN'
  | 'NURSE_ASSISTANT'
  | 'ATTENDANT'
  | 'MID_WIFE'
  | 'PHYSIOTHERAPIST'
  | 'DOCTOR'
  | 'BABY_SITTER'
  | 'TECHNICIAN'
  | 'OFFICE_STAFF'
  | 'MANAGER'
  | 'CEO'

export type StaffStatus = 'Active' | 'Inactive' | 'On Leave'

export type Gender = 'Male' | 'Female' | 'Other'

export type CareType = 'ICU' | 'Elderly' | 'Pediatric' | 'Mother & Baby' | 'Post-surgical' | 'General'
export type CareLevel = 'High' | 'Medium' | 'Low'
export type BillingCategory = 'Private' | 'Insurance' | 'Government'
export type PatientStatus = 'Active' | 'Discharged'

export type ShiftStatus = 'Scheduled' | 'Completed' | 'Missed' | 'Cancelled'
export type PayrollStatus = 'Draft' | 'Approved' | 'Paid'

export interface Staff {
  id: string
  assigned_id: string
  full_name: string
  father_husband_name?: string
  date_of_birth?: string
  gender?: Gender
  cnic?: string
  cnic_expiry?: string
  photo_url?: string
  contact_1?: string
  contact_2?: string
  whatsapp_number?: string
  full_address?: string
  designation: Designation
  hire_date?: string
  status: StaffStatus
  official_district?: string
  hourly_rate?: number
  monthly_salary?: number
  overtime_rate?: number
  bank_name?: string
  account_number?: string
  pnc_license_number?: string
  pnc_expiry?: string
  bls_certified?: boolean
  bls_expiry?: string
  vaccination_status?: 'Complete' | 'Partial' | 'None'
  skill_icu?: boolean
  skill_pediatric?: boolean
  skill_elderly?: boolean
  skill_mother_baby?: boolean
  skill_surgical?: boolean
  languages?: string
  can_drive?: boolean
  gender_preference?: 'Male' | 'Female' | 'None'
  available_days?: string
  shift_preference?: 'Morning' | 'Afternoon' | 'Night' | 'Any'
  max_distance_km?: number
  performance_rating?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  patient_id: string
  full_name: string
  date_of_birth?: string
  gender?: Gender
  cnic?: string
  phone_1: string
  phone_2?: string
  address: string
  district?: string
  care_type: CareType
  care_level: CareLevel
  assigned_staff?: string[]
  billing_category?: BillingCategory
  hourly_rate: number
  start_date: string
  notes?: string
  status: PatientStatus
  created_at: string
}

export interface Shift {
  id: string
  patient_id: string
  staff_id: string
  shift_date: string
  start_time: string
  end_time: string
  actual_start?: string
  actual_end?: string
  status: ShiftStatus
  notes?: string
  created_at: string
}

export interface Payroll {
  id: string
  staff_id: string
  period_start: string
  period_end: string
  regular_hours: number
  overtime_hours?: number
  hourly_rate: number
  overtime_rate?: number
  gross_amount: number
  deductions?: number
  net_amount: number
  status: PayrollStatus
  paid_date?: string
  created_at: string
}

export interface DashboardStats {
  totalStaff: number
  activeStaff: number
  totalPatients: number
  activePatients: number
  todayShifts: number
  pendingPayroll: number
  expiringLicenses: number
  staffByDesignation: Record<Designation, number>
}
