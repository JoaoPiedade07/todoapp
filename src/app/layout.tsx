import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TodoApp - Gestão de Tarefas',
  description: 'Sistema interno de gestão de tarefas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body>
        {children}
      </body>
    </html>
  )
}