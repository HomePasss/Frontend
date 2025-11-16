// CHANGE: Investment wizard now operates on houses coming from HouseRepository.
// WHY: Mirrors the Compose flow, which starts from a House id and loads details before collecting amounts.
// REF: user-message-4
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/ui/screens/InvestmentFlowScreen.kt

// CHANGE: Added investment flow parity pieces (gallery pagination, slider wizard, payments) to match the Compose layout exactly.
// WHY: The user explicitly requested a 1:1 replica of the KMP flow, so the web port must expose the same structure and state transitions.
// QUOTE(TЗ): "Вот эта страница должна выглядеть вот так (Как на изображении)"
// REF: user-message-47
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/ui/screens/PropertyDetailsScreen.kt
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { houseRepository } from '../data/houseRepository'
import { useDashboardData } from '../state/dashboardDataStore'
import { formatCurrencyRubles, formatPercent } from '../utils/formatters'
import type { House } from '../models/types'
import { ArrowLeft, ArrowRight, House as HouseIcon, Ruler, TrendUp } from 'phosphor-react'
import { usePropertyShares } from '../solana/hooks/usePropertyShares'
import { resolveBlockchainPropertyId } from '../solana/propertyMapping'

/**
 * Multi-step CTA guiding the user through the property investment.
 * @returns React element.
 */
export const InvestmentFlowScreen = () => {
  const { listingId } = useParams()
  const { houses, isLoading } = useDashboardData()
  const navigate = useNavigate()
  const [amount, setAmount] = useState(100)
  // CHANGE: Track hero carousel index and wizard steps per listing to mirror KMP navigation affordances.
  // WHY: Without explicit state the hero carousel stayed static and multi-step flow would reset across rerenders.
  // QUOTE(TЗ): "Посомтри как эти окна были реализованы в KMP"
  // REF: user-message-48
  // SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/ui/screens/PropertyDetailsScreen.kt
  const [heroIndexes, setHeroIndexes] = useState<Record<string, number>>({})
  const [flowSteps, setFlowSteps] = useState<Record<string, number>>({})
  const [remoteHouseState, setRemoteHouseState] = useState<{ id: number | null; house: House | null }>({
    id: null,
    house: null,
  })
  // CHANGE: Wire Anchor property_shares client so the checkout mints SPL shares instead of sending SOL.
  // WHY: The requirement now is to interact with the deployed contracts and mint tokens for each investment.
  // QUOTE(TЗ): "Надо сделать что бы мы всё минтили"
  // REF: user-message-61
  const { publicKey } = useWallet()
  const {
    buyShares,
    properties: onChainProperties,
    loading: isOnChainLoading,
    error: onChainError,
  } = usePropertyShares()
  const [isPaying, setIsPaying] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [txSignature, setTxSignature] = useState<string | null>(null)
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
  const heroImages = house?.images?.length ? house.images : ['https://placehold.co/600x400/0a2b27/efefef?text=Property']
  const propertyChainId = resolveBlockchainPropertyId(parsedId)
  const onChainView =
    propertyChainId !== null
      ? onChainProperties.find((view) => view.config.propertyId === propertyChainId) ?? null
      : null
  const requestedShares =
    onChainView && onChainView.pricePerShareUi > 0 ? Math.max(1, Math.floor(amount / onChainView.pricePerShareUi)) : null
  const requiredUsdc = requestedShares && onChainView ? requestedShares * onChainView.pricePerShareUi : null
  const walletUsdcBalance =
    onChainView && onChainView.userUsdcBalance > 0n ? Number(onChainView.userUsdcBalance) / 1_000_000 : null
  const persistHeroIndex = (nextIndex: number) => {
    setHeroIndexes((previous) => ({ ...previous, [listingKey]: nextIndex }))
  }
  const persistStep = (nextStep: number) => {
    setFlowSteps((previous) => ({ ...previous, [listingKey]: nextStep }))
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

  useEffect(() => {
    setPaymentError(null)
    setIsPaying(false)
    setTxSignature(null)
  }, [listingKey])

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
  const formattedMinShare = formatCurrencyRubles(Math.max(price * 0.01, 1))
  const documents = [
    { id: 'ownership', label: 'Shared ownership agreement' },
    { id: 'egrn', label: 'EGRN extract' },
    { id: 'passport', label: 'Investment passport' },
  ] as const
  const walletAddress = publicKey?.toBase58() ?? null

  const handleNext = async () => {
    if (step < 2) {
      persistStep(step + 1)
    } else {
      if (!publicKey) {
        setPaymentError('Connect a Solana wallet before continuing.')
        return
      }
      if (!propertyChainId) {
        setPaymentError('This listing is not mapped to a Solana property yet.')
        return
      }
      if (!onChainView || !onChainView.isInitialized) {
        setPaymentError('The Solana property state is still loading. Try again shortly.')
        return
      }
      if (onChainView.pricePerShareUi <= 0 || requestedShares === null) {
        setPaymentError('Share price is not available for this property.')
        return
      }
      const sharesAsBigInt = BigInt(requestedShares)
      if (onChainView.availableShares < sharesAsBigInt) {
        setPaymentError('Not enough shares are available on-chain. Please lower the amount.')
        return
      }
      const requiredMicroUsdc = sharesAsBigInt * BigInt(onChainView.config.pricePerShare)
      if (onChainView.userUsdcBalance < requiredMicroUsdc) {
        setPaymentError('You do not have enough USDC on Solana to cover this purchase.')
        return
      }
      setIsPaying(true)
      setPaymentError(null)
      try {
        const signature = await buyShares(propertyChainId, requestedShares)
        setTxSignature(signature)
        navigate(`/invest/success/${house.id}`, {
          state: {
            listingId,
            investmentAmount: amount,
            propertyTitle: house.name,
            sharePercentage,
            txSignature: signature,
          },
        })
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Payment failed, try again.'
        setPaymentError(reason)
      } finally {
        setIsPaying(false)
      }
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
    const sanitized = Number.isFinite(value) ? Math.max(1, Math.min(value, price)) : 1
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
                min={1}
                step={1}
                value={Math.round(amount)}
                onChange={(event) => handleAmountChange(Number(event.target.value))}
              />
              <p className="muted">Minimum entry {formatCurrencyRubles(1)}</p>
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
            <div className="flow-grid flow-payment__grid">
              <div>
                <span>Network</span>
                <strong>Solana · Devnet</strong>
              </div>
              <div>
                <span>Property</span>
                <strong>{propertyChainId ?? 'Unmapped'}</strong>
              </div>
            </div>
            <div className="flow-grid flow-payment__grid">
              <div>
                <span>Share price</span>
                <strong>
                  {onChainView ? `${onChainView.pricePerShareUi.toFixed(2)} USDC` : isOnChainLoading ? 'Loading…' : '—'}
                </strong>
              </div>
              <div>
                <span>Requested shares</span>
                <strong>
                  {requestedShares !== null ? requestedShares : onChainView ? 'Adjust amount' : '—'}
                </strong>
              </div>
            </div>
            <div className="flow-grid flow-payment__grid">
              <div>
                <span>Wallet USDC</span>
                <strong>{walletUsdcBalance !== null ? `${walletUsdcBalance.toFixed(2)} USDC` : '—'}</strong>
              </div>
              <div>
                <span>Required</span>
                <strong>{requiredUsdc !== null ? `${requiredUsdc.toFixed(2)} USDC` : '—'}</strong>
              </div>
            </div>
            <div className="flow-payment__wallet">
              <span>Wallet</span>
              <strong>{walletAddress ? `${walletAddress.slice(0, 4)}…${walletAddress.slice(-4)}` : 'Not connected'}</strong>
            </div>
            <div className="flow-payment__connect">
              <WalletMultiButton />
            </div>
            <p className="muted">
              Confirm the transaction in your wallet to mint property shares. Only mapped listings can interact with the
              contract.
            </p>
            {onChainError && <p className="app__error">{onChainError}</p>}
            {paymentError && <p className="app__error">{paymentError}</p>}
            {txSignature && (
              <p className="muted">
                Transaction{' '}
                <a href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`} target="_blank" rel="noreferrer">
                  {txSignature.slice(0, 8)}…{txSignature.slice(-8)}
                </a>
              </p>
            )}
          </div>
        )}

        <div className="flow-card__actions">
          <button type="button" className="btn btn--ghost" onClick={handlePrev}>
            Back
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => void handleNext()}
            disabled={
              step === 2 &&
              (!publicKey ||
                isPaying ||
                isOnChainLoading ||
                propertyChainId === null ||
                onChainView === null ||
                requestedShares === null)
            }
          >
            {step === 2 ? (isPaying ? 'Processing…' : 'Mint shares') : 'Continue'}
          </button>
        </div>
      </article>
    </section>
  )
}
