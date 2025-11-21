import { useToastController } from '@tamagui/toast'
import React, { createContext, useContext, useMemo } from 'react'

type ToastContextType = {
  showToast: (title: string, message?: string, options?: { duration?: number }) => void
  hideToast: () => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export const AlertToastProvider = ({ children }: { children: React.ReactNode }) => {
  const toast = useToastController()

  const value = useMemo(
    () => ({
      showToast: (title: string, message?: string, options?: { duration?: number }) => {
        toast.show(title, {
          message,
          duration: options?.duration ?? 2500,
        })
      },
      hideToast: () => toast.hide(),
    }),
    [toast]
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}


export const useAlertToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useAlertToast must be used within AlertToastProvider')
  return context
}
