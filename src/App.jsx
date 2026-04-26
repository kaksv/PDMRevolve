import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import RepaymentsPage from './pages/RepaymentsPage'
import EducationPage from './pages/EducationPage'
import EducationModuleDetailPage from './pages/EducationModuleDetailPage'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/repayments', label: 'Repayments' },
  { to: '/education', label: 'Education' },
]

function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">PDMRevolve</p>
            <h1 className="text-xl font-semibold">Incentive & Education Platform</h1>
          </div>
          <nav className="flex gap-2 rounded-xl bg-slate-100 p-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => {
                  const educationActive =
                    link.to === '/education' &&
                    (location.pathname === '/education' || location.pathname.startsWith('/education/'))
                  const active = link.to === '/education' ? educationActive : isActive
                  return `rounded-lg px-3 py-2 text-sm font-medium ${
                    active ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
                  }`
                }}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/repayments" element={<RepaymentsPage />} />
          <Route path="/education/:code" element={<EducationModuleDetailPage />} />
          <Route path="/education" element={<EducationPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
