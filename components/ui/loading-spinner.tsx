'use client'

import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  variant?: 'dots' | 'ring' | 'pulse' | 'bounce'
}

export function LoadingSpinner({ 
  size = 'md', 
  message,
  variant = 'ring'
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: { container: 'w-8 h-8', dot: 'w-1.5 h-1.5', text: 'text-xs' },
    md: { container: 'w-12 h-12', dot: 'w-2 h-2', text: 'text-sm' },
    lg: { container: 'w-16 h-16', dot: 'w-3 h-3', text: 'text-base' },
  }

  const sizes = sizeMap[size]

  // Ring variant with rotating border
  if (variant === 'ring') {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className={`${sizes.container} relative`}>
          <motion.div
            className="absolute inset-0 border-4 border-slate-200 rounded-full"
            style={{
              borderTopColor: '#2563eb',
              borderRightColor: '#2563eb',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-1 border-2 border-transparent rounded-full"
            style={{
              borderTopColor: '#60a5fa',
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        {message && (
          <motion.p
            className={`text-slate-600 font-medium ${sizes.text}`}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {message}
          </motion.p>
        )}
      </div>
    )
  }

  // Dots variant with staggered animation
  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className={`${sizes.container} flex items-center justify-center gap-2`}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`${sizes.dot} bg-blue-600 rounded-full`}
              animate={{
                y: [0, -12, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
        {message && (
          <p className={`text-slate-600 font-medium ${sizes.text}`}>
            {message}
          </p>
        )}
      </div>
    )
  }

  // Pulse variant with expanding ring
  if (variant === 'pulse') {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className={`${sizes.container} relative flex items-center justify-center`}>
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-600"
            animate={{
              scale: [1, 1.5],
              opacity: [1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-500"
            animate={{
              scale: [1, 1.3],
              opacity: [1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0.3,
            }}
          />
          <div className={`${sizes.dot} bg-blue-600 rounded-full relative z-10`} />
        </div>
        {message && (
          <p className={`text-slate-600 font-medium ${sizes.text}`}>
            {message}
          </p>
        )}
      </div>
    )
  }

  // Bounce variant with bouncing balls
  if (variant === 'bounce') {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className={`${sizes.container} flex items-center justify-center gap-1.5`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="flex-1 h-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"
              animate={{
                scaleY: [0.3, 1, 0.3],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.12,
              }}
            />
          ))}
        </div>
        {message && (
          <p className={`text-slate-600 font-medium ${sizes.text}`}>
            {message}
          </p>
        )}
      </div>
    )
  }

  // Default to ring
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizes.container} relative`}>
        <motion.div
          className="absolute inset-0 border-4 border-slate-200 rounded-full"
          style={{
            borderTopColor: '#2563eb',
            borderRightColor: '#2563eb',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      {message && (
        <motion.p
          className={`text-slate-600 font-medium ${sizes.text}`}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.p>
      )}
    </div>
  )
}
