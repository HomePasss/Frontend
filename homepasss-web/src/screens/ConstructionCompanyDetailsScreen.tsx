// CHANGE: Implemented the rich detail page for construction companies.
// WHY: Investors need a breakdown before committing, matching the Compose sheet content.
// QUOTE(TЗ): "Можешь переписать код с KMP на TypeScript React Vite"
// REF: user-message-3
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/ui/screens/ConstructionCompanyDetailsScreen.kt

import { useNavigate, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { useDashboardData } from '../state/dashboardDataStore'
import { formatCurrencyRubles, formatNumberWithSpaces } from '../utils/formatters'

/**
 * Detailed card describing a construction partner.
 * @returns React node.
 */
export const ConstructionCompanyDetailsScreen = () => {
  const { companyId } = useParams()
  const { companies, isLoading } = useDashboardData()
  const navigate = useNavigate()

  const company = useMemo(
    () => companies.find((item) => item.id === companyId),
    [companies, companyId],
  )

  if (isLoading) {
    return (
      <section className="screen">
        <div className="card card--centered">Загрузка компании…</div>
      </section>
    )
  }

  if (!company) {
    return (
      <section className="screen">
        <div className="card card--centered">Компания не найдена.</div>
      </section>
    )
  }

  const progress = company.currentInvestmentAmount / company.totalInvestmentAmount

  return (
    <section className="screen">
      <article className="card company-details">
        <img src={company.imageUrl} alt={company.name} className="company-details__hero" />
        <div className="company-details__header">
          <div>
            <p className="eyebrow">{company.location}</p>
            <h1>{company.name}</h1>
          </div>
          <span className="pill pill--accent">{company.rating.toFixed(1)} ★</span>
        </div>
        <p className="muted">{company.description}</p>
        <dl className="company-details__facts">
          <div>
            <dt>Проектов</dt>
            <dd>
              {company.completedProjects}/{company.totalProjects}
            </dd>
          </div>
          <div>
            <dt>Инвесторов</dt>
            <dd>{formatNumberWithSpaces(company.investorsCount)}</dd>
          </div>
          <div>
            <dt>Мин. вход</dt>
            <dd>{formatCurrencyRubles(company.minInvestmentAmount)}</dd>
          </div>
        </dl>
        <div className="progress progress--lg">
          <div className="progress__bar" style={{ width: `${Math.min(progress * 100, 100)}%` }} />
          <span>
            {formatCurrencyRubles(company.currentInvestmentAmount)} из{' '}
            {formatCurrencyRubles(company.totalInvestmentAmount)}
          </span>
        </div>
        <div className="company-card__actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>
            Назад
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => navigate(`/invest/company/${company.id}`)}
          >
            Инвестировать
          </button>
        </div>
      </article>
    </section>
  )
}
