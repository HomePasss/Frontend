// CHANGE: Provider now hydrates React state from the real HouseApi plus the remaining mock datasets.
// WHY: Ensures web screens observe the same remote houses/users that Kotlin fetches via HomeRepositoryImpl.
// QUOTE(TЗ): "Перенеси его 1 в 1"
// REF: user-message-4
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/viewmodel/HomeViewModel.kt

import { useEffect, useRef, useState, type PropsWithChildren } from 'react'
import { constructionCompanies, mockInvestments, mockPropertyShares } from '../data/mockData'
import { calculatePortfolioData, houseRepository } from '../data/houseRepository'
import type { House, PortfolioSnapshot, User } from '../models/types'
import { DashboardDataContext } from './dashboardDataStore'

const DEFAULT_USER_ID = 1

export const DashboardDataProvider = ({ children }: PropsWithChildren) => {
  const [houses, setHouses] = useState<House[]>([])
  const [userHouses, setUserHouses] = useState<House[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioSnapshot | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const isMountedRef = useRef(true)

  const loadData = async (showSpinner: boolean) => {
    if (showSpinner) {
      setIsLoading(true)
    }
    try {
      const [remoteHouses, remoteUserHouses, user] = await Promise.all([
        houseRepository.getHouses(10),
        houseRepository.getUserHouses(DEFAULT_USER_ID, 10),
        houseRepository.getCurrentUser(DEFAULT_USER_ID),
      ])
      if (!isMountedRef.current) {
        return
      }
      setHouses(remoteHouses)
      setUserHouses(remoteUserHouses)
      setCurrentUser(user)
      setPortfolio(calculatePortfolioData(remoteUserHouses))
    } catch (error) {
      console.error('Failed to load dashboard data', error)
      if (!isMountedRef.current) {
        return
      }
      setHouses([])
      setUserHouses([])
      setCurrentUser(null)
      setPortfolio(null)
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    void loadData(false)
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const refresh = () => {
    void loadData(true)
  }

  return (
    <DashboardDataContext.Provider
      value={{
        houses,
        userHouses,
        companies: constructionCompanies,
        investments: mockInvestments,
        propertyShares: mockPropertyShares,
        currentUser,
        portfolio,
        isLoading,
        refresh,
      }}
    >
      {children}
    </DashboardDataContext.Provider>
  )
}
