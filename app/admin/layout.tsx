import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import '@/app/globals.css'
import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Admin Dashboard - Token & Attendance Management',
  description: 'Manage attendance tokens, generate QR codes, and track attendance records with an intuitive admin dashboard',
  keywords: ['admin', 'dashboard', 'attendance', 'token', 'management'],
  generator: 'v0.app',
  openGraph: {
    title: 'Admin Dashboard',
    description: 'Token and Attendance Management System',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AppSidebar />
        <Header />
        <main className="ml-64 mt-16 p-8 bg-slate-50 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
