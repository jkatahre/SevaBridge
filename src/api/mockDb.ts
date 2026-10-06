import type {
  ApiRequestEvent, Application, AuditLog, Citizen, CitizenDocument, Consent, DataMapping, Integration,
  Notification, Service,
} from '@/types'
import { seedCitizens, DEMO_CITIZEN_ID } from '@/data/citizens'
import { seedServices } from '@/data/services'
import { seedApplications, seedConsents, seedDocuments, seedNotifications } from '@/data/citizenRecords'
import { seedApiEvents, seedAuditLogs, seedIntegrations, seedMappings } from '@/data/platform'
import { ago } from '@/data/time'

// In-browser mock database. In production this is replaced by the backend —
// see api/index.ts. Accounts store plain passwords ONLY because this is a
// local demo; a real backend must hash passwords and issue tokens.

export interface Account {
  email: string
  password: string
  role: 'citizen' | 'admin'
  citizen_id?: string
  name: string
}

export interface Db {
  version: number
  accounts: Account[]
  citizens: Citizen[]
  services: Service[]
  applications: Application[]
  consents: Consent[]
  documents: CitizenDocument[]
  notifications: Notification[]
  integrations: Integration[]
  mappings: DataMapping[]
  auditLogs: AuditLog[]
  apiEvents: ApiRequestEvent[]
  counters: { applicationsToday: number; dataRequestsToday: number; nextApp: number; nextId: number }
}

const KEY = 'govconnect.db'
const VERSION = 3

/** Applications from other (fictional) citizens, shown pseudonymously to admins. */
function otherCitizenApplications(): Application[] {
  const rows: [string, string, string, Application['status'], number][] = [
    ['CZN-2026-000088', 'SVC-HLT-10', 'State Health Assurance Card', 'Approved', 1],
    ['CZN-2026-000217', 'SVC-UNA-07', 'Unemployment Allowance', 'Under Review', 1],
    ['CZN-2026-000301', 'SVC-PMS-01', 'Post Matric Scholarship', 'Submitted', 0],
    ['CZN-2026-000164', 'SVC-DOM-08', 'Domicile Certificate', 'Verification Required', 2],
    ['CZN-2026-000275', 'SVC-MCM-02', 'Merit-cum-Means Scholarship for Technical Education', 'Rejected', 5],
    ['CZN-2026-000119', 'SVC-HSG-11', 'Affordable Housing Interest Subsidy', 'Under Review', 3],
  ]
  return rows.map(([cid, sid, name, status, days], i) => {
    const svc = seedServices.find((s) => s.service_id === sid)!
    return {
      application_id: `APP-${10010 + i}`,
      citizen_id: cid,
      service_id: sid,
      service_name: name,
      department: svc.department,
      submitted_at: ago({ days, hours: 2 + i }),
      status,
      history: [{ status: 'Submitted', at: ago({ days, hours: 2 + i }) }, ...(status !== 'Submitted' ? [{ status, at: ago({ days, hours: i }) }] : [])],
      mapped_payload: {},
    }
  })
}

function seed(): Db {
  return {
    version: VERSION,
    accounts: [
      { email: 'jitendra.k@example.in', password: 'demo1234', role: 'citizen', citizen_id: DEMO_CITIZEN_ID, name: 'Jitendra Katahre' },
      { email: 'priya.d@example.in', password: 'demo1234', role: 'citizen', citizen_id: 'CZN-2026-000217', name: 'Priya Ramesh Deshmukh' },
      { email: 'admin@govconnect.demo', password: 'admin1234', role: 'admin', name: 'Platform Administrator' },
    ],
    citizens: structuredClone(seedCitizens),
    services: structuredClone(seedServices),
    applications: [...structuredClone(seedApplications), ...otherCitizenApplications()],
    consents: structuredClone(seedConsents),
    documents: structuredClone(seedDocuments),
    notifications: structuredClone(seedNotifications),
    integrations: structuredClone(seedIntegrations),
    mappings: structuredClone(seedMappings),
    auditLogs: structuredClone(seedAuditLogs),
    apiEvents: structuredClone(seedApiEvents),
    counters: { applicationsToday: 124, dataRequestsToday: 89, nextApp: 10025, nextId: 1 },
  }
}

let cache: Db | null = null

export function db(): Db {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Db
      if (parsed.version === VERSION) {
        cache = parsed
        return cache
      }
    }
  } catch {
    // Corrupt or unavailable storage — fall through to a fresh seed.
  }
  cache = seed()
  persist()
  return cache
}

export function persist() {
  try {
    if (cache) localStorage.setItem(KEY, JSON.stringify(cache))
  } catch {
    // Storage full or blocked; the demo keeps working in memory.
  }
}

export function resetDb() {
  cache = seed()
  persist()
}

export function nextId(prefix: string): string {
  const d = db()
  d.counters.nextId += 1
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${d.counters.nextId}`
}
