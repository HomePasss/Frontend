// CHANGE: Wrapped the application with the dashboard provider for shared state.
// WHY: React equivalent of the Compose DI wiring keeps all screens consistent with the mock repositories.
// QUOTE(TЗ): "Можешь переписать код с KMP на TypeScript React Vite"
// REF: user-message-3
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/App.kt
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DashboardDataProvider } from './state/DashboardDataProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DashboardDataProvider>
      <App />
    </DashboardDataProvider>
  </StrictMode>,
)
