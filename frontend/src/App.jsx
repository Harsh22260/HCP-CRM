import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/common/Sidebar'
import LogInteractionPage from './pages/LogInteractionPage'
import HcpDirectoryPage from './pages/HcpDirectoryPage'
import AnalyticsPage from './pages/AnalyticsPage'
import FollowUpsPage from './pages/FollowUpsPage'
import ProductsPage from './pages/ProductsPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <Routes>
        <Route path="/" element={<Navigate to="/log-interaction" replace />} />
        <Route path="/log-interaction" element={<LogInteractionPage />} />
        <Route path="/hcp-directory" element={<HcpDirectoryPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/follow-ups" element={<FollowUpsPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  )
}
