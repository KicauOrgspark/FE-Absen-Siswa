'use client'

import { motion } from 'framer-motion'
import {
  Users,
  CheckCircle,
  KeyRound,
  Zap,
  TrendingUp,
  Activity,
  Calendar,
  ArrowUpRight,
} from 'lucide-react'
import { StatsCard } from '@/components/stats-card'
import { AttendanceChart } from '@/components/attendance-chart'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAttendanceStats, useAttendanceChart } from '@/lib/api-hooks'

/* ── animation variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

const cardClass = `
  bg-slate-900/70 backdrop-blur-xl
  border border-slate-700/50
  rounded-2xl shadow-xl shadow-black/30
`

export default function DashboardPage() {
  const { stats } = useAttendanceStats()
  const { data: chartData, loading: chartLoading } = useAttendanceChart()

  const mockChartData = chartData && chartData.length > 0
    ? chartData
    : Array.from({ length: 7 }, (_, i) => ({
        date: `Day ${i + 1}`,
        attendance: 30 + (i * 7) % 50,
      }))

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="space-y-6 pb-8">

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl bg-blue-600/10 border border-blue-500/20 p-6 lg:p-8"
      >
        {/* glow blobs */}
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-36 h-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium tracking-wide uppercase">
                Sistem Aktif
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mb-1">
              Selamat Datang, Admin! 👋
            </h1>
            <p className="text-slate-400 text-sm flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {today}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className={`${cardClass} px-4 py-3 text-center min-w-[90px]`}>
              <p className="text-2xl font-bold text-white">{stats?.todayAttendance || 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Hadir Hari Ini</p>
            </div>
            <div className={`${cardClass} px-4 py-3 text-center min-w-[90px]`}>
              <p className="text-2xl font-bold text-blue-400">{stats?.activeTokens || 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Token Aktif</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Cards ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
      >
        {[
          {
            icon: KeyRound, label: 'Total Tokens',
            value: stats?.totalTokens || 0, color: 'blue', index: 0,
          },
          {
            icon: CheckCircle, label: 'Hadir Hari Ini',
            value: stats?.todayAttendance || 0, trend: 12, color: 'green', index: 1,
          },
          {
            icon: Zap, label: 'Token Aktif',
            value: stats?.activeTokens || 0, color: 'orange', index: 2,
          },
          {
            icon: Users, label: 'Total Kehadiran',
            value: stats?.totalAttendance || 0, color: 'purple', index: 3,
          },
        ].map((card) => (
          <motion.div key={card.label} variants={itemVariants}>
            <StatsCard {...card} />
          </motion.div>
        ))}
      </motion.div>

      {/* ── Charts ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
      >
        {[
          { title: 'Tren Kehadiran (7 Hari)', type: 'line' as const },
          { title: 'Distribusi Kehadiran Harian', type: 'bar' as const },
        ].map((chart) => (
          <motion.div key={chart.title} variants={itemVariants}>
            {chartLoading ? (
              <div className={`${cardClass} p-6 h-80 flex items-center justify-center`}>
                <LoadingSpinner message="Memuat data chart..." />
              </div>
            ) : (
              <div className={`${cardClass} overflow-hidden`}>
                <AttendanceChart
                  data={mockChartData}
                  title={chart.title}
                  type={chart.type}
                />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* ── Quick Stats ── */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className={`${cardClass} p-5 lg:p-6`}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Activity className="h-4 w-4 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold">Statistik Cepat</h3>
          </div>
          <button className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
            Lihat Detail <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Tingkat Kehadiran', value: '85%', icon: TrendingUp, positive: true },
            { label: 'Rata-rata Per Hari', value: '42', icon: Users, positive: true },
            { label: 'Bulan Ini', value: '1.2K', icon: CheckCircle, positive: true },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 + 0.4, duration: 0.4 }}
                className="
                  bg-slate-800/50 border border-slate-700/40 rounded-xl p-4
                  hover:border-slate-600/60 hover:bg-slate-800/70
                  transition-all duration-200 group
                "
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                  <Icon className="h-3.5 w-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>
                <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
                {stat.positive && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                    <span className="text-xs text-emerald-400">+vs bulan lalu</span>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

    </div>
  )
}