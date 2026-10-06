import { useEffect, useState } from 'react'
import type { Citizen, CitizenDocument, Recommendation, Service } from '@/types'
import { activeEngine } from '@/lib/eligibility'

/** Runs the active recommendation engine whenever the profile or catalogue changes. */
export function useRecommendations(citizen?: Citizen, services?: Service[], docs?: CitizenDocument[]) {
  const [recs, setRecs] = useState<Recommendation[] | undefined>()
  useEffect(() => {
    if (!citizen || !services || !docs) return
    let alive = true
    activeEngine.recommend(citizen, services, docs).then((r) => alive && setRecs(r))
    return () => {
      alive = false
    }
  }, [citizen, services, docs])
  return recs
}
