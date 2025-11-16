// CHANGE: Verified the portfolio calculation mirrors HomeViewModel fallback logic.
// WHY: Ensures the port stays faithful to the Kotlin implementation when no API totals are available.
// REF: user-message-4
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/viewmodel/HomeViewModel.kt

import { describe, expect, it } from 'vitest'
import type { House } from '../models/types'
import { calculatePortfolioData } from './houseRepository'

describe('houseRepository helpers (REQ-1)', () => {
  it('falls back to mock total when there are no houses', () => {
    const snapshot = calculatePortfolioData([])
    expect(snapshot.totalValue).toBe(8_450_000)
  })

  it('sums up user house cost when provided', () => {
    const houses: House[] = [
      {
        id: 1,
        name: 'Test',
        address: 'Address',
        images: [],
        cost: 1000,
        description: 'Test',
      },
    ]
    const snapshot = calculatePortfolioData(houses)
    expect(snapshot.totalValue).toBe(1000)
  })
})
