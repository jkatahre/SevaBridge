import type { Application, CitizenDocument, Consent, Notification } from '@/types'
import { DEMO_CITIZEN_ID } from './citizens'
import { ago, ahead } from './time'

const C = DEMO_CITIZEN_ID

export const seedDocuments: CitizenDocument[] = [
  { document_id: 'DOC-1001', citizen_id: C, document_type: 'Income Certificate', document_name: 'income_certificate_2026.pdf', verification_status: 'Verified', issuing_authority: 'Tehsil Office, Jabalpur (Demo)', uploaded_at: ago({ days: 58 }), file_size_kb: 412 },
  { document_id: 'DOC-1002', citizen_id: C, document_type: 'Marksheet', document_name: 'btech_sem4_marksheet.pdf', verification_status: 'Verified', issuing_authority: 'Indira Gandhi Engineering College', uploaded_at: ago({ days: 40 }), file_size_kb: 286 },
  { document_id: 'DOC-1003', citizen_id: C, document_type: 'Domicile Certificate', document_name: 'domicile_mp.pdf', verification_status: 'Verified', issuing_authority: 'Revenue Department (Demo)', uploaded_at: ago({ days: 57 }), file_size_kb: 365 },
  { document_id: 'DOC-1004', citizen_id: C, document_type: 'Caste Certificate', document_name: 'caste_certificate_obc.pdf', verification_status: 'Verified', issuing_authority: 'SDM Office, Jabalpur (Demo)', uploaded_at: ago({ days: 57 }), file_size_kb: 301 },
  { document_id: 'DOC-1005', citizen_id: C, document_type: 'Class 12 Marksheet', document_name: 'class12_marksheet.pdf', verification_status: 'Verified', issuing_authority: 'State Board of Secondary Education (Demo)', uploaded_at: ago({ days: 62 }), file_size_kb: 254 },
  { document_id: 'DOC-1006', citizen_id: C, document_type: 'Bonafide Certificate', document_name: 'bonafide_2026_27.pdf', verification_status: 'Pending Verification', issuing_authority: 'Indira Gandhi Engineering College', uploaded_at: ago({ days: 2 }), file_size_kb: 198 },
]

export const seedApplications: Application[] = [
  {
    application_id: 'APP-10021',
    citizen_id: C,
    service_id: 'SVC-SMS-03',
    service_name: 'State Merit Scholarship (Engineering)',
    department: 'Education Department',
    submitted_at: ago({ days: 12 }),
    status: 'Verification Required',
    consent_id: 'CNS-5003',
    history: [
      { status: 'Submitted', at: ago({ days: 12 }) },
      { status: 'Under Review', at: ago({ days: 10 }), note: 'Assigned to district scholarship officer' },
      { status: 'Verification Required', at: ago({ days: 2 }), note: 'Bonafide certificate for 2026–27 is pending verification' },
    ],
    mapped_payload: {
      student_name: 'Jitendra Katahre',
      college_name: 'INDIRA GANDHI ENGINEERING COLLEGE',
      degree: 'B.Tech',
      cgpa: '8.2',
      domicile_state: 'MP',
    },
  },
  {
    application_id: 'APP-10023',
    citizen_id: C,
    service_id: 'SVC-INT-05',
    service_name: 'Student Internship Programme',
    department: 'Employment Department',
    submitted_at: ago({ days: 4 }),
    status: 'Under Review',
    consent_id: 'CNS-5004',
    history: [
      { status: 'Submitted', at: ago({ days: 4 }) },
      { status: 'Under Review', at: ago({ days: 3 }), note: 'Shortlisting in progress' },
    ],
    mapped_payload: {
      candidate_name: 'Jitendra Katahre',
      dob: '14/03/2005',
      institution: 'Indira Gandhi Engineering College',
      specialisation: 'Information Technology',
      email: 'jitendra.k@example.in',
      preferred_dept: 'IT & e-Governance',
    },
  },
  {
    application_id: 'APP-10018',
    citizen_id: C,
    service_id: 'SVC-INC-09',
    service_name: 'Income Certificate',
    department: 'Certificate System (Revenue)',
    submitted_at: ago({ days: 61 }),
    status: 'Approved',
    consent_id: 'CNS-5001',
    history: [
      { status: 'Submitted', at: ago({ days: 61 }) },
      { status: 'Under Review', at: ago({ days: 60 }) },
      { status: 'Approved', at: ago({ days: 58 }), note: 'Certificate issued and added to your documents' },
    ],
    mapped_payload: { applicant: 'Jitendra Katahre', district: 'Jabalpur', income: '185000' },
  },
]

export const seedConsents: Consent[] = [
  {
    consent_id: 'CNS-5001',
    citizen_id: C,
    service_id: 'SVC-INC-09',
    service_name: 'Income Certificate',
    department: 'Certificate System (Revenue)',
    purpose: 'Income certificate issuance',
    fields: ['personal_info.full_name', 'address.district', 'financial_info.annual_income'],
    status: 'expired',
    granted_at: ago({ days: 61 }),
    expires_at: ago({ days: 31 }),
  },
  {
    consent_id: 'CNS-5002',
    citizen_id: C,
    service_id: 'SVC-SKL-06',
    service_name: 'Skill Development Training Voucher',
    department: 'Employment Department',
    purpose: 'Training batch enrolment',
    fields: ['personal_info.full_name', 'personal_info.date_of_birth', 'contact_info.phone'],
    status: 'revoked',
    granted_at: ago({ days: 30 }),
    revoked_at: ago({ days: 21 }),
    expires_at: ahead(150),
  },
  {
    consent_id: 'CNS-5003',
    citizen_id: C,
    service_id: 'SVC-SMS-03',
    service_name: 'State Merit Scholarship (Engineering)',
    department: 'Education Department',
    purpose: 'Scholarship eligibility verification',
    fields: ['personal_info.full_name', 'education.institution_name', 'education.course', 'education.cgpa', 'social_info.domicile_state'],
    status: 'active',
    granted_at: ago({ days: 12 }),
    expires_at: ahead(168),
  },
  {
    consent_id: 'CNS-5004',
    citizen_id: C,
    service_id: 'SVC-INT-05',
    service_name: 'Student Internship Programme',
    department: 'Employment Department',
    purpose: 'Internship matching',
    fields: ['personal_info.full_name', 'personal_info.date_of_birth', 'education.institution_name', 'education.branch', 'contact_info.email'],
    status: 'active',
    granted_at: ago({ days: 4 }),
    expires_at: ahead(86),
  },
]

export const seedNotifications: Notification[] = [
  { notification_id: 'NTF-9006', citizen_id: C, type: 'announcement', title: 'New scholarship available', message: 'Merit-cum-Means Scholarship for Technical Education is now open. You may be eligible.', created_at: ago({ hours: 5 }), read: false, link: '/services/SVC-MCM-02' },
  { notification_id: 'NTF-9005', citizen_id: C, type: 'warning', title: 'Document requires verification', message: 'Your Bonafide Certificate is pending verification for application APP-10021.', created_at: ago({ days: 2 }), read: false, link: '/documents' },
  { notification_id: 'NTF-9004', citizen_id: C, type: 'info', title: 'Application under review', message: 'Student Internship Programme (APP-10023) is now under review.', created_at: ago({ days: 3 }), read: true, link: '/applications' },
  { notification_id: 'NTF-9003', citizen_id: C, type: 'success', title: 'Profile successfully updated', message: 'Your education details were updated and re-verified.', created_at: ago({ days: 3, hours: 2 }), read: true, link: '/profile' },
  { notification_id: 'NTF-9002', citizen_id: C, type: 'success', title: 'Application submitted', message: 'State Merit Scholarship (Engineering) application APP-10021 was submitted.', created_at: ago({ days: 12 }), read: true, link: '/applications' },
  { notification_id: 'NTF-9001', citizen_id: C, type: 'success', title: 'Income certificate issued', message: 'Your Income Certificate was approved and added to Documents.', created_at: ago({ days: 58 }), read: true, link: '/documents' },
]
