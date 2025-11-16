// CHANGE: Implemented the construction company explorer with search and investment shortcuts.
// WHY: This mirrors the Kotlin InvestmentsScreen to keep the funnel identical.
// QUOTE(TЗ): "Можешь переписать код с KMP на TypeScript React Vite"
// REF: user-message-3
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/ui/screens/InvestmentsScreen.kt

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDashboardData } from '../state/dashboardDataStore'
import { formatCurrencyRubles, formatNumberWithSpaces } from '../utils/formatters'

/**
 * Lists all construction partners and lets the user filter and invest.
 * @returns React element.
 */
export const InvestmentsScreen = () => {
  const { companies, isLoading } = useDashboardData()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

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
    <section className="screen">
      <div className="card search-controls">
        <div className="field-group">
          <label htmlFor="company-search">Поиск компаний</label>
          <input
            id="company-search"
            placeholder="Название или город"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <p className="muted">Найдено: {filtered.length}</p>
      </div>

      {filtered.map((company) => {
        const progress = company.currentInvestmentAmount / company.totalInvestmentAmount
        return (
          <article key={company.id} className="card company-card">
            <div className="company-card__media">
              <img src={company.imageUrl} alt={company.name} loading="lazy" />
              <span className="pill">{company.location}</span>
            </div>
            <div className="company-card__body">
              <div className="company-card__header">
                <h2>{company.name}</h2>
                <span className="pill pill--accent">{company.expectedReturn}% годовых</span>
              </div>
              <p className="muted">{company.description}</p>
              <ul className="company-card__stats">
                <li>
                  <span className="eyebrow">Проектов</span>
                  <strong>
                    {company.completedProjects}/{company.totalProjects}
                  </strong>
                </li>
                <li>
                  <span className="eyebrow">Инвесторов</span>
                  <strong>{formatNumberWithSpaces(company.investorsCount)}</strong>
                </li>
                <li>
                  <span className="eyebrow">Мин. вход</span>
                  <strong>{formatCurrencyRubles(company.minInvestmentAmount)}</strong>
                </li>
              </ul>
              <div className="progress">
                <div className="progress__bar" style={{ width: `${Math.min(progress * 100, 100)}%` }} />
                <span>
                  {formatCurrencyRubles(company.currentInvestmentAmount)} /{' '}
                  {formatCurrencyRubles(company.totalInvestmentAmount)}
                </span>
              </div>
              <div className="company-card__actions">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => navigate(`/companies/${company.id}`)}
                >
                  Подробнее
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => navigate(`/invest/company/${company.id}`)}
                >
                  Инвестировать
                </button>
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}
