import type { Citizen, CitizenDocument, EligibilityRule, Recommendation, Service } from '@/types'
import { ageFrom, getField } from './fields'

export type RuleResult = 'met' | 'unmet' | 'unknown'

export function evaluateRule(citizen: Citizen, rule: EligibilityRule): RuleResult {
  const raw = getField(citizen, rule.field).trim()
  if (rule.op === 'present') return raw ? 'met' : 'unknown'
  if (!raw) return 'unknown'

  switch (rule.op) {
    case 'eq':
      return raw === String(rule.value) ? 'met' : 'unmet'
    case 'neq':
      return raw !== String(rule.value) ? 'met' : 'unmet'
    case 'in':
      return (rule.value as string[]).includes(raw) ? 'met' : 'unmet'
    case 'lte':
      return Number(raw) <= Number(rule.value) ? 'met' : 'unmet'
    case 'gte':
      return Number(raw) >= Number(rule.value) ? 'met' : 'unmet'
    case 'age_lte':
    case 'age_gte': {
      const age = ageFrom(raw)
      if (age === null) return 'unknown'
      return (rule.op === 'age_lte' ? age <= Number(rule.value) : age >= Number(rule.value)) ? 'met' : 'unmet'
    }
  }
}

/** True if the citizen holds a verified document satisfying a required document name. */
function hasVerifiedDoc(required: string, docs: CitizenDocument[]): boolean {
  const r = required.toLowerCase()
  return docs.some(
    (d) =>
      d.verification_status === 'Verified' &&
      (r.includes(d.document_type.toLowerCase()) || d.document_type.toLowerCase().includes(r)),
  )
}

export function evaluateService(citizen: Citizen, service: Service, docs: CitizenDocument[]): Recommendation {
  const matched: string[] = []
  const unmet: string[] = []
  let metWeight = 0
  let totalWeight = 0
  let unknownCount = 0

  for (const rule of service.eligibility_rules) {
    totalWeight += rule.weight
    const r = evaluateRule(citizen, rule)
    if (r === 'met') {
      metWeight += rule.weight
      matched.push(rule.label)
    } else if (r === 'unknown') {
      unknownCount++
      unmet.push(`${rule.label} — add to your profile`)
    } else {
      unmet.push(rule.label)
    }
  }

  // Rules make up 85% of the score; verified supporting documents the other 15%.
  const docs_ok = service.required_documents.filter((d) => hasVerifiedDoc(d, docs)).length
  const docRatio = service.required_documents.length ? docs_ok / service.required_documents.length : 1
  const ruleRatio = totalWeight ? metWeight / totalWeight : 0
  const score = Math.round(ruleRatio * 85 + docRatio * 15)

  return {
    service,
    score,
    matched,
    unmet,
    eligible: unmet.length === 0 && unknownCount === 0,
  }
}

/**
 * Recommendation engines are pluggable. The rule-based engine below runs
 * entirely client-side; an AI/ML engine (e.g. served from the backend) can
 * implement the same interface and be swapped in via `activeEngine`.
 */
export interface RecommendationEngine {
  id: string
  label: string
  recommend(citizen: Citizen, services: Service[], docs: CitizenDocument[]): Promise<Recommendation[]>
}

export const ruleBasedEngine: RecommendationEngine = {
  id: 'rules-v1',
  label: 'Rule-based eligibility engine (v1)',
  async recommend(citizen, services, docs) {
    return services
      .filter((s) => s.is_scheme && s.status !== 'Closed')
      .map((s) => evaluateService(citizen, s, docs))
      .sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.score - a.score)
  },
}

export const activeEngine: RecommendationEngine = ruleBasedEngine
