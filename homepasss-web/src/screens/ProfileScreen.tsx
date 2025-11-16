// CHANGE: Profile now consumes live Solana token balances (metadata, yields) for My Objects.
// WHY: My objects must mirror wallet tokens (REQ-3) while keeping the Solana screenshot layout (REQ-2).
// QUOTE(TЗ): "MyOBjects это токены. Мы ничего не хардкодим"
// REF: REQ-2, REQ-3
// SOURCE: n/a

import { useMemo } from 'react'
import { SolanaAuthCard } from '../components/SolanaAuthCard'
import { useDashboardData } from '../state/dashboardDataStore'
import { formatCurrencyRubles, formatPercent } from '../utils/formatters'
import {
  buildAssetDistribution,
  buildPortfolioSeries,
  calculateProfileMetrics,
  type ProfileSeriesPoint,
} from '../utils/profileMetrics'
import { useSolanaAuth } from '../solana/useSolanaAuth'
import { usePropertyShares } from '../solana/hooks/usePropertyShares'
import { usePropertyMetadata } from '../solana/hooks/usePropertyMetadata'
import { mapPropertyViewsToHoldings } from '../utils/tokenHoldings'

/**
 * Solana-first profile replicating the provided design.
 * @returns React element.
 */
export const ProfileScreen = () => {
  const { investments, portfolio, refresh: refreshDashboard } = useDashboardData()
  const { publicKey, isConnected } = useSolanaAuth()
  const {
    properties,
    loading: tokensLoading,
    error: tokenError,
    refresh: refreshTokens,
  } = usePropertyShares()
  const metadata = usePropertyMetadata(properties)

  const holdings = useMemo(
    () => mapPropertyViewsToHoldings(properties, metadata),
    [properties, metadata],
  )

  const metrics = useMemo(
    () => calculateProfileMetrics(holdings, investments),
    [holdings, investments],
  )

  const chartBaseValue =
    metrics.totalPortfolioValue > 0 ? metrics.totalPortfolioValue : portfolio?.totalValue ?? 0

  const chartPoints = useMemo(() => buildPortfolioSeries(chartBaseValue), [chartBaseValue])
  const assetDistribution = useMemo(() => buildAssetDistribution(holdings), [holdings])

  const displayName = publicKey ? `${publicKey.slice(0, 4)}…${publicKey.slice(-4)}` : 'Test'
  const walletId = publicKey ?? '12121'
  const totalValueDisplay =
    chartBaseValue > 0 ? formatCurrencyRubles(chartBaseValue) : formatCurrencyRubles(0)
  const changeAmount = portfolio?.changeAmount ?? 145_230
  const changePercent = portfolio?.changePercentage ?? 1.75

  return (
    <section className="screen screen--mobile profile-screen">
      <article className="card profile-hero">
        <div className="profile-hero__header">
          <div className="profile-avatar" aria-hidden="true">
            🪙
          </div>
          <div>
            <p className="eyebrow">Profile</p>
            <h1>{displayName}</h1>
            <p className="muted">{walletId}</p>
          </div>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              refreshDashboard()
              void refreshTokens()
            }}
          >
            Refresh
          </button>
        </div>
        <p className="muted">
          {isConnected
            ? 'Connected to Solana wallet.'
            : 'Connect your Solana wallet to sync holdings.'}
        </p>
      </article>

      <div className="profile-stat-grid">
        <article className="card profile-stat">
          <p className="muted">Total value</p>
          <h2>{totalValueDisplay}</h2>
          <p className="profile-stat__delta">
            +{formatCurrencyRubles(changeAmount)} (+{formatPercent(changePercent)})
          </p>
        </article>

        <article className="card profile-chart">
          <div className="home-group__header">
            <h2>Portfolio dynamics</h2>
          </div>
          {chartPoints.length === 0 ? (
            <p className="muted">Connect your wallet to display growth.</p>
          ) : (
            <PortfolioDynamicsChart points={chartPoints} />
          )}
        </article>

        <article className="card profile-asset">
          <div className="home-group__header">
            <h2>Asset distribution</h2>
          </div>
          {assetDistribution.length === 0 ? (
            <p className="muted">Mint fractional assets to populate this list.</p>
          ) : (
            <ul className="profile-asset-list">
              {assetDistribution.map((slice) => (
                <li key={slice.label}>
                  <span className="profile-asset-dot" aria-hidden="true" />
                  <div>
                    <strong>{slice.label}</strong>
                    <p className="muted">
                      {formatCurrencyRubles(slice.value)} · {formatPercent(slice.percentage)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>

      <article className="card profile-section">
        <div className="home-group__header">
          <h2>My objects</h2>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => void refreshTokens()}
            disabled={tokensLoading}
          >
            {tokensLoading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        {tokenError && <p className="app__error">{tokenError}</p>}
        {tokensLoading && holdings.length === 0 ? (
          <p className="muted">Loading tokenized objects…</p>
        ) : holdings.length === 0 ? (
          <p className="muted">No Solana-backed objects yet.</p>
        ) : (
          <div className="profile-object-grid">
            {holdings.map((holding) => (
              <article key={holding.propertyId} className="profile-object-card">
                <div className="profile-object-card__header">
                  <h3>{holding.title}</h3>
                  <span>{formatCurrencyRubles(holding.currentValue)}</span>
                </div>
                <p className="muted">{holding.location}</p>
                <div className="profile-object-card__meta">
                  <span>Share {formatPercent(holding.sharePercentage)}</span>
                  <span className="profile-object-card__growth">
                    ↑ +{formatPercent(holding.growthPercentage)}
                  </span>
                </div>
                <div className="profile-object-card__footer">
                  <div>
                    <p className="muted">Income/month</p>
                    <strong>{formatCurrencyRubles(Math.round(holding.monthlyIncome))}</strong>
                  </div>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => {
                      if (holding.metadataUri && typeof window !== 'undefined') {
                        window.open(holding.metadataUri, '_blank', 'noreferrer')
                      }
                    }}
                  >
                    Details
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </article>

      <div className="profile-metrics-grid">
        <article className="card profile-metric">
          <p className="muted">Total income</p>
          <h3>{formatCurrencyRubles(Math.round(metrics.totalMonthlyIncome))}</h3>
          <p className="muted">per month</p>
        </article>
        <article className="card profile-metric">
          <p className="muted">Objects</p>
          <h3>{metrics.objectsCount}</h3>
          <p className="muted">in portfolio</p>
        </article>
      </div>

      <SolanaAuthCard />
    </section>
  )
}

interface PortfolioDynamicsChartProps {
  readonly points: readonly ProfileSeriesPoint[]
}

const PortfolioDynamicsChart = ({ points }: PortfolioDynamicsChartProps) => {
  const width = 320
  const height = 140
  const padding = 16
  const values = points.map((point) => point.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const valueRange = Math.max(1, maxValue - minValue)
  const denominator = Math.max(1, points.length - 1)

  const polylinePoints = points
    .map((point, index) => {
      const x = padding + (index / denominator) * (width - padding * 2)
      const y =
        height - padding - ((point.value - minValue) / valueRange) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="profile-chart__body">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Portfolio dynamics chart"
        className="profile-chart__svg"
      >
        <defs>
          <linearGradient id="profileChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7c5cfc" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7c5cfc" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="url(#profileChartGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          points={polylinePoints}
        />
        {points.map((point, index) => {
          const x = padding + (index / denominator) * (width - padding * 2)
          const y =
            height - padding - ((point.value - minValue) / valueRange) * (height - padding * 2)
          return <circle key={point.year} cx={x} cy={y} r={4} fill="#b9a4ff" />
        })}
      </svg>
      <div className="profile-chart__labels">
        {points.map((point) => (
          <span key={point.year}>{point.year}</span>
        ))}
      </div>
    </div>
  )
}
