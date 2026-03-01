'use client'

import { motion } from 'framer-motion'
import {
  Users,
  CheckCircle,
  KeyRound,
  Zap,
} from 'lucide-react'
import { StatsCard } from '@/components/stats-card'
import { AttendanceChart } from '@/components/attendance-chart'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAttendanceStats, useAttendanceChart } from '@/lib/api-hooks'

export default function DashboardPage() {
  const { stats } = useAttendanceStats()
  const { data: chartData, loading: chartLoading } = useAttendanceChart()

  const mockChartData = chartData && chartData.length > 0
    ? chartData
    : Array.from({ length: 7 }, (_, i) => ({
        date: `Day ${i + 1}`,
        attendance: 30 + (i * 7) % 50,
      }))

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' as const },
    },
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white shadow-lg"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -right-20 -top-20 w-40 h-40 bg-blue-500 rounded-full opacity-20"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-400 rounded-full opacity-20"
        />

        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl font-bold mb-2"
          >
            Welcome back, Admin!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-blue-100 text-lg"
          >
            KINGG TOTOTTTTT 
          </motion.p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={itemVariants}>
          <StatsCard
            icon={KeyRound}
            label="Total Tokens"
            value={stats?.totalTokens || 0}
            color="blue"
            index={0}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            icon={CheckCircle}
            label="Today's Attendance"
            value={stats?.todayAttendance || 0}
            trend={12}
            color="green"
            index={1}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            icon={Zap}
            label="Active Tokens"
            value={stats?.activeTokens || 0}
            color="orange"
            index={2}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            icon={Users}
            label="Total Attendance"
            value={stats?.totalAttendance || 0}
            color="purple"
            index={3}
          />
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div variants={itemVariants}>
          {chartLoading ? (
            <div className="bg-white rounded-lg p-6 h-96 flex items-center justify-center">
              <LoadingSpinner message="Loading chart data..." />
            </div>
          ) : (
            <AttendanceChart
              data={mockChartData}
              title="Attendance Trend (Last 7 Days)"
              type="line"
            />
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          {chartLoading ? (
            <div className="bg-white rounded-lg p-6 h-96 flex items-center justify-center">
              <LoadingSpinner message="Loading chart data..." />
            </div>
          ) : (
            <AttendanceChart
              data={mockChartData}
              title="Daily Attendance Distribution"
              type="bar"
            />
          )}
        </motion.div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-lg p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Attendance Rate</p>
            <p className="text-2xl font-bold text-slate-900">85%</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Avg Per Day</p>
            <p className="text-2xl font-bold text-slate-900">42</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">This Month</p>
            <p className="text-2xl font-bold text-slate-900">1.2K</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
