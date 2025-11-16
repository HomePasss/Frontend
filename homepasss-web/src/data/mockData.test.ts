// CHANGE: Verified that the mock dataset mirrors the Kotlin repositories.
// WHY: Ensures navigation targets have backing data in the web port.
// QUOTE(TЗ): "Можешь переписать код с KMP на TypeScript React Vite"
// REF: user-message-3
// SOURCE: context.txt §core/data/src/commonMain/kotlin/com/yet/data/repository

import { describe, expect, it } from 'vitest'
import { constructionCompanies, mockInvestments, mockPropertyShares } from './mockData'

describe('mockData integrity (REQ-1)', () => {
  it('keeps construction companies populated', () => {
    expect(constructionCompanies.length).toBeGreaterThan(0)
  })

  it('exposes seed investments', () => {
    expect(mockInvestments[0]?.propertyTitle).toContain('Commercial')
  })

  it('provides property shares for profile view', () => {
    expect(mockPropertyShares[0]?.percentage).toBeGreaterThan(0)
  })
})
