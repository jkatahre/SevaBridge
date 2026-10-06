import type { ApiRequestEvent, AuditLog, DataMapping, Integration } from '@/types'
import { ago, seeded } from './time'

// DEMO / MOCK INTEGRATIONS — none of these are real government APIs.
// Replace `base_url` with authorised endpoints when a backend is connected.

export const seedIntegrations: Integration[] = [
  { integration_id: 'INT-EDU', name: 'Education Department', department: 'Department of Higher Education', api_name: 'Education API', api_status: 'Connected', version: 'v2.3.1', response_time_ms: 120, last_sync: ago({ minutes: 2 }), uptime_pct: 99.96, requests_today: 4812, errors_today: 3, base_url: 'https://mock.govconnect.local/education/v2', is_mock: true },
  { integration_id: 'INT-SCH', name: 'Scholarship Department', department: 'Department of Social Justice', api_name: 'Scholarship API', api_status: 'Connected', version: 'v1.8.0', response_time_ms: 180, last_sync: ago({ minutes: 1 }), uptime_pct: 99.91, requests_today: 3920, errors_today: 7, base_url: 'https://mock.govconnect.local/scholarship/v1', is_mock: true },
  { integration_id: 'INT-EMP', name: 'Employment Department', department: 'Department of Labour & Employment', api_name: 'Employment API', api_status: 'Connected', version: 'v3.0.2', response_time_ms: 145, last_sync: ago({ minutes: 4 }), uptime_pct: 99.88, requests_today: 2210, errors_today: 2, base_url: 'https://mock.govconnect.local/employment/v3', is_mock: true },
  { integration_id: 'INT-DOC', name: 'Document Verification', department: 'Digital Records Authority', api_name: 'Document API', api_status: 'Degraded', version: 'v2.0.4', response_time_ms: 520, last_sync: ago({ minutes: 11 }), uptime_pct: 97.4, requests_today: 3104, errors_today: 61, base_url: 'https://mock.govconnect.local/documents/v2', is_mock: true },
  { integration_id: 'INT-CERT', name: 'Certificate System', department: 'Revenue Department', api_name: 'Certificate API', api_status: 'Offline', version: 'v1.4.2', response_time_ms: null, last_sync: ago({ hours: 3, minutes: 12 }), uptime_pct: 91.2, requests_today: 640, errors_today: 188, base_url: 'https://mock.govconnect.local/certificates/v1', is_mock: true },
  { integration_id: 'INT-HLT', name: 'Health Department', department: 'Department of Health & Family Welfare', api_name: 'Health API', api_status: 'Connected', version: 'v1.2.0', response_time_ms: 165, last_sync: ago({ minutes: 6 }), uptime_pct: 99.8, requests_today: 1342, errors_today: 1, base_url: 'https://mock.govconnect.local/health/v1', is_mock: true },
  { integration_id: 'INT-HSG', name: 'Housing Board', department: 'Urban Development & Housing', api_name: 'Housing API', api_status: 'Connected', version: 'v1.0.6', response_time_ms: 210, last_sync: ago({ minutes: 9 }), uptime_pct: 99.7, requests_today: 512, errors_today: 0, base_url: 'https://mock.govconnect.local/housing/v1', is_mock: true },
  { integration_id: 'INT-WEL', name: 'Social Welfare Department', department: 'Department of Social Welfare', api_name: 'Welfare API', api_status: 'Connected', version: 'v2.1.0', response_time_ms: 155, last_sync: ago({ minutes: 5 }), uptime_pct: 99.85, requests_today: 876, errors_today: 1, base_url: 'https://mock.govconnect.local/welfare/v2', is_mock: true },
]

export const seedMappings: DataMapping[] = [
  { mapping_id: 'MAP-001', source_system: 'Education Department', source_field: 'student_name', standard_field: 'personal_info.full_name', target_system: 'Scholarship Department', target_field: 'applicant_name', transformation: 'titlecase', status: 'Active' },
  { mapping_id: 'MAP-002', source_system: 'Education Department', source_field: 'college_name', standard_field: 'education.institution_name', target_system: 'Scholarship Department', target_field: 'institution', transformation: 'direct', status: 'Active' },
  { mapping_id: 'MAP-003', source_system: 'Education Department', source_field: 'dob_yyyymmdd', standard_field: 'personal_info.date_of_birth', target_system: 'Scholarship Department', target_field: 'dob', transformation: 'date_dmy', status: 'Active' },
  { mapping_id: 'MAP-004', source_system: 'Education Department', source_field: 'cgpa_10', standard_field: 'education.cgpa', target_system: 'Scholarship Department', target_field: 'cgpa_score', transformation: 'to_number', status: 'Active' },
  { mapping_id: 'MAP-005', source_system: 'Education Department', source_field: 'programme', standard_field: 'education.course', target_system: 'Scholarship Department', target_field: 'course_name', transformation: 'direct', status: 'Active' },
  { mapping_id: 'MAP-006', source_system: 'Education Department', source_field: 'year', standard_field: 'education.current_year', target_system: 'Scholarship Department', target_field: 'year_of_study', transformation: 'code_map', status: 'Active' },
  { mapping_id: 'MAP-007', source_system: 'Certificate System', source_field: 'family_income_rs', standard_field: 'financial_info.annual_income', target_system: 'Scholarship Department', target_field: 'family_income', transformation: 'to_number', status: 'Active' },
  { mapping_id: 'MAP-008', source_system: 'Certificate System', source_field: 'caste', standard_field: 'social_info.category', target_system: 'Scholarship Department', target_field: 'caste_category', transformation: 'code_map', status: 'Active' },
  { mapping_id: 'MAP-009', source_system: 'Certificate System', source_field: 'domicile', standard_field: 'social_info.domicile_state', target_system: 'Scholarship Department', target_field: 'domicile', transformation: 'code_map', status: 'Active' },
  { mapping_id: 'MAP-010', source_system: 'GovConnect Profile', source_field: 'gender', standard_field: 'personal_info.gender', target_system: 'Scholarship Department', target_field: 'gender_code', transformation: 'code_map', status: 'Active' },
  { mapping_id: 'MAP-011', source_system: 'Education Department', source_field: 'student_name', standard_field: 'personal_info.full_name', target_system: 'Employment Department', target_field: 'candidate_name', transformation: 'direct', status: 'Active' },
  { mapping_id: 'MAP-012', source_system: 'Education Department', source_field: 'stream', standard_field: 'education.branch', target_system: 'Employment Department', target_field: 'specialisation', transformation: 'direct', status: 'Active' },
  { mapping_id: 'MAP-013', source_system: 'GovConnect Profile', source_field: 'name_parts', standard_field: 'personal_info.full_name', target_system: 'Health Department', target_field: 'beneficiary_name', transformation: 'uppercase', status: 'Active' },
  { mapping_id: 'MAP-014', source_system: 'Document Verification', source_field: 'doc_holder', standard_field: 'personal_info.full_name', target_system: 'Certificate System', target_field: 'applicant', transformation: 'uppercase', status: 'Validation Error' },
  { mapping_id: 'MAP-015', source_system: 'Housing Board', source_field: 'income_slab', standard_field: 'financial_info.income_category', target_system: 'Housing Board', target_field: 'income_group', transformation: 'code_map', status: 'Draft' },
]

const AUDIT_TEMPLATES: Omit<AuditLog, 'log_id' | 'at'>[] = [
  { category: 'auth', action: 'Citizen signed in', actor: 'CZN-•••••217', target: 'GovConnect Portal', outcome: 'success' },
  { category: 'api', action: 'Education API request successful', actor: 'Integration Layer', target: 'GET /education/v2/students', outcome: 'success' },
  { category: 'consent', action: 'Citizen granted consent', actor: 'CZN-•••••088', target: 'Health Department', outcome: 'success' },
  { category: 'mapping', action: 'Data mapping completed', actor: 'Mapping Engine', target: '5 fields → Health Department', outcome: 'success' },
  { category: 'application', action: 'Application submitted', actor: 'CZN-•••••088', target: 'APP-10019', outcome: 'success' },
  { category: 'api', action: 'Certificate API request failed (timeout)', actor: 'Integration Layer', target: 'POST /certificates/v1/verify', outcome: 'failure' },
  { category: 'document', action: 'Document verification delayed', actor: 'Document API', target: 'DOC-0981', outcome: 'warning' },
  { category: 'mapping', action: 'Mapping validation error', actor: 'Mapping Engine', target: 'MAP-014 doc_holder → applicant', outcome: 'failure' },
  { category: 'consent', action: 'Citizen revoked consent', actor: 'CZN-•••••142', target: 'Employment Department', outcome: 'success' },
  { category: 'profile', action: 'Profile updated', actor: 'CZN-•••••217', target: 'education section', outcome: 'success' },
]

export const seedAuditLogs: AuditLog[] = AUDIT_TEMPLATES.map((t, i) => ({
  ...t,
  log_id: `LOG-${7000 + i}`,
  at: ago({ minutes: 18 + i * 23 }),
}))

const ENDPOINTS: Record<string, string[]> = {
  'INT-EDU': ['GET /students/{id}', 'GET /institutions'],
  'INT-SCH': ['POST /applications', 'GET /applications/{id}'],
  'INT-EMP': ['GET /openings', 'POST /candidates'],
  'INT-DOC': ['POST /verify', 'GET /documents/{id}'],
  'INT-CERT': ['POST /verify', 'GET /certificates/{id}'],
  'INT-HLT': ['POST /enrolment'],
  'INT-HSG': ['GET /eligibility'],
  'INT-WEL': ['POST /pension'],
}

/** Recent raw API traffic through the integration layer. */
export const seedApiEvents: ApiRequestEvent[] = (() => {
  const rnd = seeded(42)
  return seedIntegrations.flatMap((integ, idx) =>
    Array.from({ length: 3 }, (_, j) => {
      const failing = integ.api_status === 'Offline' || (integ.api_status === 'Degraded' && j === 0)
      const eps = ENDPOINTS[integ.integration_id]
      const ep = eps[j % eps.length]
      return {
        request_id: `REQ-${String(31000 + idx * 10 + j)}`,
        at: ago({ minutes: Math.round(2 + rnd() * 50) }),
        integration_id: integ.integration_id,
        endpoint: ep.split(' ')[1],
        method: ep.split(' ')[0] as 'GET' | 'POST',
        status_code: failing ? (integ.api_status === 'Offline' ? 504 : 502) : 200,
        latency_ms: integ.response_time_ms ? Math.round(integ.response_time_ms * (0.8 + rnd() * 0.5)) : 30000,
      }
    }),
  ).sort((a, b) => b.at.localeCompare(a.at))
})()

export interface HourlyMetric {
  hour: string
  requests: number
  errors: number
  successRate: number
  p50: number
}

/** 24 hours of aggregate traffic for monitoring charts (deterministic). */
export const hourlyMetrics: HourlyMetric[] = (() => {
  const rnd = seeded(7)
  const now = new Date()
  return Array.from({ length: 24 }, (_, i) => {
    const d = new Date(now.getTime() - (23 - i) * 3_600_000)
    const h = d.getHours()
    const daytime = h >= 9 && h <= 19 ? 1 : h >= 7 && h <= 22 ? 0.55 : 0.18
    const requests = Math.round(1400 * daytime + rnd() * 260)
    // Certificate API outage over the last ~3 hours pushes errors up.
    const outage = i >= 21 ? 0.035 : 0
    const errors = Math.round(requests * (0.006 + rnd() * 0.006 + outage))
    return {
      hour: `${String(h).padStart(2, '0')}:00`,
      requests,
      errors,
      successRate: Number((((requests - errors) / requests) * 100).toFixed(2)),
      p50: Math.round(150 + rnd() * 60 + (i >= 21 ? 90 : 0)),
    }
  })
})()
