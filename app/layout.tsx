import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: '몽향 - 전통주 플랫폼',
  description: '양조장 체험부터 전통주 구매까지, 모든 것을 한 곳에서',
  keywords: ['전통주', '양조장', '막걸리', '체험프로그램', '커뮤니티', '전통주쇼핑'],
  authors: [{ name: '몽향팀' }],
  icons: {
    icon: '/logo/monghyang-logo.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <Suspense fallback={
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#fafbfc'
          }}>
            <div>로딩 중...</div>
          </div>
        }>
          {children}
        </Suspense>
      </body>
    </html>
  )
}