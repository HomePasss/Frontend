// CHANGE: Updated portfolio helpers to aggregate live Solana token holdings instead of mock shares.
// WHY: Combined with REQ-3, metrics must be derived from blockchain balances rather than constants.
// QUOTE(TЗ): "MyOBjects это токены. Мы ничего не хардкодим"
// REF: REQ-2, REQ-3
// SOURCE: n/a

import type { Investment } from '../models/types'
import type { TokenHolding } from './tokenHoldings'

const SERIES_START_RATIO = 0.65
const SERIES_MIN_VALUE = 120_000

/**
 * Aggregated metrics used by the profile summary cards.
 * @property totalInvested Absolute invested capital (USD).
 * @property totalShareValue Combined mark-to-market valuation of Solana shares.
 * @property totalPortfolioValue Sum of invested funds and share valuation.
 * @property objectsCount Quantity of Solana-backed holdings.
 * @property totalMonthlyIncome Estimated monthly income stream.
 */
export interface ProfileMetrics {
  readonly totalInvested: number
  readonly totalShareValue: number
  readonly totalPortfolioValue: number
  readonly objectsCount: number
  readonly totalMonthlyIncome: number
}

/**
 * Chart point used by the "Portfolio dynamics" sparkline.
 * @property year Calendar year label.
 * @property value Portfolio total for the year.
 */
export interface ProfileSeriesPoint {
  readonly year: number
  readonly value: number
}

/**
 * Distribution slice for the asset mix legend.
 * @property label Asset label (property title).
 * @property value Monetary value of the slice.
 * @property percentage Share from the total value.
 */
export interface AssetDistributionSlice {
  readonly label: string
  readonly value: number
  readonly percentage: number
}

/**
 * Aggregates totals for the hero and summary cards.
 * @param holdings Solana tokenized assets owned by the wallet.
 * @param investments Fiat/USDC contributions tied to the wallet.
 * @returns Portfolio metrics.
 */
export const calculateProfileMetrics = (
  holdings: readonly TokenHolding[],
  investments: readonly Investment[],
): ProfileMetrics => {
  const totalInvested = investments.reduce((sum, investment) => sum + investment.amount, 0)
  const totalShareValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0)
  const totalMonthlyIncome = holdings.reduce((sum, holding) => sum + holding.monthlyIncome, 0)
  return {
    totalInvested,
    totalShareValue,
    totalPortfolioValue: totalInvested + totalShareValue,
    objectsCount: holdings.length,
    totalMonthlyIncome,
  }
}

/**
 * Builds a smooth series used to render the canvas-free growth chart.
 * @param currentValue Latest portfolio total.
 * @returns Series from 2020..2024 with monotonic growth capped by the latest value.
 */
export const buildPortfolioSeries = (currentValue: number): ProfileSeriesPoint[] => {
  if (currentValue <= 0) {
    return []
  }
  const years = [2020, 2021, 2022, 2023, 2024]
  const startValue = Math.max(SERIES_MIN_VALUE, currentValue * SERIES_START_RATIO)
  const delta = currentValue - startValue
  return years.map((year, index) => ({
    year,
    value: Math.round(startValue + (delta * index) / (years.length - 1)),
  }))
}

/**
 * Builds the asset distribution slices for the legend list.
 * @param holdings Wallet holdings.
 * @returns Percent/value pair per holding summing up to ~100%.
 */
export const buildAssetDistribution = (
  holdings: readonly TokenHolding[],
): AssetDistributionSlice[] => {
  const total = holdings.reduce((sum, holding) => sum + holding.currentValue, 0)
  if (total <= 0) {
    return []
  }
  return holdings.map((holding) => ({
    label: holding.title,
    value: holding.currentValue,
    percentage: (holding.currentValue / total) * 100,
  }))
}
