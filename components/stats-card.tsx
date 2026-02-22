'use client'

import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: number
  color?: 'blue' | 'green' | 'purple' | 'orange'
  index?: number
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  color = 'blue',
  index = 0,
}: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.1,
        ease: 'easeOut',
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-600 font-medium mb-2">{label}</p>
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp size={16} className="text-green-600" />
                <span className="text-sm text-green-600 font-medium">
                  {trend}% increase
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon size={24} />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
