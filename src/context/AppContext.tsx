import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { api } from '@/api'
import type { Session } from '@/types'

type ToastKind = 'success' | 'error' | 'info'
interface Toast {
  id: number
  kind: ToastKind
  message: string
}

interface AppContextValue {
  session: Session | null
  login: (email: string, password: string) => Promise<Session>
  register: (input: { full_name: string; email: string; phone: string; password: string }) => Promise<Session>
  logout: () => void
  /** Increments after every mutation so data hooks re-fetch. */
  refreshKey: number
  refresh: () => void
  toast: (message: string, kind?: ToastKind) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => api.auth.current())
  const [refreshKey, setRefreshKey] = useState(0)
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextToast = useRef(1)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const toast = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = nextToast.current++
    setToasts((t) => [...t, { id, kind, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200)
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({
      session,
      refreshKey,
      refresh,
      toast,
      async login(email, password) {
        const s = await api.auth.login(email, password)
        setSession(s)
        return s
      },
      async register(input) {
        const s = await api.auth.register(input)
        setSession(s)
        return s
      },
      logout() {
        api.auth.logout()
        setSession(null)
      },
    }),
    [session, refreshKey, refresh, toast],
  )

  return (
    <AppContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:right-4 sm:left-auto sm:items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-lg"
          >
            {t.kind === 'success' && <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />}
            {t.kind === 'error' && <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />}
            {t.kind === 'info' && <Info className="mt-0.5 size-4 shrink-0 text-brand-600" />}
            <p className="flex-1 text-slate-700">{t.message}</p>
            <button
              onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
