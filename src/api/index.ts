import type {
  Application, ApplicationStatus, AuditLog, Citizen, CitizenDocument, Consent, FieldPath, Notification,
  NotificationType, Service, Session,
} from '@/types'
import { blankCitizen } from '@/data/citizens'
import { hourlyMetrics } from '@/data/platform'
import { maskCitizenId } from '@/lib/fields'
import { mapToTarget, type MappedField } from '@/lib/transform'
import { db, nextId, persist, resetDb } from './mockDb'

/*
 * GovConnect API facade.
 *
 * Every page talks to the platform ONLY through this module. Today each call
 * resolves against the in-browser mock DB with simulated latency. To connect a
 * Node.js/Express backend, set VITE_API_URL and replace each body with
 * `http('/route', ...)` — the function signatures are the contract.
 */

const API_URL = import.meta.env.VITE_API_URL as string | undefined
export const IS_MOCK = !API_URL

const wait = (ms = 250 + Math.random() * 250) => new Promise((r) => setTimeout(r, ms))

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...init,
  })
  if (!res.ok) throw new Error((await res.text()) || `Request failed (${res.status})`)
  return res.json() as Promise<T>
}

export class ApiError extends Error {}

const clone = <T,>(v: T): T => structuredClone(v)
const now = () => new Date().toISOString()

// ---------- internal event helpers (would live server-side) ----------

function audit(entry: Omit<AuditLog, 'log_id' | 'at'>) {
  db().auditLogs.unshift({ ...entry, log_id: nextId('LOG'), at: now() })
}

function notify(citizen_id: string, type: NotificationType, title: string, message: string, link?: string) {
  db().notifications.unshift({
    notification_id: nextId('NTF'), citizen_id, type, title, message, created_at: now(), read: false, link,
  })
}

function apiCall(integration_id: string, method: 'GET' | 'POST', endpoint: string): { ok: boolean; latency: number } {
  const d = db()
  const integ = d.integrations.find((i) => i.integration_id === integration_id)
  const offline = integ?.api_status === 'Offline'
  const latency = integ?.response_time_ms ? Math.round(integ.response_time_ms * (0.85 + Math.random() * 0.4)) : 30000
  d.apiEvents.unshift({
    request_id: nextId('REQ'), at: now(), integration_id, endpoint, method,
    status_code: offline ? 504 : 200, latency_ms: latency,
  })
  if (integ) {
    integ.requests_today += 1
    if (offline) integ.errors_today += 1
    else integ.last_sync = now()
  }
  return { ok: !offline, latency }
}

// ---------- Auth ----------

const SESSION_KEY = 'govconnect.session'

export const auth = {
  current(): Session | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? (JSON.parse(raw) as Session) : null
    } catch {
      return null
    }
  },

  async login(email: string, password: string): Promise<Session> {
    await wait()
    const acc = db().accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase())
    if (!acc || acc.password !== password) throw new ApiError('Incorrect email or password. Please try again.')
    const session: Session = { role: acc.role, citizen_id: acc.citizen_id, email: acc.email, name: acc.name }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    audit({ category: 'auth', action: acc.role === 'admin' ? 'Administrator signed in' : 'Citizen signed in', actor: acc.citizen_id ? maskCitizenId(acc.citizen_id) : 'admin', target: 'GovConnect Portal', outcome: 'success' })
    persist()
    return session
  },

  async register(input: { full_name: string; email: string; phone: string; password: string }): Promise<Session> {
    await wait(500)
    const d = db()
    if (d.accounts.some((a) => a.email.toLowerCase() === input.email.trim().toLowerCase())) {
      throw new ApiError('An account with this email already exists. Try signing in instead.')
    }
    const citizen_id = `CZN-2026-${String(400 + d.citizens.length).padStart(6, '0')}`
    d.citizens.push(blankCitizen({ citizen_id, full_name: input.full_name, email: input.email.trim(), phone: input.phone }))
    d.accounts.push({ email: input.email.trim(), password: input.password, role: 'citizen', citizen_id, name: input.full_name.trim() })
    notify(citizen_id, 'info', 'Welcome to GovConnect', 'Complete your Unified Citizen Profile to discover services you are eligible for.', '/profile')
    audit({ category: 'auth', action: 'New citizen registered', actor: maskCitizenId(citizen_id), target: 'GovConnect Portal', outcome: 'success' })
    persist()
    const session: Session = { role: 'citizen', citizen_id, email: input.email.trim(), name: input.full_name.trim() }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return session
  },

  async requestPasswordReset(email: string): Promise<void> {
    await wait()
    if (!email.includes('@')) throw new ApiError('Enter a valid email address.')
  },

  logout() {
    localStorage.removeItem(SESSION_KEY)
  },
}

// ---------- Citizen ----------

export const citizens = {
  async get(citizen_id: string): Promise<Citizen> {
    await wait(200)
    const c = db().citizens.find((x) => x.citizen_id === citizen_id)
    if (!c) throw new ApiError('Citizen profile not found.')
    return clone(c)
  },

  async update(next: Citizen, opts: { silent?: boolean } = {}): Promise<Citizen> {
    await wait(450)
    const d = db()
    const idx = d.citizens.findIndex((x) => x.citizen_id === next.citizen_id)
    if (idx < 0) throw new ApiError('Citizen profile not found.')
    const updated: Citizen = {
      ...next,
      personal_info: {
        ...next.personal_info,
        full_name: next.personal_info.full_name ||
          [next.personal_info.first_name, next.personal_info.middle_name, next.personal_info.last_name].filter(Boolean).join(' '),
      },
      profile_status: next.profile_status === 'verified' ? 'verified' : 'pending_verification',
      updated_at: now(),
    }
    d.citizens[idx] = updated
    if (!opts.silent) notify(next.citizen_id, 'success', 'Profile successfully updated', 'Your Unified Citizen Profile changes have been saved.', '/profile')
    audit({ category: 'profile', action: 'Profile updated', actor: maskCitizenId(next.citizen_id), target: 'Unified Citizen Profile', outcome: 'success' })
    persist()
    return clone(updated)
  },
}

// ---------- Services ----------

export const services = {
  async list(): Promise<Service[]> {
    await wait(300)
    return clone(db().services)
  },
  async get(service_id: string): Promise<Service> {
    await wait(200)
    const s = db().services.find((x) => x.service_id === service_id)
    if (!s) throw new ApiError('This service could not be found.')
    return clone(s)
  },
}

// ---------- Documents ----------

export const documents = {
  async list(citizen_id: string): Promise<CitizenDocument[]> {
    await wait(250)
    return clone(db().documents.filter((d) => d.citizen_id === citizen_id))
  },

  async upload(citizen_id: string, input: { document_type: string; document_name: string; issuing_authority: string; file_size_kb: number }): Promise<CitizenDocument> {
    await wait(700)
    const d = db()
    const doc: CitizenDocument = {
      ...input, document_id: nextId('DOC'), citizen_id, verification_status: 'Pending Verification', uploaded_at: now(),
    }
    d.documents.unshift(doc)
    d.citizens.find((c) => c.citizen_id === citizen_id)?.documents.push(doc.document_id)
    apiCall('INT-DOC', 'POST', '/verify')
    notify(citizen_id, 'info', 'Document submitted for verification', `${input.document_type} was sent to the Document Verification service.`, '/documents')
    audit({ category: 'document', action: 'Document submitted for verification', actor: maskCitizenId(citizen_id), target: doc.document_id, outcome: 'success' })
    persist()
    return clone(doc)
  },
}

// ---------- Consent ----------

export const consents = {
  async list(citizen_id: string): Promise<Consent[]> {
    await wait(250)
    return clone(db().consents.filter((c) => c.citizen_id === citizen_id))
  },

  async grant(citizen_id: string, service: Service, fields: FieldPath[]): Promise<Consent> {
    await wait(400)
    const d = db()
    // A new grant supersedes any active consent for the same service.
    d.consents.forEach((c) => {
      if (c.citizen_id === citizen_id && c.service_id === service.service_id && c.status === 'active') {
        c.status = 'revoked'
        c.revoked_at = now()
      }
    })
    const consent: Consent = {
      consent_id: nextId('CNS'), citizen_id, service_id: service.service_id, service_name: service.name,
      department: service.department, purpose: service.purpose, fields, status: 'active', granted_at: now(),
      expires_at: new Date(Date.now() + 180 * 86_400_000).toISOString(),
    }
    d.consents.unshift(consent)
    d.counters.dataRequestsToday += 1
    audit({ category: 'consent', action: 'Citizen granted consent', actor: maskCitizenId(citizen_id), target: `${service.department} · ${fields.length} fields`, outcome: 'success' })
    persist()
    return clone(consent)
  },

  async deny(citizen_id: string, service: Service): Promise<void> {
    await wait(250)
    const d = db()
    d.consents.unshift({
      consent_id: nextId('CNS'), citizen_id, service_id: service.service_id, service_name: service.name,
      department: service.department, purpose: service.purpose, fields: [], status: 'denied', granted_at: now(), expires_at: now(),
    })
    audit({ category: 'consent', action: 'Citizen denied consent', actor: maskCitizenId(citizen_id), target: service.department, outcome: 'warning' })
    persist()
  },

  async revoke(consent_id: string): Promise<void> {
    await wait(400)
    const c = db().consents.find((x) => x.consent_id === consent_id)
    if (!c) throw new ApiError('Permission not found.')
    c.status = 'revoked'
    c.revoked_at = now()
    notify(c.citizen_id, 'info', 'Access revoked', `${c.department} can no longer access your data for "${c.purpose}".`, '/permissions')
    audit({ category: 'consent', action: 'Citizen revoked consent', actor: maskCitizenId(c.citizen_id), target: c.department, outcome: 'success' })
    persist()
  },
}

// ---------- Integration layer: fetch + map ----------

export interface ShareResult {
  mapped: MappedField[]
  source_checks: { integration: string; ok: boolean; latency: number }[]
}

export const integrationLayer = {
  /**
   * Pulls consented fields from the unified profile, verifies them against
   * source systems and maps them into the target service's schema.
   */
  async prepare(citizen_id: string, service: Service, fields: FieldPath[]): Promise<ShareResult> {
    await wait(900)
    const d = db()
    const citizen = d.citizens.find((c) => c.citizen_id === citizen_id)
    if (!citizen) throw new ApiError('Citizen profile not found.')

    const source_checks: ShareResult['source_checks'] = []
    if (fields.some((f) => f.startsWith('education.'))) {
      const r = apiCall('INT-EDU', 'GET', '/students/{id}/verify')
      source_checks.push({ integration: 'Education API', ...r })
      audit({ category: 'api', action: r.ok ? 'Education API request successful' : 'Education API request failed', actor: 'Integration Layer', target: 'GET /students/{id}/verify', outcome: r.ok ? 'success' : 'failure' })
    }
    if (fields.some((f) => f.startsWith('financial_info.') || f.startsWith('social_info.'))) {
      const r = apiCall('INT-DOC', 'GET', '/documents/{id}/status')
      source_checks.push({ integration: 'Document API', ...r })
      audit({ category: 'api', action: 'Document API status lookup', actor: 'Integration Layer', target: 'GET /documents/{id}/status', outcome: r.latency > 450 ? 'warning' : 'success' })
    }

    const integ = d.integrations.find((i) => i.integration_id === service.integration_id)
    const mapped = mapToTarget(citizen, service, integ?.name ?? service.department, fields, d.mappings)
    audit({ category: 'mapping', action: 'Data mapping completed', actor: 'Mapping Engine', target: `${mapped.length} fields → ${integ?.name ?? service.department}`, outcome: 'success' })
    persist()
    return { mapped, source_checks }
  },
}

// ---------- Applications ----------

export const applications = {
  async list(citizen_id: string): Promise<Application[]> {
    await wait(300)
    return clone(db().applications.filter((a) => a.citizen_id === citizen_id).sort((a, b) => b.submitted_at.localeCompare(a.submitted_at)))
  },

  async get(application_id: string): Promise<Application> {
    await wait(200)
    const a = db().applications.find((x) => x.application_id === application_id)
    if (!a) throw new ApiError('Application not found.')
    return clone(a)
  },

  async submit(input: { citizen_id: string; service: Service; consent_id: string; payload: Record<string, string> }): Promise<Application> {
    await wait(900)
    const d = db()
    const { service } = input
    const r = apiCall(service.integration_id, 'POST', '/applications')
    const integ = d.integrations.find((i) => i.integration_id === service.integration_id)
    d.counters.nextApp += 1
    const app: Application = {
      application_id: `APP-${d.counters.nextApp}`,
      citizen_id: input.citizen_id,
      service_id: service.service_id,
      service_name: service.name,
      department: service.department,
      submitted_at: now(),
      status: 'Submitted',
      consent_id: input.consent_id,
      history: [{
        status: 'Submitted', at: now(),
        note: r.ok
          ? `Delivered to ${integ?.api_name ?? 'department'} in ${r.latency}ms`
          : `${integ?.api_name ?? 'Department system'} is offline — queued for automatic retry`,
      }],
      mapped_payload: input.payload,
    }
    d.applications.unshift(app)
    d.counters.applicationsToday += 1
    audit({ category: 'api', action: r.ok ? `${integ?.api_name} request successful` : `${integ?.api_name} unavailable — queued`, actor: 'Integration Layer', target: 'POST /applications', outcome: r.ok ? 'success' : 'failure' })
    audit({ category: 'application', action: 'Application submitted', actor: maskCitizenId(input.citizen_id), target: `${app.application_id} · ${service.name}`, outcome: 'success' })
    notify(input.citizen_id, 'success', `${service.name} application submitted`, `Your application ${app.application_id} was submitted to ${service.department}.`, `/applications?id=${app.application_id}`)
    persist()
    return clone(app)
  },
}

// ---------- Notifications ----------

export const notifications = {
  async list(citizen_id: string): Promise<Notification[]> {
    await wait(200)
    return clone(db().notifications.filter((n) => n.citizen_id === citizen_id))
  },
  async setRead(notification_id: string, read: boolean): Promise<void> {
    const n = db().notifications.find((x) => x.notification_id === notification_id)
    if (n) n.read = read
    persist()
  },
  async markAllRead(citizen_id: string): Promise<void> {
    db().notifications.forEach((n) => { if (n.citizen_id === citizen_id) n.read = true })
    persist()
  },
}

// ---------- Admin (no citizen PII is returned) ----------

export interface AdminApplicationRow {
  application_id: string
  citizen_ref: string
  service_name: string
  department: string
  submitted_at: string
  status: ApplicationStatus
  fields_shared: number
}

export const admin = {
  async stats() {
    await wait(250)
    const d = db()
    const failing = d.apiEvents.filter((e) => e.status_code >= 400 && Date.now() - new Date(e.at).getTime() < 3_600_000)
    return {
      connectedSystems: d.integrations.length,
      activeApis: d.integrations.filter((i) => i.api_status !== 'Offline').length,
      apiErrors: failing.length,
      applicationsToday: d.counters.applicationsToday,
      dataRequests: d.counters.dataRequestsToday,
      mappingsActive: d.mappings.filter((m) => m.status === 'Active').length,
    }
  },
  async integrations() {
    await wait(250)
    return clone(db().integrations)
  },
  async mappings() {
    await wait(250)
    return clone(db().mappings)
  },
  async auditLogs() {
    await wait(250)
    return clone(db().auditLogs)
  },
  async apiEvents() {
    await wait(250)
    return clone(db().apiEvents)
  },
  async metrics() {
    await wait(300)
    return clone(hourlyMetrics)
  },
  async applications(): Promise<AdminApplicationRow[]> {
    await wait(300)
    return db().applications
      .map((a) => ({
        application_id: a.application_id,
        citizen_ref: maskCitizenId(a.citizen_id),
        service_name: a.service_name,
        department: a.department,
        submitted_at: a.submitted_at,
        status: a.status,
        fields_shared: Object.keys(a.mapped_payload).length,
      }))
      .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at))
  },
  async updateApplicationStatus(application_id: string, status: ApplicationStatus, note?: string): Promise<void> {
    await wait(400)
    const a = db().applications.find((x) => x.application_id === application_id)
    if (!a) throw new ApiError('Application not found.')
    a.status = status
    a.history.push({ status, at: now(), note })
    const type: NotificationType = status === 'Approved' ? 'success' : status === 'Rejected' || status === 'Verification Required' ? 'warning' : 'info'
    notify(a.citizen_id, type, `${a.service_name}: ${status}`, note ?? `Your application ${a.application_id} is now "${status}".`, `/applications?id=${a.application_id}`)
    audit({ category: 'application', action: `Application status → ${status}`, actor: 'Department officer', target: a.application_id, outcome: status === 'Rejected' ? 'warning' : 'success' })
    persist()
  },
  async retryIntegration(integration_id: string): Promise<boolean> {
    await wait(1200)
    const r = apiCall(integration_id, 'GET', '/health')
    audit({ category: 'api', action: r.ok ? 'Health check passed' : 'Health check failed', actor: 'admin', target: integration_id, outcome: r.ok ? 'success' : 'failure' })
    persist()
    return r.ok
  },
  resetDemo() {
    resetDb()
  },
}

export const api = { auth, citizens, services, documents, consents, integrationLayer, applications, notifications, admin }
