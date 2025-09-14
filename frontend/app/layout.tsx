import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import ApolloProviderWrapper from '@/components/ApolloProviderWrapper'
import { Toast, ToastProvider } from '@/components/ui/toast'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Social Connect',
  description: 'Developed By The Full Stack Developer Rachid Jedata , and note that it doesn\'t contain all functionalities of a real social media app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ApolloProviderWrapper>
          <Suspense>
            {children}
          </Suspense>
        </ApolloProviderWrapper>
        <Analytics />
        <ToastProvider>
          <Toast />
        </ToastProvider>
      </body>
    </html>
  )
}
