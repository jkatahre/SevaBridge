import type { Citizen, FieldPath, ProfileSectionKey } from '@/types'

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal',
]

export type FieldInput = 'text' | 'email' | 'tel' | 'date' | 'number' | 'select' | 'toggle'

export interface FieldDef {
  path: FieldPath
  label: string
  input: FieldInput
  options?: string[]
  placeholder?: string
  /** Counted towards profile completion. */
  required: boolean
  /** Shown full-width in forms. */
  wide?: boolean
}

export interface SectionDef {
  key: ProfileSectionKey
  title: string
  description: string
  fields: FieldDef[]
}

const f = (
  path: FieldPath,
  label: string,
  input: FieldInput = 'text',
  extra: Partial<FieldDef> = {},
): FieldDef => ({ path, label, input, required: true, ...extra })

export const PROFILE_SECTIONS: SectionDef[] = [
  {
    key: 'personal_info',
    title: 'Personal Information',
    description: 'Your legal identity details as recorded on official documents.',
    fields: [
      f('personal_info.full_name', 'Full Name', 'text', { wide: true }),
      f('personal_info.first_name', 'First Name'),
      f('personal_info.middle_name', 'Middle Name', 'text', { required: false }),
      f('personal_info.last_name', 'Last Name'),
      f('personal_info.date_of_birth', 'Date of Birth', 'date'),
      f('personal_info.gender', 'Gender', 'select', { options: ['Male', 'Female', 'Transgender', 'Prefer not to say'] }),
      f('personal_info.nationality', 'Nationality', 'select', { options: ['Indian', 'Other'] }),
    ],
  },
  {
    key: 'contact_info',
    title: 'Contact Information',
    description: 'How departments reach you about applications.',
    fields: [
      f('contact_info.email', 'Email', 'email'),
      f('contact_info.phone', 'Phone', 'tel', { placeholder: '+91 98xxxxxx10' }),
      f('contact_info.alternate_phone', 'Alternate Phone', 'tel', { required: false }),
    ],
  },
  {
    key: 'address',
    title: 'Address',
    description: 'Your current residential address.',
    fields: [
      f('address.address_line', 'Address', 'text', { wide: true }),
      f('address.city', 'City'),
      f('address.district', 'District'),
      f('address.state', 'State', 'select', { options: INDIAN_STATES }),
      f('address.pincode', 'Pincode', 'text', { placeholder: '6-digit PIN' }),
    ],
  },
  {
    key: 'education',
    title: 'Education',
    description: 'Your current or highest education details.',
    fields: [
      f('education.highest_qualification', 'Highest Qualification', 'select', {
        options: ['10th', '12th', 'Diploma', 'B.Tech', 'B.Sc', 'B.Com', 'B.A', 'M.Tech', 'M.Sc', 'MBA', 'PhD'],
      }),
      f('education.institution_name', 'Institution', 'text', { wide: true }),
      f('education.course', 'Course'),
      f('education.branch', 'Branch'),
      f('education.enrollment_year', 'Enrollment Year', 'number'),
      f('education.passing_year', 'Passing Year', 'number'),
      f('education.current_year', 'Current Year', 'select', { options: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Completed'] }),
      f('education.current_semester', 'Current Semester', 'select', {
        options: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester', 'Completed'],
      }),
      f('education.cgpa', 'CGPA', 'number', { placeholder: 'out of 10' }),
    ],
  },
  {
    key: 'employment',
    title: 'Employment',
    description: 'Your current work or study status.',
    fields: [
      f('employment.employment_status', 'Employment Status', 'select', {
        options: ['Student', 'Employed', 'Self-employed', 'Unemployed', 'Retired'],
      }),
      f('employment.occupation', 'Occupation'),
      f('employment.organization', 'Organization', 'text', { required: false }),
      f('employment.designation', 'Designation', 'text', { required: false }),
      f('employment.experience_years', 'Experience (years)', 'number', { required: false }),
    ],
  },
  {
    key: 'financial_info',
    title: 'Financial Information',
    description: 'Used only to check eligibility for income-based schemes.',
    fields: [
      f('financial_info.annual_income', 'Annual Family Income (₹)', 'number'),
      f('financial_info.income_category', 'Income Category', 'select', {
        options: ['BPL', 'EWS', 'LIG', 'MIG', 'HIG'],
      }),
    ],
  },
  {
    key: 'social_info',
    title: 'Social Information',
    description: 'Used for reservation and welfare scheme eligibility.',
    fields: [
      f('social_info.category', 'Category', 'select', { options: ['General', 'OBC', 'SC', 'ST', 'EWS'] }),
      f('social_info.domicile_state', 'Domicile State', 'select', { options: INDIAN_STATES }),
      f('social_info.disability_status', 'Disability Status', 'select', { options: ['None', 'Locomotor', 'Visual', 'Hearing', 'Other'] }),
    ],
  },
  {
    key: 'preferences',
    title: 'Preferences',
    description: 'Language and how you would like to be notified.',
    fields: [
      f('preferences.language', 'Language', 'select', { options: ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali'] }),
      f('preferences.notification_email', 'Email Notifications', 'toggle', { required: false }),
      f('preferences.notification_sms', 'SMS Notifications', 'toggle', { required: false }),
    ],
  },
]

export const FIELD_INDEX: Record<string, FieldDef & { section: SectionDef }> = Object.fromEntries(
  PROFILE_SECTIONS.flatMap((s) => s.fields.map((fd) => [fd.path, { ...fd, section: s }])),
)

export function fieldLabel(path: FieldPath | string): string {
  return FIELD_INDEX[path]?.label ?? path
}

export function sectionTitle(key: ProfileSectionKey): string {
  return PROFILE_SECTIONS.find((s) => s.key === key)?.title ?? key
}

export function getField(citizen: Citizen, path: FieldPath | string): string {
  const [section, key] = path.split('.') as [ProfileSectionKey, string]
  const value = (citizen[section] as unknown as Record<string, unknown>)?.[key]
  if (value === undefined || value === null) return ''
  return String(value)
}

export function hasField(citizen: Citizen, path: FieldPath | string): boolean {
  return getField(citizen, path).trim() !== ''
}

export function setField(citizen: Citizen, path: FieldPath | string, value: string | boolean): Citizen {
  const [section, key] = path.split('.') as [ProfileSectionKey, string]
  return {
    ...citizen,
    [section]: { ...(citizen[section] as object), [key]: value },
  }
}

/** Group a list of field paths by their profile section, preserving section order. */
export function groupBySection(paths: FieldPath[]): { section: SectionDef; fields: FieldPath[] }[] {
  return PROFILE_SECTIONS.map((section) => ({
    section,
    fields: paths.filter((p) => p.startsWith(section.key + '.')),
  })).filter((g) => g.fields.length > 0)
}

export function formatINR(value: string | number): string {
  const n = Number(value)
  if (!Number.isFinite(n) || value === '') return '—'
  return '₹' + n.toLocaleString('en-IN')
}

export function displayValue(path: FieldPath | string, raw: string): string {
  if (!raw) return '—'
  if (path === 'financial_info.annual_income') return formatINR(raw)
  if (path === 'personal_info.date_of_birth') return formatDate(raw)
  if (raw === 'true') return 'Enabled'
  if (raw === 'false') return 'Disabled'
  return raw
}

export function formatDate(iso: string, withTime = false): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.round(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} hr ago`
  const d = Math.round(h / 24)
  if (d < 30) return `${d} day${d > 1 ? 's' : ''} ago`
  return formatDate(iso)
}

export function ageFrom(dob: string): number | null {
  if (!dob) return null
  const d = new Date(dob)
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
}

/** Admin views use pseudonymous references only — never names. */
export function maskCitizenId(id: string): string {
  return id.length > 7 ? `${id.slice(0, 4)}•••••${id.slice(-3)}` : '•••••'
}
