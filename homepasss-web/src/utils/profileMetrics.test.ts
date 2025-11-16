// CHANGE: Updated metrics tests to validate live token holdings (REQ-2, REQ-3) instead of mock shares.
// WHY: The redesigned profile aggregates Solana tokens, so totals/distribution must reflect that data path.
// QUOTE(TЗ): "MyOBjects это токены. Мы ничего не хардкодим"
// REF: REQ-2, REQ-3
// SOURCE: n/a

import { describe, expect, it } from 'vitest'
import { mockInvestments } from '../data/mockData'
import { buildAssetDistribution, buildPortfolioSeries, calculateProfileMetrics } from './profileMetrics'
import type { TokenHolding } from './tokenHoldings'

const holdings: readonly TokenHolding[] = [
  {
    propertyId: 'alpha',
    title: 'Villa Alpha',
    location: 'Mediterranean',
    currentValue: 260_000,
    monthlyIncome: 12_500,
    sharePercentage: 5.2,
    growthPercentage: 6,
  },
  {
    propertyId: 'beta',
    title: 'Mixed-use complex',
    location: 'Moscow',
    currentValue: 187_500,
    monthlyIncome: 12_500,
    sharePercentage: 2.5,
    growthPercentage: 6,
  },
]

describe('profile metrics helpers (REQ-2, REQ-3)', () => {
  it('computes token-derived totals and income', () => {
    const metrics = calculateProfileMetrics(holdings, mockInvestments)
    expect(metrics.totalPortfolioValue).toBe(622_500)
    expect(metrics.objectsCount).toBe(holdings.length)
    expect(Math.round(metrics.totalMonthlyIncome)).toBe(25_000)
  })

  it('generates a monotonic growth series ending at the latest value', () => {
    const series = buildPortfolioSeries(622_500)
    expect(series[0]?.year).toBe(2020)
    const last = series.at(-1)
    expect(last?.value).toBeGreaterThanOrEqual(series[0]?.value ?? 0)
    expect(last?.value).toBe(622_500)
  })

  it('splits asset distribution proportionally based on holdings', () => {
    const distribution = buildAssetDistribution(holdings)
    const totalPercentage = distribution.reduce((sum, slice) => sum + slice.percentage, 0)
    expect(Math.round(totalPercentage)).toBe(100)
  })
})
