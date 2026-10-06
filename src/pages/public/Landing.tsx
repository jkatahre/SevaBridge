import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowDown, ArrowRight, BellRing, Building2, CheckCircle2, ClipboardCheck, FileSearch, Fingerprint, Layers,
  Lock, Repeat2, Search, Send, ShieldCheck, Sparkles, UserRound, Workflow, Network,
} from 'lucide-react'
import { MockBadge } from '@/components/ui'

const FLOW = [
  { icon: UserRound, label: 'Citizen Profile', sub: 'One standardized record' },
  { icon: ShieldCheck, label: 'Consent', sub: 'Field-level, revocable' },
  { icon: Layers, label: 'Secure Integration', sub: 'Verify · map · deliver' },
  { icon: Building2, label: 'Government Services', sub: 'Departments receive only what you approve' },
  { icon: ClipboardCheck, label: 'Application Tracking', sub: 'Live status, one place' },
]

const WHY = [
  { icon: Fingerprint, title: 'One Unified Profile', text: 'A single, standardized citizen record reused across every connected department.' },
  { icon: Repeat2, title: 'No Repeated Data Entry', text: 'Applications are pre-filled from your profile. Type your details once, not for every form.' },
  { icon: ShieldCheck, title: 'Consent-Based Data Sharing', text: 'You choose exactly which fields each department may access, and you can revoke access at any time.' },
  { icon: Network, title: 'Connected Government Services', text: 'Fragmented departmental systems talk to each other through one standard data model.' },
  { icon: ClipboardCheck, title: 'Application Tracking', text: 'Follow every application across departments on a single, clear timeline.' },
  { icon: Sparkles, title: 'Personalized Scheme Recommendations', text: 'Discover schemes you are eligible for based on your profile, with clear reasons why.' },
]

const STEPS = [
  { icon: UserRound, title: 'Create your profile', text: 'Register and complete your Unified Citizen Profile once.' },
  { icon: Search, title: 'Discover services', text: 'Browse services and see eligibility matched to your profile.' },
  { icon: ShieldCheck, title: 'Give consent', text: 'Approve the specific fields a department asks for.' },
  { icon: Lock, title: 'Data is securely shared', text: 'GovConnect maps your data to the department\'s own format.' },
  { icon: Send, title: 'Submit application', text: 'Review the pre-filled form and submit in seconds.' },
  { icon: BellRing, title: 'Track status', text: 'Get notified at every stage until a decision is made.' },
]

export default function Landing() {
  const { hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo(0, 0)
  }, [hash])

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-brand-50/70 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(#d9e4f6_1px,transparent_1px)] [background-size:22px_22px] opacity-60" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:py-24">
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-700">
                <Workflow className="size-3.5" aria-hidden />
                Government interoperability platform
              </span>
              <MockBadge label="Prototype" />
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
              One Profile.
              <br />
              <span className="text-brand-700">Multiple Government Services.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              GovConnect securely connects citizens with multiple government services through standardized data,
              consent-based sharing, and a unified application experience.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="btn-primary px-5 py-2.5 text-[15px]">
                Get Started <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link to="/explore" className="btn-secondary px-5 py-2.5 text-[15px]">Explore Services</Link>
              <a href="#how" className="btn-ghost px-5 py-2.5 text-[15px]">How It Works <ArrowDown className="size-4" aria-hidden /></a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-4 text-emerald-600" aria-hidden />Field-level consent</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-4 text-emerald-600" aria-hidden />Full audit trail</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-4 text-emerald-600" aria-hidden />8 connected departments</span>
            </div>
          </div>

          {/* Flow visual */}
          <div className="flex items-center justify-center">
            <div className="card w-full max-w-md p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">How your data flows</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700"><Lock className="size-3" aria-hidden />Encrypted</span>
              </div>
              <ol>
                {FLOW.map((f, i) => (
                  <li key={f.label}>
                    <div className={`flex items-center gap-3 rounded-lg border p-3 ${i === 2 ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-200 bg-white'}`}>
                      <div className={`flex size-9 shrink-0 items-center justify-center rounded-md ${i === 2 ? 'bg-white/15' : 'bg-brand-50 text-brand-700'}`}>
                        <f.icon className="size-[18px]" aria-hidden />
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${i === 2 ? 'text-white' : 'text-slate-900'}`}>{f.label}</div>
                        <div className={`text-xs ${i === 2 ? 'text-brand-100' : 'text-slate-500'}`}>{f.sub}</div>
                      </div>
                    </div>
                    {i < FLOW.length - 1 && (
                      <div className="flex justify-center py-1" aria-hidden><ArrowDown className="size-4 text-slate-300" /></div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section id="why" className="scroll-mt-16 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-semibold tracking-wide text-brand-700 uppercase">Why GovConnect?</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Government services that already know you — only with your permission.</p>
            <p className="mt-3 text-slate-600">
              Today every department keeps its own copy of your data in its own format. GovConnect gives each citizen one
              standardized profile and a consent layer that lets departments interoperate safely.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHY.map((w) => (
              <div key={w.title} className="card p-6">
                <div className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <w.icon className="size-5" aria-hidden />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{w.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="scroll-mt-16 border-y border-slate-200 bg-canvas py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-semibold tracking-wide text-brand-700 uppercase">How it works</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">From profile to decision in six steps</p>
          </div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card relative p-6">
                <span className="absolute top-5 right-5 text-4xl font-bold text-slate-100 tabular-nums" aria-hidden>{i + 1}</span>
                <div className="flex size-10 items-center justify-center rounded-full bg-brand-700 text-white">
                  <s.icon className="size-5" aria-hidden />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900"><span className="sr-only">Step {i + 1}: </span>{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Interop strip */}
      <section className="py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-brand-700 uppercase">Interoperability, made visible</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Different systems. Different field names. One standard.</p>
            <p className="mt-3 text-slate-600">
              The Education Department calls it <code className="rounded bg-slate-100 px-1 text-sm">student_name</code>, the Scholarship
              Department calls it <code className="rounded bg-slate-100 px-1 text-sm">applicant_name</code>. GovConnect maps both to one
              standard field — so data moves between departments without anyone retyping it.
            </p>
            <Link to="/login" className="btn-secondary mt-6">See the admin data-mapping console <ArrowRight className="size-4" aria-hidden /></Link>
          </div>
          <div className="card p-6">
            {[
              ['student_name', 'full_name', 'applicant_name'],
              ['college_name', 'institution_name', 'institution'],
              ['dob_yyyymmdd', 'date_of_birth', 'dob (DD/MM/YYYY)'],
            ].map(([a, b, c]) => (
              <div key={a} className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 border-b border-slate-100 py-3 text-center last:border-0">
                <code className="truncate rounded-md bg-slate-100 px-2 py-1.5 text-xs text-slate-700">{a}</code>
                <ArrowRight className="size-4 text-slate-300" aria-hidden />
                <code className="truncate rounded-md bg-brand-700 px-2 py-1.5 text-xs font-medium text-white">{b}</code>
                <ArrowRight className="size-4 text-slate-300" aria-hidden />
                <code className="truncate rounded-md bg-emerald-50 px-2 py-1.5 text-xs text-emerald-800">{c}</code>
              </div>
            ))}
            <div className="mt-3 grid grid-cols-3 text-center text-[11px] font-medium text-slate-500">
              <span>Education Dept.</span><span>GovConnect Standard</span><span>Scholarship Dept.</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-7xl rounded-2xl bg-brand-800 px-6 py-12 text-center sm:px-12">
          <FileSearch className="mx-auto size-10 text-brand-200" aria-hidden />
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">One Profile. Multiple Services. Securely Connected.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-brand-100">
            GovConnect enables secure interoperability between fragmented government digital platforms by standardizing citizen data,
            managing consent, mapping data between systems, and providing a unified application experience.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register" className="btn bg-white px-5 py-2.5 text-brand-800 hover:bg-brand-50">Create your profile</Link>
            <Link to="/login" className="btn border border-brand-400 px-5 py-2.5 text-white hover:bg-brand-700">Try the demo account</Link>
          </div>
        </div>
      </section>
    </>
  )
}
