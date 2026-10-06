import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '@/api'
import { useApp } from '@/context/AppContext'
import { computeCompletion } from '@/lib/profileCompletion'

/**
 * Minimal data-fetching hook. Re-runs when deps change or after any mutation
 * (via the global refreshKey). Keeps stale data visible while re-fetching so
 * the UI does not flash skeletons after every action.
 */
export function useApi<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const { refreshKey } = useApp()
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setPending(true)
    fn()
      .then((d) => {
        if (!alive) return
        setData(d)
        setError(null)
      })
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : 'Something went wrong.'))
      .finally(() => alive && setPending(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, refreshKey, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { data, error, loading: pending && data === undefined, refreshing: pending, reload, setData }
}

/** The signed-in citizen's profile, documents and computed completion. */
export function useCitizen() {
  const { session } = useApp()
  const id = session?.citizen_id ?? ''
  const citizen = useApi(() => api.citizens.get(id), [id])
  const docs = useApi(() => api.documents.list(id), [id])
  const completion = useMemo(
    () => (citizen.data && docs.data ? computeCompletion(citizen.data, docs.data) : null),
    [citizen.data, docs.data],
  )
  return {
    citizen: citizen.data,
    documents: docs.data,
    completion,
    loading: citizen.loading || docs.loading,
    error: citizen.error ?? docs.error,
    setCitizen: citizen.setData,
  }
}
