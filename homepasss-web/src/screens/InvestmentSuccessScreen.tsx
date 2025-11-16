// CHANGE: Success screen resolves its property name via HouseRepository to match the KMP navigation result.
// WHY: Guarantees consistency even on reload, just like InvestmentSuccessScreen pulls from the nav args.
// REF: user-message-4
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/ui/screens/InvestmentSuccessScreen.kt

import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDashboardData } from '../state/dashboardDataStore'
import { formatCurrencyRubles, formatPercent } from '../utils/formatters'
import { houseRepository } from '../data/houseRepository'
import type { House } from '../models/types'

interface SuccessState {
  readonly listingId?: string
  readonly sharePercentage?: number
  readonly investmentAmount?: number
  readonly propertyTitle?: string
}

/**
 * Shows a celebratory confirmation block with final numbers.
 * @returns React element.
 */
export const InvestmentSuccessScreen = () => {
  const location = useLocation()
  const { houses, isLoading } = useDashboardData()
  const navigate = useNavigate()
  const { listingId } = useParams()
  const state = location.state as SuccessState | null
  const [remoteHouseState, setRemoteHouseState] = useState<{ id: number | null; house: House | null }>({
    id: null,
    house: null,
  })
  const targetId = state?.listingId ?? listingId
  const parsedId = targetId ? Number(targetId) : null
  const cachedHouse = useMemo(() => {
    if (!parsedId) {
      return null
    }
    return houses.find((item) => item.id === parsedId) ?? null
  }, [houses, parsedId])
  const house = cachedHouse ?? (remoteHouseState.id === parsedId ? remoteHouseState.house : null)
  const isLoadingDetails = Boolean(parsedId && !cachedHouse && remoteHouseState.id !== parsedId)

  useEffect(() => {
    if (!parsedId || cachedHouse) {
      return
    }
    let active = true
    houseRepository
      .getHouseDetails(parsedId)
      .then((result) => {
        if (active) {
          setRemoteHouseState({ id: parsedId, house: result })
        }
      })
      .catch(() => {
        if (active) {
          setRemoteHouseState({ id: parsedId, house: null })
        }
      })
    return () => {
      active = false
    }
  }, [cachedHouse, parsedId])

  if (isLoading || isLoadingDetails) {
    return (
      <section className="screen">
        <div className="card card--centered">Finalizing transaction…</div>
      </section>
    )
  }

  if (!state?.investmentAmount || !state.sharePercentage || (!house && !state.propertyTitle)) {
    return (
      <section className="screen">
        <div className="card card--centered">Unable to load receipt.</div>
      </section>
    )
  }

  return (
    <section className="screen">
      <article className="card success-card">
        <h1>Investment confirmed 🎉</h1>
        <p className="muted">You are now a co-owner of {house?.name ?? state.propertyTitle}.</p>
        <dl>
          <div>
            <dt>Amount</dt>
            <dd>{formatCurrencyRubles(state.investmentAmount)}</dd>
          </div>
          <div>
            <dt>Share</dt>
            <dd>{formatPercent(state.sharePercentage)}</dd>
          </div>
          <div>
            <dt>Property</dt>
            <dd>{house?.name ?? state.propertyTitle}</dd>
          </div>
        </dl>
        <button type="button" className="btn" onClick={() => navigate('/')}>
          Back to home
        </button>
      </article>
    </section>
  )
}
