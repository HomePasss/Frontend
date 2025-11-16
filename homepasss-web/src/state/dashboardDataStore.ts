// CHANGE: Broadened the dashboard store contract to expose API-driven houses alongside the remaining mocks.
// WHY: Screens need unified access to remote houses/user data and static investments/companies.
// QUOTE(TЗ): "Перенеси его 1 в 1"
// REF: user-message-4
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/viewmodel

import { createContext, useContext } from 'react'
import type {
  ConstructionCompany,
  House,
  Investment,
  PortfolioSnapshot,
  PropertyShare,
  User,
} from '../models/types'

export interface DashboardDataContextValue {
  readonly houses: readonly House[]
  readonly userHouses: readonly House[]
  readonly companies: readonly ConstructionCompany[]
  readonly investments: readonly Investment[]
  readonly propertyShares: readonly PropertyShare[]
  readonly currentUser: User | null
  readonly portfolio: PortfolioSnapshot | null
  readonly isLoading: boolean
  refresh(): void
}

export const DashboardDataContext = createContext<DashboardDataContextValue | undefined>(undefined)

export const useDashboardData = (): DashboardDataContextValue => {
  const context = useContext(DashboardDataContext)
  if (!context) {
    throw new Error('useDashboardData must be used within DashboardDataProvider')
  }
  return context
}
