import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Maverick AI - Settings Preview',
  description: 'AI-powered Windows system tray application with voice capture and LLM integration',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}

