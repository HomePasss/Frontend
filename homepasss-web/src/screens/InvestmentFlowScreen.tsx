// CHANGE: Investment wizard now operates on houses coming from HouseRepository.
// WHY: Mirrors the Compose flow, which starts from a House id and loads details before collecting amounts.
// REF: user-message-4
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/ui/screens/InvestmentFlowScreen.kt

// CHANGE: Added investment flow parity pieces (gallery pagination, slider wizard, payments) to match the Compose layout exactly.
// WHY: The user explicitly requested a 1:1 replica of the KMP flow, so the web port must expose the same structure and state transitions.
// QUOTE(TЗ): "Вот эта страница должна выглядеть вот так (Как на изображении)"
// REF: user-message-47
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/ui/screens/PropertyDetailsScreen.kt
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { houseRepository } from '../data/houseRepository'
import { useDashboardData } from '../state/dashboardDataStore'
import { formatCurrencyRubles, formatPercent } from '../utils/formatters'
import type { House } from '../models/types'
import { ArrowLeft, ArrowRight, House as HouseIcon, Ruler, TrendUp } from 'phosphor-react'

/**
 * Multi-step CTA guiding the user through the property investment.
 * @returns React element.
 */
export const InvestmentFlowScreen = () => {
  const { listingId } = useParams()
  const { houses, isLoading } = useDashboardData()
  const navigate = useNavigate()
  const [amount, setAmount] = useState(50_000)
  // CHANGE: Track hero carousel index and payment selection to mirror KMP navigation affordances.
  // WHY: Without explicit state the hero carousel stayed static and no payment option could be highlighted, diverging from reference invariants.
  // QUOTE(TЗ): "Посомтри как эти окна были реализованы в KMP"
  // REF: user-message-48
  // SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/ui/screens/PropertyDetailsScreen.kt
  const [heroIndexes, setHeroIndexes] = useState<Record<string, number>>({})
  const [flowSteps, setFlowSteps] = useState<Record<string, number>>({})
  const [paymentSelections, setPaymentSelections] = useState<Record<string, 'apple_pay' | 'card' | 'bank'>>({})
  const [remoteHouseState, setRemoteHouseState] = useState<{ id: number | null; house: House | null }>({
    id: null,
    house: null,
  })
  const parsedId = listingId ? Number(listingId) : null
  const listingKey = listingId ?? 'unknown'
  const cachedHouse = useMemo(() => {
    if (!parsedId) {
      return null
    }
    return houses.find((item) => item.id === parsedId) ?? null
  }, [houses, parsedId])
  const house = cachedHouse ?? (remoteHouseState.id === parsedId ? remoteHouseState.house : null)
  const isLoadingDetails = Boolean(parsedId && !cachedHouse && remoteHouseState.id !== parsedId)
  const heroIndex = heroIndexes[listingKey] ?? 0
  const step = flowSteps[listingKey] ?? 0
  const paymentMethod = paymentSelections[listingKey] ?? 'apple_pay'
  const heroImages = house?.images?.length ? house.images : ['https://placehold.co/600x400/0a2b27/efefef?text=Property']
  const persistHeroIndex = (nextIndex: number) => {
    setHeroIndexes((previous) => ({ ...previous, [listingKey]: nextIndex }))
  }
  const persistStep = (nextStep: number) => {
    setFlowSteps((previous) => ({ ...previous, [listingKey]: nextStep }))
  }
  const persistPayment = (method: 'apple_pay' | 'card' | 'bank') => {
    setPaymentSelections((previous) => ({ ...previous, [listingKey]: method }))
  }

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
        <div className="card card--centered">Loading property…</div>
      </section>
    )
  }

  if (!house) {
    return (
      <section className="screen">
        <div className="card card--centered">Property not found.</div>
      </section>
    )
  }

  const price = house.cost ?? 1
  const sharePercentage = Math.min((amount / price) * 100, 100)
  const expectedIncome = amount * 0.08
  const investorsCount = house.tokens ?? 247
  const availableShare = 15
  const projectedIncome = formatCurrencyRubles(price * 0.125)
  const formattedMinShare = formatCurrencyRubles(Math.max(price * 0.05, 10_000))
  const documents = [
    { id: 'ownership', label: 'Shared ownership agreement' },
    { id: 'egrn', label: 'EGRN extract' },
    { id: 'passport', label: 'Investment passport' },
  ] as const

  const handleNext = () => {
    if (step < 2) {
      persistStep(step + 1)
    } else {
      navigate(`/invest/success/${house.id}`, {
        state: {
          listingId,
          investmentAmount: amount,
          propertyTitle: house.name,
          sharePercentage,
        },
      })
    }
  }

  const handlePrev = () => {
    if (step === 0) {
      navigate(-1)
    } else {
      persistStep(Math.max(0, step - 1))
    }
  }

  const handleHeroNav = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const nextIndex = heroIndex === 0 ? heroImages.length - 1 : heroIndex - 1
      persistHeroIndex(nextIndex)
      return
    }
    const nextIndex = heroIndex === heroImages.length - 1 ? 0 : heroIndex + 1
    persistHeroIndex(nextIndex)
  }

  const handleAmountChange = (value: number) => {
    const sanitized = Number.isFinite(value) ? Math.max(10_000, Math.min(value, price)) : 10_000
    setAmount(sanitized)
  }

  return (
    <section className="screen screen--mobile property-flow">
      <div className="property-flow__hero">
        <img src={heroImages[heroIndex]} alt={house.name} loading="lazy" />
        <button
          type="button"
          className="property-flow__nav property-flow__nav--prev"
          aria-label="Previous photo"
          onClick={() => handleHeroNav('prev')}
        >
          <ArrowLeft size={24} weight="bold" />
        </button>
        <button
          type="button"
          className="property-flow__nav property-flow__nav--next"
          aria-label="Next photo"
          onClick={() => handleHeroNav('next')}
        >
          <ArrowRight size={24} weight="bold" />
        </button>
        <div className="property-flow__dots" role="tablist" aria-label="Property photos">
          {heroImages.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`property-flow__dot ${index === heroIndex ? 'active' : ''}`}
              aria-label={`Show photo ${index + 1}`}
              aria-pressed={index === heroIndex}
              onClick={() => persistHeroIndex(index)}
            />
          ))}
        </div>
        <button
          type="button"
          className="property-flow__close"
          aria-label="Go back"
          onClick={() => navigate(-1)}
        >
          ✕
        </button>
      </div>

      <div className="card property-flow__summary">
        <h1>{house.name}</h1>
        <p className="muted">📍 {house.address}</p>
        <div className="property-flow__metrics">
          <div>
            <HouseIcon size={24} />
            <div>
              <span className="eyebrow">Bedrooms</span>
              <strong>3</strong>
            </div>
          </div>
          <div>
            <Ruler size={24} />
            <div>
              <span className="eyebrow">Area</span>
              <strong>{house.area ?? 145} m²</strong>
            </div>
          </div>
          <div>
            <TrendUp size={24} />
            <div>
              <span className="eyebrow">Yield</span>
              <strong>12.5%</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="card property-flow__info">
        <div className="property-flow__info-row">
          <span>Minimum share</span>
          <strong>{formattedMinShare}</strong>
        </div>
        <div className="property-flow__info-row">
          <span>Current investors</span>
          <strong>{investorsCount}</strong>
        </div>
        <div className="property-flow__info-row">
          <span>Available</span>
          <strong>{availableShare}%</strong>
        </div>
        <div className="property-flow__info-row">
          <span>Projected income / year</span>
          <strong>{projectedIncome}</strong>
        </div>
      </div>

      <div className="card property-flow__description">
        <h2>Description</h2>
        <p>{house.description}</p>
      </div>

      <div className="property-flow__cta">
        <button type="button" className="btn btn--ghost" onClick={() => navigate(`/listings/${house.id}`)}>
          Full purchase
        </button>
        <button type="button" className="btn" onClick={() => persistStep(0)}>
          Invest
        </button>
      </div>

      <article className="card flow-card">
        <div className="flow-card__header">
          <p className="eyebrow">Investment flow</p>
          <span>Step {step + 1} of 3</span>
        </div>

        {step === 0 && (
          <div className="flow-slider">
            <div className="flow-slider__value">
              <strong>{formatPercent(sharePercentage)}</strong>
              <span>Share of ownership</span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={Math.max(5, Math.round(sharePercentage))}
              onChange={(event) => {
                const percent = Number(event.target.value)
                handleAmountChange((price * percent) / 100)
              }}
            />
            <div className="flow-slider__labels">
              <span>5%</span>
              <span>100%</span>
            </div>
            <div className="flow-grid">
              <div>
                <span>Amount</span>
                <strong>{formatCurrencyRubles(amount)}</strong>
              </div>
              <div>
                <span>Income / year</span>
                <strong>{formatCurrencyRubles(expectedIncome)}</strong>
              </div>
            </div>
            <div className="field-group">
              <label htmlFor="amount">Or enter specific amount</label>
              <input
                id="amount"
                type="number"
                min={10_000}
                step={5_000}
                value={Math.round(amount)}
                onChange={(event) => handleAmountChange(Number(event.target.value))}
              />
              <p className="muted">Minimum entry {formatCurrencyRubles(10_000)}</p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flow-review">
            <div>
              <span>Property</span>
              <strong>{house.name}</strong>
            </div>
            <div>
              <span>Share</span>
              <strong>{formatPercent(sharePercentage)}</strong>
            </div>
            <div>
              <span>Amount</span>
              <strong>{formatCurrencyRubles(amount)}</strong>
            </div>
            <div>
              <span>Platform commission</span>
              <strong>{formatCurrencyRubles(amount * 0.01)}</strong>
            </div>
            <div>
              <span>Total to pay</span>
              <strong>{formatCurrencyRubles(amount * 1.01)}</strong>
            </div>
            <ul className="flow-documents">
              {documents.map((document) => (
                <li key={document.id}>{document.label}</li>
              ))}
            </ul>
          </div>
        )}

        {step === 2 && (
          <div className="flow-payment">
            <button
              type="button"
              className={`flow-payment__option ${paymentMethod === 'apple_pay' ? 'flow-payment__option--active' : ''}`}
              onClick={() => persistPayment('apple_pay')}
            >
              <div>
                <strong>Apple Pay</strong>
                <span>Recommended</span>
              </div>
              <span>Tap to pay</span>
            </button>
            <button
              type="button"
              className={`flow-payment__option ${paymentMethod === 'card' ? 'flow-payment__option--active' : ''}`}
              onClick={() => persistPayment('card')}
            >
              <div>
                <strong>Bank card</strong>
                <span>Visa / MasterCard</span>
              </div>
              <span>•••• 4242</span>
            </button>
            <button
              type="button"
              className={`flow-payment__option ${paymentMethod === 'bank' ? 'flow-payment__option--active' : ''}`}
              onClick={() => persistPayment('bank')}
            >
              <div>
                <strong>Bank transfer</strong>
                <span>Manual approval</span>
              </div>
              <span>1-2 business days</span>
            </button>
            <p className="flow-security">All payments are protected with a secure gateway.</p>
          </div>
        )}

        <div className="flow-card__actions">
          <button type="button" className="btn btn--ghost" onClick={handlePrev}>
            Back
          </button>
          <button type="button" className="btn" onClick={handleNext}>
            {step === 2 ? 'Confirm' : 'Continue'}
          </button>
        </div>
      </article>
    </section>
  )
}
