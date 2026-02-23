import { useToast } from '@/app/hooks/use-toast'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ShowToastOptions {
  title: string
  description?: string
  duration?: number
  type?: ToastType
}

export function useToastNotify() {
  const { toast } = useToast()

  const getToastConfig = (type: ToastType) => {
    const configs = {
      success: {
        icon: CheckCircle,
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        titleColor: 'text-emerald-900',
        descColor: 'text-emerald-700',
        bgLight: 'bg-emerald-100',
      },
      error: {
        icon: X,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        titleColor: 'text-red-900',
        descColor: 'text-red-700',
        bgLight: 'bg-red-100',
      },
      warning: {
        icon: AlertTriangle,
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        titleColor: 'text-amber-900',
        descColor: 'text-amber-700',
        bgLight: 'bg-amber-100',
      },
      info: {
        icon: Info,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        titleColor: 'text-blue-900',
        descColor: 'text-blue-700',
        bgLight: 'bg-blue-100',
      },
    }
    return configs[type]
  }

  const showToast = ({
    title,
    description,
    duration = 3000,
    type = 'info',
  }: ShowToastOptions) => {
    const config = getToastConfig(type)

    toast({
      title,
      description,
      duration,
      className: `${config.bgColor} border-l-4 ${config.borderColor}`,
    })
  }

  return {
    success: (title: string, description?: string) =>
      showToast({ title, description, type: 'success' }),
    error: (title: string, description?: string) =>
      showToast({ title, description, type: 'error' }),
    warning: (title: string, description?: string) =>
      showToast({ title, description, type: 'warning' }),
    info: (title: string, description?: string) =>
      showToast({ title, description, type: 'info' }),
    custom: (options: ShowToastOptions) => showToast(options),
  }
}
