// CHANGE: Added the profile screen with user metadata, investments, and share holdings.
// WHY: The Compose ProfileScreen controls auth and financial overview, so we mirror it here.
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
  const { investments: allInvestments, propertyShares: allShares } = useDashboardData()
  const navigate = useNavigate()

  const investments = useMemo(() => {
    return allInvestments
  }, [allInvestments])

  const propertyShares = useMemo(() => {
    return allShares
  }, [allShares])

  return (
    <section className="screen">
      <SolanaAuthCard />
      <div className="card profile-card">
        <div>
          <h1>Solana Wallet</h1>
          <p className="muted">Use your wallet for authentication and investing.</p>
        </div>
        <dl>
          <div>
            <dt>Role</dt>
            <dd>INVESTOR</dd>
          </div>
          <div>
            <dt>Active investments</dt>
            <dd>{investments.length}</dd>
          </div>
          <div>
            <dt>Shares</dt>
            <dd>{propertyShares.length}</dd>
          </div>
        </dl>
      </div>

      <div className="card">
        <div className="home-group__header">
          <h2>Investments</h2>
        </div>
        {investments.length === 0 ? (
          <p className="muted">No recent activity.</p>
        ) : (
          <ul className="profile-list">
            {investments.map((investment) => (
              <li key={investment.id}>
                <div>
                  <p className="eyebrow">{formatIsoDate(investment.date)}</p>
                  <h3>{investment.propertyTitle}</h3>
                  <p className="muted">Expected return {investment.expectedReturn}%</p>
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
                    Receipt
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <div className="home-group__header">
          <h2>Owned shares</h2>
        </div>
        {propertyShares.length === 0 ? (
          <p className="muted">You don’t have any shares yet.</p>
        ) : (
          <ul className="profile-list">
            {propertyShares.map((share) => (
              <li key={share.id}>
                <div>
                  <p className="eyebrow">{formatIsoDate(share.purchaseDate)}</p>
                  <h3>{share.propertyTitle}</h3>
                  <p className="muted">Share {share.percentage}%</p>
                </div>
                <div className="profile-list__actions">
                  <strong>{formatCurrencyRubles(share.currentValue)}</strong>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => navigate(`/listings/${share.propertyId}`)}
                  >
                    Details
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
