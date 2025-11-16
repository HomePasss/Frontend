// CHANGE: Added the profile screen with user metadata, investments, and share holdings.
// WHY: The Compose ProfileScreen controls auth and financial overview, so we mirror it here.
// QUOTE(TЗ): "Можешь переписать код с KMP на TypeScript React Vite"
// REF: user-message-3
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/ui/screens/ProfileScreen.kt

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDashboardData } from '../state/dashboardDataStore'
import { formatCurrencyRubles, formatIsoDate } from '../utils/formatters'
import { SolanaAuthCard } from '../components/SolanaAuthCard'

/**
 * Shows the authenticated user's information and investments.
 * @returns React element.
 */
export const ProfileScreen = () => {
  const { currentUser, investments: allInvestments, propertyShares: allShares } = useDashboardData()
  const navigate = useNavigate()

  const investments = useMemo(() => {
    if (!currentUser) {
      return []
    }
    return allInvestments.filter((investment) => investment.userId === currentUser.id)
  }, [allInvestments, currentUser])

  const propertyShares = useMemo(() => {
    if (!currentUser) {
      return []
    }
    return allShares.filter((share) => share.ownerId === currentUser.id)
  }, [allShares, currentUser])

  if (!currentUser) {
    return (
      <section className="screen">
        <div className="card card--centered">Пользователь не найден.</div>
      </section>
    )
  }

  return (
    <section className="screen">
      <SolanaAuthCard />
      <div className="card profile-card">
        <div>
          <h1>{currentUser.name}</h1>
          <p className="muted">{currentUser.email}</p>
        </div>
        <dl>
          <div>
            <dt>Роль</dt>
            <dd>{currentUser.userRole}</dd>
          </div>
          <div>
            <dt>Активные инвестиции</dt>
            <dd>{investments.length}</dd>
          </div>
          <div>
            <dt>Доли</dt>
            <dd>{propertyShares.length}</dd>
          </div>
        </dl>
      </div>

      <div className="card">
        <div className="home-group__header">
          <h2>Инвестиции</h2>
        </div>
        {investments.length === 0 ? (
          <p className="muted">Нет недавних операций.</p>
        ) : (
          <ul className="profile-list">
            {investments.map((investment) => (
              <li key={investment.id}>
                <div>
                  <p className="eyebrow">{formatIsoDate(investment.date)}</p>
                  <h3>{investment.propertyTitle}</h3>
                  <p className="muted">Ожидаемая доходность {investment.expectedReturn}%</p>
                </div>
                <div className="profile-list__actions">
                  <strong>{formatCurrencyRubles(investment.amount)}</strong>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() =>
                      navigate(`/invest/success/${investment.propertyId}`, {
                        state: {
                          investmentAmount: investment.amount,
                          listingId: investment.propertyId,
                          propertyTitle: investment.propertyTitle,
                          sharePercentage: investment.expectedReturn,
                        },
                      })
                    }
                  >
                    Чек
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <div className="home-group__header">
          <h2>Доли объектов</h2>
        </div>
        {propertyShares.length === 0 ? (
          <p className="muted">У вас пока нет долей.</p>
        ) : (
          <ul className="profile-list">
            {propertyShares.map((share) => (
              <li key={share.id}>
                <div>
                  <p className="eyebrow">{formatIsoDate(share.purchaseDate)}</p>
                  <h3>{share.propertyTitle}</h3>
                  <p className="muted">Доля {share.percentage}%</p>
                </div>
                <div className="profile-list__actions">
                  <strong>{formatCurrencyRubles(share.currentValue)}</strong>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => navigate(`/listings/${share.propertyId}`)}
                  >
                    Подробнее
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
