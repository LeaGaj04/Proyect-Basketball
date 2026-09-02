import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Club Deportivo Project - Evaluación',
  description:
    'Sistema de evaluación entre pares para equipos deportivos. Califica las habilidades de tus compañeros en 6 métricas clave.',
  keywords: ['encuesta deportiva', 'evaluación equipo', 'fútbol', 'análisis de rendimiento'],
  openGraph: {
    title: 'Club Deportivo Project',
    description: 'Evaluación deportiva entre pares',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} dark`}>
      <body className="bg-black text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
