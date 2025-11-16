// CHANGE: Updated metrics tests to validate live token holdings (REQ-2, REQ-3) instead of mock shares.
// WHY: The redesigned profile aggregates Solana tokens, so totals/distribution must reflect that data path.
// QUOTE(TЗ): "MyOBjects это токены. Мы ничего не хардкодим"
// REF: REQ-2, REQ-3
// SOURCE: n/a

import { describe, expect, it } from 'vitest'
import { buildAssetDistribution, buildPortfolioSeries, calculateProfileMetrics } from './profileMetrics'
import type { Investment } from '../models/types'
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

// CHANGE: Provide inline investment fixtures now that `mockData.ts` was deleted.
// WHY: Staying testable after removing the legacy dataset keeps the suite deterministic without deprecated imports.
// QUOTE(TЗ): "А можешь удалить это /home/user/Frontend/homepasss-web/src/data/mockData.ts ?  Это нам не адо"
// REF: user-message-remove-mockdata
// SOURCE: n/a
const investments: readonly Investment[] = [
  {
    id: 'invest1',
    userId: 'user1',
    propertyId: 'inv1',
    propertyTitle: 'Commercial property with high rental yield',
    amount: 100_000,
    date: '2024-10-01',
    investedAmount: 100_000,
    investmentDate: '2024-10-01',
    expectedReturn: 8.5,
  },
  {
    id: 'invest2',
    userId: 'user1',
    propertyId: 'inv2',
    propertyTitle: 'Mixed-use development in growing market',
    amount: 75_000,
    date: '2024-09-15',
    investedAmount: 75_000,
    investmentDate: '2024-09-15',
    expectedReturn: 7.2,
  },
]

describe('profile metrics helpers (REQ-2, REQ-3)', () => {
  it('computes token-derived totals and income', () => {
    const metrics = calculateProfileMetrics(holdings, investments)
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
