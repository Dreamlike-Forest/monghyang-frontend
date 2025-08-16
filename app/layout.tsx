import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '몽향 - 전통주 플랫폼',
  description: '양조장 체험부터 전통주 구매까지, 모든 것을 한 곳에서',
  keywords: ['전통주', '양조장', '막걸리', '체험프로그램', '커뮤니티', '전통주쇼핑'],
  authors: [{ name: '몽향팀' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/logo/monghyang-logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}