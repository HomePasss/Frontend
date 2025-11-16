// CHANGE: Added regression tests for the currency/percentage helpers.
// WHY: Guarantees the formatting invariants demanded by the Compose utilities.
// REF: user-message-3
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/utils/formatTwoDecimalCommon.kt

import { describe, expect, it } from 'vitest'
import {
  formatCurrencyRubles,
  formatCurrencyRublesCompact,
  formatNumberWithSpaces,
  formatPercent,
  formatTwoDecimalCommon,
} from './formatters'

describe('formatters', () => {
  it('formats numbers with spaces (REQ-1)', () => {
    expect(formatNumberWithSpaces(1234567)).toBe('1 234 567')
  })

  it('formats currencies with sign and symbol (REQ-1)', () => {
    expect(formatCurrencyRubles(12345.8)).toBe('$12 346')
    expect(formatCurrencyRubles(-2500)).toBe('-$2 500')
    expect(formatCurrencyRublesCompact(2500.2)).toBe('$2500')
  })

  it('formats percentages deterministically (REQ-1)', () => {
    expect(formatPercent(5.678)).toBe('5.68%')
    expect(formatTwoDecimalCommon(1 / 3)).toBe('0.33')
  })
})
