'use client'

import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp } from 'lucide-react'

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: number
  color?: 'blue' | 'green' | 'purple' | 'orange'
  index?: number
}

const colorConfig = {
  blue: {
    icon: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    glow: 'from-blue-600/5',
    accent: 'bg-blue-500',
  },
  green: {
    icon: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    glow: 'from-emerald-600/5',
    accent: 'bg-emerald-500',
  },
  purple: {
    icon: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
    glow: 'from-violet-600/5',
    accent: 'bg-violet-500',
  },
  orange: {
    icon: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
    glow: 'from-orange-600/5',
    accent: 'bg-orange-500',
  },
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  color = 'blue',
  index = 0,
}: StatsCardProps) {
  const cfg = colorConfig[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="
        relative overflow-hidden
        bg-slate-900/70 backdrop-blur-xl
        border border-slate-700/50
        rounded-2xl shadow-lg shadow-black/20
        p-5 cursor-default
        hover:border-slate-600/60 transition-colors duration-200
      "
    >
      {/* Subtle gradient glow top-left */}
      <div className={`absolute inset-0 bg-gradient-to-br ${cfg.glow} to-transparent pointer-events-none`} />

      {/* Thin color accent line on top */}
      <div className={`absolute top-0 left-5 right-5 h-[2px] rounded-full ${cfg.accent} opacity-60`} />

      <div className="relative flex items-start justify-between gap-3">
        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 truncate">
            {label}
          </p>
          <motion.h3
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 + 0.15, duration: 0.4 }}
            className="text-3xl font-black text-white tracking-tight leading-none"
          >
            {value}
          </motion.h3>

          {trend !== undefined && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.08 + 0.25 }}
              className="flex items-center gap-1 mt-2.5"
            >
              <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                <TrendingUp size={11} className="text-emerald-400" />
                <span className="text-xs text-emerald-400 font-semibold">+{trend}%</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Icon box */}
        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${cfg.icon}`}>
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  )
}