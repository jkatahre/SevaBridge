import type { Citizen, DataMapping, FieldPath, Service, Transformation } from '@/types'
import { getField } from './fields'

export const TRANSFORMATION_LABELS: Record<Transformation, string> = {
  direct: 'Direct copy',
  uppercase: 'To UPPERCASE',
  titlecase: 'To Title Case',
  date_dmy: 'Date → DD/MM/YYYY',
  to_number: 'String → Number',
  code_map: 'Code lookup',
  concat_name: 'Concatenate name parts',
}

const STATE_CODES: Record<string, string> = {
  'Madhya Pradesh': 'MP', Maharashtra: 'MH', 'Uttar Pradesh': 'UP', Rajasthan: 'RJ', Gujarat: 'GJ',
  Karnataka: 'KA', 'Tamil Nadu': 'TN', Delhi: 'DL', Bihar: 'BR', 'West Bengal': 'WB', Kerala: 'KL',
  Telangana: 'TG', 'Andhra Pradesh': 'AP', Odisha: 'OD', Punjab: 'PB', Haryana: 'HR', Chhattisgarh: 'CG',
}

const CODE_TABLES: Partial<Record<FieldPath, Record<string, string>>> = {
  'social_info.category': { General: 'GEN-01', OBC: 'OBC-02', SC: 'SC-03', ST: 'ST-04', EWS: 'EWS-05' },
  'personal_info.gender': { Male: 'M', Female: 'F', Transgender: 'T', 'Prefer not to say': 'U' },
  'education.current_year': { '1st Year': '1', '2nd Year': '2', '3rd Year': '3', '4th Year': '4', '5th Year': '5', Completed: 'C' },
  'social_info.domicile_state': STATE_CODES,
  'address.state': STATE_CODES,
  'financial_info.income_category': { BPL: 'G1', EWS: 'G1', LIG: 'G2', MIG: 'G3', HIG: 'G4' },
}

export function applyTransformation(t: Transformation, value: string, field: FieldPath): string {
  if (!value) return ''
  switch (t) {
    case 'direct':
      return value
    case 'uppercase':
      return value.toUpperCase()
    case 'titlecase':
      return value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    case 'date_dmy': {
      const [y, m, d] = value.split('-')
      return y && m && d ? `${d}/${m}/${y}` : value
    }
    case 'to_number': {
      const n = Number(value)
      return Number.isFinite(n) ? String(n) : value
    }
    case 'code_map':
      return CODE_TABLES[field]?.[value] ?? value
    case 'concat_name':
      return value.trim().replace(/\s+/g, ' ')
  }
}

export interface MappedField {
  standard_field: FieldPath
  target_field: string
  transformation: Transformation
  source_value: string
  mapped_value: string
}

/** Default transformation for a standard field when no explicit rule is registered. */
function defaultTransformation(field: FieldPath): Transformation {
  if (field === 'personal_info.date_of_birth') return 'date_dmy'
  if (CODE_TABLES[field]) return 'code_map'
  if (field === 'education.cgpa' || field === 'financial_info.annual_income') return 'to_number'
  return 'direct'
}

/**
 * Converts consented standard citizen fields into the target system's schema.
 * Uses registered mappings when present, otherwise the service's field_mapping.
 */
export function mapToTarget(
  citizen: Citizen,
  service: Service,
  targetSystem: string,
  fields: FieldPath[],
  mappings: DataMapping[],
  overrides: Partial<Record<FieldPath, string>> = {},
): MappedField[] {
  return fields
    .filter((f) => service.field_mapping[f])
    .map((f) => {
      const target_field = service.field_mapping[f]!
      const registered = mappings.find(
        (m) => m.standard_field === f && m.target_system === targetSystem && m.target_field === target_field && m.status === 'Active',
      )
      const transformation = registered?.transformation ?? defaultTransformation(f)
      const source_value = overrides[f] ?? getField(citizen, f)
      return {
        standard_field: f,
        target_field,
        transformation,
        source_value,
        mapped_value: applyTransformation(transformation, source_value, f),
      }
    })
}
