'use client';

import Header from '../components/Header/Header';
import Nav from '../components/Nav/Nav';
import Footer from '../components/Footer/Footer';
import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

// 클라이언트 전용 컴포넌트들을 동적으로 임포트
const MainApp = dynamic(() => import('./MainApp'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: 'calc(100vh - 110px)',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ 
        width: '40px', 
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #8b5a3c',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ color: '#666', fontSize: '16px' }}>페이지를 불러오는 중...</p>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  )
});

export default function HomePage() {
  const searchParams = useSearchParams();
  const [isLoginPage, setIsLoginPage] = useState(false);

  // 로그인 페이지 여부 확인
  useEffect(() => {
    const view = searchParams.get('view');
    setIsLoginPage(view === 'login');
  }, [searchParams]);

  // 로그인 페이지일 때는 전체 화면으로 렌더링
  if (isLoginPage) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#fafbfc'
      }}>
        <Suspense fallback={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '100vh',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #8b5a3c',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#666', fontSize: '16px' }}>로딩 중...</p>
          </div>
        }>
          <MainApp />
        </Suspense>
      </div>
    );
  }

  // 일반 페이지일 때는 Header, Nav, Footer 포함
  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#fafbfc',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header />
      <Nav />
      
      <main style={{ 
        paddingTop: '120px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ flex: 1 }}>
          <Suspense fallback={
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: 'calc(100vh - 110px)',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #8b5a3c',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: '#666', fontSize: '16px' }}>로딩 중...</p>
            </div>
          }>
            <MainApp />
          </Suspense>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}