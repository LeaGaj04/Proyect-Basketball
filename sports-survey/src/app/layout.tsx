import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sports Survey — Evaluación de Equipo',
  description:
    'Sistema de evaluación entre pares para equipos deportivos. Califica las habilidades de tus compañeros en 6 métricas clave.',
  keywords: ['encuesta deportiva', 'evaluación equipo', 'fútbol', 'análisis de rendimiento'],
  openGraph: {
    title: 'Sports Survey',
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
