// CHANGE: Implemented the construction company explorer with search and investment shortcuts.
// WHY: This mirrors the Kotlin InvestmentsScreen to keep the funnel identical.
// QUOTE(TЗ): "Можешь переписать код с KMP на TypeScript React Vite"
// REF: user-message-3
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/ui/screens/InvestmentsScreen.kt

import { useMemo, useState } from 'react'
import { useDashboardData } from '../state/dashboardDataStore'
import { formatCurrencyRubles, formatNumberWithSpaces } from '../utils/formatters'

/**
 * Lists all construction partners and lets the user filter and invest.
 * @returns React element.
 */
export const InvestmentsScreen = () => {
  const { companies, isLoading } = useDashboardData()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return companies.filter((company) => {
      const haystack = `${company.name} ${company.location}`.toLowerCase()
      return haystack.includes(query.toLowerCase())
    })
  }, [companies, query])

  if (isLoading) {
    return (
      <section className="screen">
        <div className="card card--centered">Загрузка компаний…</div>
      </section>
    )
  }

  return (
    <section className="screen screen--mobile">
      <div className="mobile-header">
        <div className="search-bar">
          <span className="search-bar__icon">🔍</span>
          <input
            id="company-search"
            placeholder="Search companies..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <p className="mobile-section-title">Companies found: {filtered.length}</p>
      </div>

      {filtered.map((company) => {
        const progress = Math.min(company.currentInvestmentAmount / company.totalInvestmentAmount, 1)
        return (
          <article
            key={company.id}
            className="company-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/companies/${company.id}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                navigate(`/companies/${company.id}`)
              }
            }}
          >
            <div className="company-card__media">
              <img src={company.imageUrl} alt={company.name} loading="lazy" />
              <span className="pill">Return: {company.expectedReturn}%</span>
              <span className="mobile-card__badge mobile-card__badge--accent">★ {company.rating.toFixed(2)}</span>
            </div>
            <div className="company-card__body">
              <div className="company-card__header">
                <div>
                  <h2>{company.name}</h2>
                  <p className="muted">{company.description}</p>
                </div>
              </div>
              <div className="mobile-card__meta">
                <span>📍 {company.location}</span>
              </div>
              <ul className="company-card__stats">
                <li>
                  <span className="eyebrow">Projects</span>
                  <strong>
                    {company.completedProjects}/{company.totalProjects}
                  </strong>
                </li>
                <li>
                  <span className="eyebrow">Investors</span>
                  <strong>{formatNumberWithSpaces(company.investorsCount)}</strong>
                </li>
                <li>
                  <span className="eyebrow">Min. Investment</span>
                  <strong>{formatCurrencyRubles(company.minInvestmentAmount)}</strong>
                </li>
              </ul>
              <div className="mobile-card__meta">
                <span>Min. investment</span>
                <span className="mobile-card__stat-value">
                  {formatCurrencyRubles(company.minInvestmentAmount)}
                </span>
              </div>
              <div className="mobile-card__progress">
                <span>{Math.round(progress * 100)}%</span>
                <div className="mobile-progress-track">
                  <div className="mobile-progress-fill" style={{ width: `${progress * 100}%` }} />
                </div>
              </div>
              <div className="mobile-card__progress">
                <span>{Math.round(progress * 100)}%</span>
                <div className="mobile-progress-track">
                  <div className="mobile-progress-fill" style={{ width: `${progress * 100}%` }} />
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}
