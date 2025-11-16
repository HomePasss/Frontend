// CHANGE: Wired up the React Router tree to mirror MainNavigation and all Compose routes.
// WHY: Ensures parity with the Kotlin navigation graph when running the Vite application.
// REF: user-message-3
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/ui/navigation/MainNavigation.kt

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { NavigationShell } from './components/NavigationShell'
import { HomeScreen } from './screens/HomeScreen'
import { SearchScreen } from './screens/SearchScreen'
import { InvestmentsScreen } from './screens/InvestmentsScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { PropertyDetailsScreen } from './screens/PropertyDetailsScreen'
import { InvestmentFlowScreen } from './screens/InvestmentFlowScreen'
import { InvestmentSuccessScreen } from './screens/InvestmentSuccessScreen'
import { ConstructionCompanyDetailsScreen } from './screens/ConstructionCompanyDetailsScreen'
import { CompanyInvestmentFlowScreen } from './screens/CompanyInvestmentFlowScreen'

/**
 * Root component containing the router configuration.
 * @returns Router tree.
 */
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<NavigationShell />}>
          <Route index element={<HomeScreen />} />
          <Route path="search" element={<SearchScreen />} />
          <Route path="investments" element={<InvestmentsScreen />} />
          <Route path="profile" element={<ProfileScreen />} />
          <Route path="listings/:listingId" element={<PropertyDetailsScreen />} />
          <Route path="invest/:listingId" element={<InvestmentFlowScreen />} />
          <Route path="invest/success/:listingId" element={<InvestmentSuccessScreen />} />
          <Route path="companies/:companyId" element={<ConstructionCompanyDetailsScreen />} />
          <Route path="invest/company/:companyId" element={<CompanyInvestmentFlowScreen />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
