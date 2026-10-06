import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Eye, EyeOff, ShieldCheck, UserRound } from 'lucide-react'
import Logo from '@/components/Logo'
import Modal from '@/components/Modal'
import { Spinner } from '@/components/ui'
import { useApp } from '@/context/AppContext'
import { api } from '@/api'

function AuthFrame({ title, subtitle, children, aside }: { title: string; subtitle: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-start justify-center bg-canvas px-4 py-10 sm:items-center">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-[1fr_1.1fr]">
        <div className="hidden flex-col justify-between bg-brand-800 p-8 text-white md:flex">
          <Logo invert />
          <div>
            <h2 className="text-2xl font-bold">One Profile.<br />Multiple Services.</h2>
            <ul className="mt-6 space-y-3 text-sm text-brand-100">
              {['Fill in your details once', 'Share only what you approve', 'Track every application in one place'].map((t) => (
                <li key={t} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-300" aria-hidden />{t}</li>
              ))}
            </ul>
          </div>
          {aside ?? <p className="text-xs text-brand-200">Prototype — all data is fictional.</p>}
        </div>
        <div className="p-6 sm:p-10">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      {message}
    </div>
  )
}

function PasswordInput({ id, value, onChange, autoComplete, invalid }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; invalid?: boolean }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input id={id} type={show ? 'text' : 'password'} className="input pr-10" value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} aria-invalid={invalid} required />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600" aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

export function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [forgot, setForgot] = useState(false)

  const submit = async (e: FormEvent, creds?: { email: string; password: string }) => {
    e.preventDefault()
    const c = creds ?? { email, password }
    if (!c.email || !c.password) return setError('Enter your email and password.')
    setBusy(true)
    setError(null)
    try {
      const s = await login(c.email, c.password)
      navigate(from && !from.startsWith('/login') ? from : s.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.')
      setBusy(false)
    }
  }

  return (
    <AuthFrame title="Sign in to GovConnect" subtitle={<>New here? <Link to="/register" className="font-medium text-brand-700 hover:underline">Create an account</Link></>}>
      <FormError message={error} />
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="label">Password</label>
            <button type="button" className="text-xs font-medium text-brand-700 hover:underline" onClick={() => setForgot(true)}>Forgot Password?</button>
          </div>
          <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="current-password" />
        </div>
        <button className="btn-primary w-full py-2.5" disabled={busy}>{busy ? <><Spinner /> Signing in…</> : 'Login'}</button>
      </form>

      <div className="mt-8">
        <div className="relative text-center text-xs text-slate-400">
          <span className="relative z-10 bg-white px-2">Demo accounts</span>
          <div className="absolute inset-x-0 top-1/2 border-t border-slate-200" aria-hidden />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-left hover:border-brand-300 hover:bg-brand-50/50" disabled={busy}
            onClick={(e) => submit(e, { email: 'jitendra.k@example.in', password: 'demo1234' })}>
            <UserRound className="size-5 text-brand-600" aria-hidden />
            <span><span className="block text-sm font-medium text-slate-900">Citizen</span><span className="text-xs text-slate-500">Jitendra Katahre</span></span>
          </button>
          <button className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-left hover:border-brand-300 hover:bg-brand-50/50" disabled={busy}
            onClick={(e) => submit(e, { email: 'admin@govconnect.demo', password: 'admin1234' })}>
            <ShieldCheck className="size-5 text-slate-700" aria-hidden />
            <span><span className="block text-sm font-medium text-slate-900">Administrator</span><span className="text-xs text-slate-500">Platform console</span></span>
          </button>
        </div>
      </div>

      <ForgotPassword open={forgot} onClose={() => setForgot(false)} initialEmail={email} />
    </AuthFrame>
  )
}

function ForgotPassword({ open, onClose, initialEmail }: { open: boolean; onClose: () => void; initialEmail: string }) {
  const [email, setEmail] = useState(initialEmail)
  const [state, setState] = useState<'idle' | 'busy' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)
  const close = () => { setState('idle'); setError(null); onClose() }

  return (
    <Modal open={open} onClose={close} size="sm" title="Reset your password" description="We'll send a reset link to your registered email.">
      {state === 'sent' ? (
        <div className="py-2 text-center">
          <CheckCircle2 className="mx-auto size-10 text-emerald-600" aria-hidden />
          <p className="mt-3 text-sm text-slate-700">If an account exists for <strong>{email}</strong>, a reset link is on its way.</p>
          <p className="mt-1 text-xs text-slate-500">(Demo: no email is actually sent.)</p>
          <button className="btn-primary mt-5 w-full" onClick={close}>Back to sign in</button>
        </div>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setState('busy')
            try { await api.auth.requestPasswordReset(email); setState('sent') } catch (err) { setError((err as Error).message); setState('idle') }
          }}
        >
          <FormError message={error} />
          <label htmlFor="reset-email" className="label">Email</label>
          <input id="reset-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button className="btn-primary mt-4 w-full" disabled={state === 'busy'}>{state === 'busy' ? <><Spinner /> Sending…</> : 'Send reset link'}</button>
        </form>
      )}
    </Modal>
  )
}

export function Register() {
  const { register } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (form.full_name.trim().split(/\s+/).length < 2) e.full_name = 'Enter your first and last name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address, e.g. name@example.in'
    if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a 10-digit mobile number.'
    if (form.password.length < 8) e.password = 'Use at least 8 characters.'
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setBusy(true)
    setError(null)
    try {
      await register({ full_name: form.full_name, email: form.email, phone: form.phone, password: form.password })
      navigate('/profile?onboarding=1', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
      setBusy(false)
    }
  }

  const field = (k: keyof typeof form, label: string, type = 'text', autoComplete?: string) => (
    <div>
      <label htmlFor={`r-${k}`} className="label">{label}</label>
      {type === 'password' ? (
        <PasswordInput id={`r-${k}`} value={form[k]} onChange={(v) => setForm((f) => ({ ...f, [k]: v }))} autoComplete="new-password" invalid={!!errors[k]} />
      ) : (
        <input id={`r-${k}`} type={type} className="input" value={form[k]} onChange={set(k)} autoComplete={autoComplete} aria-invalid={!!errors[k]} />
      )}
      {errors[k] && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>}
    </div>
  )

  return (
    <AuthFrame title="Create your GovConnect account" subtitle={<>Already registered? <Link to="/login" className="font-medium text-brand-700 hover:underline">Sign in</Link></>}
      aside={<p className="text-xs text-brand-200">Do not enter real Aadhaar or other identity numbers — this is a prototype.</p>}>
      <FormError message={error} />
      <form onSubmit={submit} className="space-y-4" noValidate>
        {field('full_name', 'Full Name', 'text', 'name')}
        <div className="grid gap-4 sm:grid-cols-2">
          {field('email', 'Email', 'email', 'email')}
          {field('phone', 'Phone', 'tel', 'tel')}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {field('password', 'Password', 'password')}
          {field('confirm', 'Confirm Password', 'password')}
        </div>
        <button className="btn-primary w-full py-2.5" disabled={busy}>{busy ? <><Spinner /> Creating account…</> : 'Create account'}</button>
        <p className="text-center text-xs text-slate-500">Next, you'll complete your Unified Citizen Profile.</p>
      </form>
    </AuthFrame>
  )
}
