import type { Citizen } from '@/types'
import { ago } from './time'

// All citizens are fictional. No real identity numbers are stored.

export const DEMO_CITIZEN_ID = 'CZN-2026-000142'

export const seedCitizens: Citizen[] = [
  {
    citizen_id: DEMO_CITIZEN_ID,
    personal_info: {
      full_name: 'Jitendra Katahre',
      first_name: 'Jitendra',
      middle_name: '',
      last_name: 'Katahre',
      date_of_birth: '2005-03-14',
      gender: 'Male',
      nationality: 'Indian',
    },
    contact_info: {
      email: 'jitendra.k@example.in',
      phone: '+91 98260 11420',
      alternate_phone: '',
    },
    address: {
      address_line: '42, Shanti Nagar, Near Govt. Polytechnic',
      city: 'Jabalpur',
      district: 'Jabalpur',
      state: 'Madhya Pradesh',
      pincode: '482001',
    },
    education: {
      highest_qualification: 'B.Tech',
      institution_name: 'Indira Gandhi Engineering College',
      course: 'B.Tech',
      branch: 'Information Technology',
      enrollment_year: '2024',
      passing_year: '2028',
      current_year: '3rd Year',
      current_semester: '5th Semester',
      cgpa: '8.2',
    },
    employment: {
      employment_status: 'Student',
      occupation: 'Student',
      organization: '',
      designation: '',
      experience_years: '',
    },
    financial_info: {
      annual_income: '185000',
      income_category: 'LIG',
    },
    social_info: {
      category: 'OBC',
      domicile_state: 'Madhya Pradesh',
      disability_status: 'None',
    },
    documents: ['DOC-1001', 'DOC-1002', 'DOC-1003', 'DOC-1004', 'DOC-1005', 'DOC-1006'],
    preferences: {
      language: 'English',
      notification_email: true,
      notification_sms: true,
    },
    profile_status: 'verified',
    created_at: ago({ days: 64 }),
    updated_at: ago({ days: 3 }),
  },
  {
    citizen_id: 'CZN-2026-000217',
    personal_info: {
      full_name: 'Priya Ramesh Deshmukh',
      first_name: 'Priya',
      middle_name: 'Ramesh',
      last_name: 'Deshmukh',
      date_of_birth: '1996-08-22',
      gender: 'Female',
      nationality: 'Indian',
    },
    contact_info: { email: 'priya.d@example.in', phone: '+91 90110 27788', alternate_phone: '' },
    address: {
      address_line: 'Flat 7B, Sahyadri Residency, Kothrud',
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '411038',
    },
    education: {
      highest_qualification: 'MBA',
      institution_name: 'Western Institute of Management Studies',
      course: 'MBA',
      branch: 'Finance',
      enrollment_year: '2018',
      passing_year: '2020',
      current_year: 'Completed',
      current_semester: 'Completed',
      cgpa: '7.6',
    },
    employment: {
      employment_status: 'Unemployed',
      occupation: 'Financial Analyst',
      organization: '',
      designation: '',
      experience_years: '4',
    },
    financial_info: { annual_income: '320000', income_category: 'MIG' },
    social_info: { category: 'General', domicile_state: 'Maharashtra', disability_status: 'None' },
    documents: [],
    preferences: { language: 'Marathi', notification_email: true, notification_sms: false },
    profile_status: 'pending_verification',
    created_at: ago({ days: 20 }),
    updated_at: ago({ days: 2 }),
  },
]

/** A brand-new citizen record with only registration details filled in. */
export function blankCitizen(params: { citizen_id: string; full_name: string; email: string; phone: string }): Citizen {
  const parts = params.full_name.trim().split(/\s+/)
  const now = new Date().toISOString()
  return {
    citizen_id: params.citizen_id,
    personal_info: {
      full_name: params.full_name.trim(),
      first_name: parts[0] ?? '',
      middle_name: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
      last_name: parts.length > 1 ? parts[parts.length - 1] : '',
      date_of_birth: '',
      gender: '',
      nationality: 'Indian',
    },
    contact_info: { email: params.email, phone: params.phone, alternate_phone: '' },
    address: { address_line: '', city: '', district: '', state: '', pincode: '' },
    education: {
      highest_qualification: '', institution_name: '', course: '', branch: '', enrollment_year: '',
      passing_year: '', current_year: '', current_semester: '', cgpa: '',
    },
    employment: { employment_status: '', occupation: '', organization: '', designation: '', experience_years: '' },
    financial_info: { annual_income: '', income_category: '' },
    social_info: { category: '', domicile_state: '', disability_status: '' },
    documents: [],
    preferences: { language: 'English', notification_email: true, notification_sms: true },
    profile_status: 'incomplete',
    created_at: now,
    updated_at: now,
  }
}
