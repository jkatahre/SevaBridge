// Core domain model for GovConnect.
// The Citizen shape mirrors the standardized citizen schema exactly, so a
// backend (e.g. Node.js/Express) can return the same JSON without adapters.

export interface PersonalInfo {
  full_name: string
  first_name: string
  middle_name: string
  last_name: string
  date_of_birth: string
  gender: string
  nationality: string
}

export interface ContactInfo {
  email: string
  phone: string
  alternate_phone: string
}

export interface Address {
  address_line: string
  city: string
  district: string
  state: string
  pincode: string
}

export interface Education {
  highest_qualification: string
  institution_name: string
  course: string
  branch: string
  enrollment_year: string
  passing_year: string
  current_year: string
  current_semester: string
  cgpa: string
}

export interface Employment {
  employment_status: string
  occupation: string
  organization: string
  designation: string
  experience_years: string
}

export interface FinancialInfo {
  annual_income: string
  income_category: string
}

export interface SocialInfo {
  category: string
  domicile_state: string
  disability_status: string
}

export interface Preferences {
  language: string
  notification_email: boolean
  notification_sms: boolean
}

export type ProfileStatus = 'incomplete' | 'pending_verification' | 'verified'

export interface Citizen {
  citizen_id: string
  personal_info: PersonalInfo
  contact_info: ContactInfo
  address: Address
  education: Education
  employment: Employment
  financial_info: FinancialInfo
  social_info: SocialInfo
  documents: string[] // document_ids
  preferences: Preferences
  profile_status: ProfileStatus
  created_at: string
  updated_at: string
}

/** Sections of the citizen record that hold editable scalar fields. */
export type ProfileSectionKey =
  | 'personal_info'
  | 'contact_info'
  | 'address'
  | 'education'
  | 'employment'
  | 'financial_info'
  | 'social_info'
  | 'preferences'

/** Dot-path into the citizen record, e.g. "education.cgpa". */
export type FieldPath = `${ProfileSectionKey}.${string}`

// ---------- Services & eligibility ----------

export type ServiceCategory =
  | 'Education'
  | 'Scholarships'
  | 'Employment'
  | 'Certificates'
  | 'Healthcare'
  | 'Financial Assistance'
  | 'Housing'
  | 'Social Welfare'

export type RuleOperator = 'eq' | 'neq' | 'in' | 'lte' | 'gte' | 'age_lte' | 'age_gte' | 'present'

export interface EligibilityRule {
  field: FieldPath
  op: RuleOperator
  value?: string | number | string[]
  /** Human-readable reason shown to citizens, e.g. "Income within ₹2.5L limit". */
  label: string
  weight: number
}

/** A field the target system needs that is NOT part of the unified profile. */
export interface ExtraField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number'
  options?: string[]
  required: boolean
  placeholder?: string
}

export interface Service {
  service_id: string
  name: string
  department: string
  /** Integration that receives the data for this service. */
  integration_id: string
  category: ServiceCategory
  short_description: string
  description: string
  benefits: string[]
  eligibility_summary: string
  eligibility_rules: EligibilityRule[]
  required_documents: string[]
  processing_time: string
  status: 'Open' | 'Closing Soon' | 'Closed'
  states: string[] // 'All India' or specific states
  purpose: string
  /** Standard citizen fields this service requests. */
  required_fields: FieldPath[]
  /** Standard fields the citizen may optionally share. */
  optional_fields: FieldPath[]
  /** Standard field → target system field name. */
  field_mapping: Partial<Record<FieldPath, string>>
  extra_fields: ExtraField[]
  is_scheme: boolean
}

export interface Recommendation {
  service: Service
  score: number
  matched: string[]
  unmet: string[]
  eligible: boolean
}

// ---------- Consent ----------

export type ConsentStatus = 'active' | 'revoked' | 'denied' | 'expired'

export interface Consent {
  consent_id: string
  citizen_id: string
  service_id: string
  service_name: string
  department: string
  purpose: string
  fields: FieldPath[]
  status: ConsentStatus
  granted_at: string
  revoked_at?: string
  expires_at: string
}

// ---------- Applications ----------

export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Verification Required'
  | 'Approved'
  | 'Rejected'

export interface ApplicationEvent {
  status: ApplicationStatus
  at: string
  note?: string
}

export interface Application {
  application_id: string
  citizen_id: string
  service_id: string
  service_name: string
  department: string
  submitted_at: string
  status: ApplicationStatus
  history: ApplicationEvent[]
  consent_id?: string
  /** Payload in the target system's own field names (after mapping). */
  mapped_payload: Record<string, string>
}

// ---------- Documents ----------

export type VerificationStatus = 'Verified' | 'Pending Verification' | 'Rejected' | 'Expired'

export interface CitizenDocument {
  document_id: string
  citizen_id: string
  document_type: string
  document_name: string
  verification_status: VerificationStatus
  issuing_authority: string
  uploaded_at: string
  file_size_kb: number
}

// ---------- Integrations & interoperability ----------

export type HealthStatus = 'Connected' | 'Degraded' | 'Offline'

export interface Integration {
  integration_id: string
  name: string
  department: string
  api_name: string
  api_status: HealthStatus
  version: string
  response_time_ms: number | null
  last_sync: string
  uptime_pct: number
  requests_today: number
  errors_today: number
  base_url: string
  is_mock: true
}

export type Transformation =
  | 'direct'
  | 'uppercase'
  | 'titlecase'
  | 'date_dmy'
  | 'to_number'
  | 'code_map'
  | 'concat_name'

export interface DataMapping {
  mapping_id: string
  source_system: string
  source_field: string
  standard_field: FieldPath
  target_system: string
  target_field: string
  transformation: Transformation
  status: 'Active' | 'Validation Error' | 'Draft'
}

// ---------- Notifications & audit ----------

export type NotificationType = 'success' | 'warning' | 'info' | 'announcement'

export interface Notification {
  notification_id: string
  citizen_id: string
  type: NotificationType
  title: string
  message: string
  created_at: string
  read: boolean
  link?: string
}

export type AuditCategory = 'consent' | 'application' | 'api' | 'mapping' | 'profile' | 'auth' | 'document'

export interface AuditLog {
  log_id: string
  at: string
  category: AuditCategory
  action: string
  /** Pseudonymous actor — admins never see citizen PII. */
  actor: string
  target: string
  outcome: 'success' | 'failure' | 'warning'
}

export interface ApiRequestEvent {
  request_id: string
  at: string
  integration_id: string
  endpoint: string
  method: 'GET' | 'POST'
  status_code: number
  latency_ms: number
}

// ---------- Auth ----------

export type Role = 'citizen' | 'admin'

export interface Session {
  role: Role
  citizen_id?: string
  email: string
  name: string
}
