// CHANGE: Implemented the shared scaffold with bottom navigation to mirror MainNavigation.kt.
// WHY: Central shell preserves tab selection logic and keeps detail routes within the same chrome.
// QUOTE(TЗ): "Можешь переписать код с KMP на TypeScript React Vite"
// REF: user-message-3
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/ui/navigation/MainNavigation.kt

import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { ComponentType } from 'react'
import { House, MagnifyingGlass, TrendUp, User } from 'phosphor-react'

interface TabConfig {
  readonly label: string
  readonly path: string
  readonly icon: ComponentType<{ size?: number; weight?: 'regular' | 'fill' }>
}

const tabs: readonly TabConfig[] = [
  { label: 'Home', path: '/', icon: House },
  { label: 'Search', path: '/search', icon: MagnifyingGlass },
  { label: 'Investments', path: '/investments', icon: TrendUp },
  { label: 'Profile', path: '/profile', icon: User },
]

/**
 * Layout component that renders the routed screen and displays the persistent bottom navigation bar.
 * @returns Application shell used by every route.
 */
export const NavigationShell = () => {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="app-shell">
      <main className="app-content">
        <Outlet />
      </main>
      <nav aria-label="Основная навигация" className="bottom-nav">
        {tabs.map((tab) => {
          const isActive =
            location.pathname === tab.path ||
            (tab.path !== '/' && location.pathname.startsWith(tab.path))

          return (
            <button
              key={tab.path}
              type="button"
              className={`bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
              onClick={() => navigate(tab.path)}
            >
              <span aria-hidden="true" className="bottom-nav__icon">
                <tab.icon size={24} weight={isActive ? 'fill' : 'regular'} />
              </span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
