import { useState } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardPage from './components/Dashboard/DashboardPage'
import GraphExplorer from './components/Graph/GraphExplorer'
import AnalysisPage from './components/Analysis/AnalysisPage'
import ChatPage from './components/Chat/ChatPage'
import ReportPage from './components/Report/ReportPage'
import { motion } from 'motion/react'
import {
  Activity,
  Layers,
  DollarSign,
  Zap,
  Network,
  TrendingUp,
  AlertCircle,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Download,
  ChevronRight,
  BarChart3,
  MessageSquare,
  Play,
  FileText,
  Users,
  Factory,
  ShoppingCart,
  Globe,
} from 'lucide-react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'

type DashboardView = 'overview' | 'process' | 'product' | 'drivers' | 'network'

function App() {
  const { t, i18n } = useTranslation()
  const [dashboardView, setDashboardView] = useState<DashboardView>('overview')
  const [timeRange, setTimeRange] = useState('month')
  const location = useLocation()
  const isDashboard = location.pathname === '/'

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ko' ? 'en' : 'ko')
  }

  const timeRangeLabel = (range: string) => {
    if (range === 'month') return t('sidebar.month')
    if (range === 'quarter') return t('sidebar.quarter')
    return t('sidebar.year')
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 shadow-2xl overflow-y-auto flex-shrink-0"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{t('sidebar.title')}</h1>
          <p className="text-slate-400 text-sm">{t('sidebar.subtitle')}</p>
        </div>

        {/* Period Selector */}
        <div className="mb-8 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <div className="text-xs text-slate-400 mb-2">{t('sidebar.period')}</div>
          <div className="flex items-center gap-2 text-sm font-semibold mb-3">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>{t('sidebar.periodValue')}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['month', 'quarter', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 py-1 rounded text-xs transition-all ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {timeRangeLabel(range)}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Views */}
        <div className="mb-6">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-3 px-2">{t('sidebar.dashboardSection')}</div>
          <nav className="space-y-1">
            {[
              { id: 'overview' as DashboardView, label: t('sidebar.overview'), icon: Activity },
              { id: 'process' as DashboardView, label: t('sidebar.process'), icon: Layers },
              { id: 'product' as DashboardView, label: t('sidebar.product'), icon: DollarSign },
              { id: 'drivers' as DashboardView, label: t('sidebar.drivers'), icon: Zap },
              { id: 'network' as DashboardView, label: t('sidebar.network'), icon: Network },
            ].map((view) => {
              const Icon = view.icon
              const isActive = isDashboard && dashboardView === view.id
              return (
                <NavLink
                  key={view.id}
                  to="/"
                  onClick={() => setDashboardView(view.id)}
                >
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{view.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </motion.div>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Tools */}
        <div className="mb-6">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-3 px-2">{t('sidebar.toolsSection')}</div>
          <nav className="space-y-1">
            {[
              { to: '/graph', label: t('sidebar.graphExplorer'), icon: BarChart3 },
              { to: '/analysis', label: t('sidebar.analysisRun'), icon: Play },
              { to: '/chat', label: t('sidebar.chat'), icon: MessageSquare },
            ].map((item) => {
              const Icon = item.icon
              return (
                <NavLink key={item.to} to={item.to}>
                  {({ isActive }) => (
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </motion.div>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Reports */}
        <div className="mb-6">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-3 px-2">{t('sidebar.reportSection')}</div>
          <nav className="space-y-1">
            {[
              { to: '/report/executive', label: t('sidebar.executiveReport'), icon: FileText },
              { to: '/report/cost-team', label: t('sidebar.costTeamReport'), icon: DollarSign },
              { to: '/report/production-team', label: t('sidebar.productionTeamReport'), icon: Factory },
              { to: '/report/purchase-team', label: t('sidebar.purchaseTeamReport'), icon: ShoppingCart },
            ].map((item) => {
              const Icon = item.icon
              return (
                <NavLink key={item.to} to={item.to}>
                  {({ isActive }) => (
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </motion.div>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Quick Stats */}
        <div className="space-y-3 mt-auto">
          <div className="text-xs text-slate-400 mb-2">{t('sidebar.quickStats')}</div>
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-300">{t('sidebar.totalIncrease')}</span>
            </div>
            <div className="text-xl font-bold text-red-400">{t('sidebar.totalIncreaseValue')}</div>
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-300">{t('sidebar.mainCause')}</span>
            </div>
            <div className="text-sm font-semibold text-blue-300">{t('sidebar.mainCauseValue')}</div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header Bar */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder={t('header.searchPlaceholder')}
                  className="pl-10 w-80 bg-slate-50 border-slate-200"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                {t('header.filter')}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => i18n.changeLanguage('ko')}
                  className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                    i18n.language === 'ko'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {t('header.langKo')}
                </button>
                <button
                  onClick={() => i18n.changeLanguage('en')}
                  className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                    i18n.language === 'en'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {t('header.langEn')}
                </button>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                {t('header.refresh')}
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                {t('header.exportReport')}
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          <Routes>
            <Route path="/" element={<DashboardPage selectedView={dashboardView} />} />
            <Route path="/graph" element={<GraphExplorer />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/report/:type" element={<ReportPage />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App
