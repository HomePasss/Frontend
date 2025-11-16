// CHANGE: Provider now hydrates React state from the real HouseApi plus the remaining mock datasets.
// WHY: Ensures web screens observe the same remote houses/users that Kotlin fetches via HomeRepositoryImpl.
// QUOTE(TЗ): "Перенеси его 1 в 1"
// REF: user-message-4
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/viewmodel/HomeViewModel.kt

import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react'
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

  const logPrefix = '[DashboardData]'

  const log = useCallback((...args: unknown[]) => {
    console.info(logPrefix, ...args)
  }, [])

  const logError = useCallback((...args: unknown[]) => {
    console.error(logPrefix, ...args)
  }, [])

  const loadData = useCallback(
    async (showSpinner: boolean) => {
      if (showSpinner) {
        setIsLoading(true)
      }
    try {
      log('Fetching houses and user profile…')
      const [remoteHouses, remoteUserHouses, user] = await Promise.all([
        houseRepository
          .getHouses(10)
          .then((houses) => {
            log('getHouses succeeded', { count: houses.length })
            return houses
          })
          .catch((error) => {
            logError('getHouses failed', error)
            throw error
          }),
        houseRepository
          .getUserHouses(DEFAULT_USER_ID, 10)
          .then((houses) => {
            log('getUserHouses succeeded', { count: houses.length })
            return houses
          })
          .catch((error) => {
            logError('getUserHouses failed', error)
            throw error
          }),
        houseRepository
          .getCurrentUser(DEFAULT_USER_ID)
          .then((userData) => {
            log('getCurrentUser succeeded', { id: userData.id })
            return userData
          })
          .catch((error) => {
            logError('getCurrentUser failed', error)
            throw error
          }),
      ])
      if (!isMountedRef.current) {
        log('Component unmounted before state update, aborting')
        return
      }
      log('Loaded data', {
        houses: remoteHouses.length,
        userHouses: remoteUserHouses.length,
        userId: user.id,
      })
      setHouses(remoteHouses)
      setUserHouses(remoteUserHouses)
      setCurrentUser(user)
      setPortfolio(calculatePortfolioData(remoteUserHouses))
    } catch (error) {
      logError('Failed to load dashboard data', error)
      if (!isMountedRef.current) {
        return
      }
      setHouses([])
      setUserHouses([])
      setCurrentUser(null)
      setPortfolio(null)
    } finally {
      if (isMountedRef.current) {
        log('Loading finished')
        setIsLoading(false)
      }
    }
  },
    [log, logError],
  )

  useEffect(() => {
    isMountedRef.current = true
    log('useEffect bootstrap start (mounted = true)')
    void loadData(false)
    return () => {
      log('Cleaning up, marking provider as unmounted')
      isMountedRef.current = false
    }
  }, [loadData, log])

  const refresh = useCallback(() => {
    log('Manual refresh triggered')
    void loadData(true)
  }, [loadData, log])

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
