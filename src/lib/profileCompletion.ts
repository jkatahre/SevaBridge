import type { Citizen, CitizenDocument, ProfileSectionKey } from '@/types'
import { PROFILE_SECTIONS, hasField } from './fields'

/** Document types every citizen is encouraged to keep verified in their vault. */
export const CORE_DOCUMENT_TYPES = [
  'Identity Proof',
  'Income Certificate',
  'Domicile Certificate',
  'Marksheet',
  'Bonafide Certificate',
]

export type SectionState = 'complete' | 'partial' | 'empty'

export interface SectionCompletion {
  key: ProfileSectionKey | 'documents'
  title: string
  filled: number
  total: number
  state: SectionState
  missing: string[]
}

export interface CompletionResult {
  percent: number
  sections: SectionCompletion[]
  missingCount: number
}

function stateOf(filled: number, total: number): SectionState {
  if (total === 0 || filled === total) return 'complete'
  return filled === 0 ? 'empty' : 'partial'
}

/**
 * Profile completion is derived from the actual citizen record: every required
 * field counts as one unit, plus one unit per verified core document type.
 */
export function computeCompletion(citizen: Citizen, documents: CitizenDocument[]): CompletionResult {
  const sections: SectionCompletion[] = PROFILE_SECTIONS.map((s) => {
    const required = s.fields.filter((f) => f.required)
    const missing = required.filter((f) => !hasField(citizen, f.path)).map((f) => f.label)
    const filled = required.length - missing.length
    return { key: s.key, title: s.title, filled, total: required.length, state: stateOf(filled, required.length), missing }
  })

  const verifiedTypes = new Set(
    documents.filter((d) => d.verification_status === 'Verified').map((d) => d.document_type),
  )
  const docMissing = CORE_DOCUMENT_TYPES.filter((t) => !verifiedTypes.has(t))
  const docFilled = CORE_DOCUMENT_TYPES.length - docMissing.length
  // Insert documents before preferences so it reads naturally.
  sections.splice(sections.length - 1, 0, {
    key: 'documents',
    title: 'Documents',
    filled: docFilled,
    total: CORE_DOCUMENT_TYPES.length,
    state: stateOf(docFilled, CORE_DOCUMENT_TYPES.length),
    missing: docMissing.map((t) => `${t} (verified)`),
  })

  const filled = sections.reduce((a, s) => a + s.filled, 0)
  const total = sections.reduce((a, s) => a + s.total, 0)
  return {
    percent: total === 0 ? 0 : Math.round((filled / total) * 100),
    sections,
    missingCount: total - filled,
  }
}
