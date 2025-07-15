'use client';

import Header from '../components/Header/Header';
import Nav from '../components/Nav/Nav';
import Footer from '../components/Footer/Footer';
import Login from '../components/Login/Login';
import Shop from '../components/shop/Shop';
import Brewery from '../components/Brewery/Brewery';
import BreweryDetail from '../components/BreweryDetail/BreweryDetail';
import About from '../components/About/About'; 
import Home from '../components/Home/Home';
import Community from '../components/community/Community';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Brewery as BreweryType, ProductWithDetails } from '../types/mockData';
import { getBreweriesWithExperience, getProductsWithBrewery } from '../data/mockData';

type View = 'home' | 'about' | 'brewery' | 'shop' | 'community' | 'login' | 'brewery-detail';

export default function HomePage() {
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedBrewery, setSelectedBrewery] = useState<BreweryType | null>(null);
  const [breweryProducts, setBreweryProducts] = useState<ProductWithDetails[]>([]);

  // URL 파라미터 처리
  useEffect(() => {
    const view = searchParams.get('view') as View;
    const breweryId = searchParams.get('brewery');

    console.log('URL 파라미터:', { view, breweryId });

    if (breweryId) {
      // 양조장 상세 페이지 처리
      const breweries = getBreweriesWithExperience();
      const foundBrewery = breweries.find(b => b.brewery_id === parseInt(breweryId));
      
      console.log('찾은 양조장:', foundBrewery);
      
      if (foundBrewery) {
        setSelectedBrewery(foundBrewery);
        const products = getProductsWithBrewery().filter(p => p.brewery_id === foundBrewery.brewery_id);
        setBreweryProducts(products);
        setCurrentView('brewery-detail');
        console.log('양조장 상세페이지로 설정:', foundBrewery.brewery_name);
      } else {
        console.log('양조장을 찾을 수 없음, brewery 목록으로 리다이렉트');
        setCurrentView('brewery');
      }
    } else if (view && ['home', 'about', 'brewery', 'shop', 'community', 'login'].includes(view)) {
      setCurrentView(view);
      // 뷰가 변경되면 선택된 양조장 초기화
      if (view !== 'brewery-detail') {
        setSelectedBrewery(null);
        setBreweryProducts([]);
      }
    } else {
      setCurrentView('home');
      setSelectedBrewery(null);
      setBreweryProducts([]);
    }
  }, [searchParams]);

  // 뷰 렌더링 함수
  const renderView = () => {
    console.log('현재 뷰 렌더링:', currentView);
    
    switch (currentView) {
      case 'home':
        return <Home />;

      case 'about':
        return <About />;

      case 'shop':
        return <Shop />;

      case 'community':
        return <Community />;

      case 'brewery':
        return <Brewery />;

      case 'login':
        return <Login />;

      case 'brewery-detail':
        if (selectedBrewery) {
          console.log('양조장 상세페이지 렌더링:', selectedBrewery.brewery_name);
          return (
            <BreweryDetail 
              brewery={selectedBrewery}
              products={breweryProducts}
            />
          );
        } else {
          return (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center',
              minHeight: 'calc(100vh - 110px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏭</div>
              <h2 style={{ color: '#333', marginBottom: '16px' }}>
                양조장을 찾을 수 없습니다
              </h2>
              <p style={{ color: '#666', marginBottom: '24px' }}>
                요청하신 양조장 정보를 찾을 수 없습니다.
              </p>
              <button
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('view');
                  url.searchParams.delete('brewery');
                  url.searchParams.set('view', 'brewery');
                  window.history.pushState({}, '', url.toString());
                  window.location.reload();
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#8b5a3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#7c4d34';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#8b5a3c';
                }}
              >
                양조장 목록으로 돌아가기
              </button>
            </div>
          );
        }

      default:
        return (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            minHeight: 'calc(100vh - 110px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>❓</div>
            <h2 style={{ color: '#333', marginBottom: '16px' }}>
              페이지를 찾을 수 없습니다
            </h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              요청하신 페이지가 존재하지 않습니다.
            </p>
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('view');
                url.searchParams.delete('brewery');
                window.history.pushState({}, '', url.toString());
                window.location.reload();
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#8b5a3c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              홈으로 돌아가기
            </button>
          </div>
        );
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#fafbfc',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 로그인 뷰에서는 헤더와 네비게이션을 숨김 */}
      {currentView !== 'login' && (
        <>
          <Header />
          <Nav />
        </>
      )}
      
      <main style={{ 
        paddingTop: currentView !== 'login' ? '120px' : '0',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ flex: 1 }}>
          {renderView()}
        </div>
      </main>
      
      {/* 로그인 뷰에서는 푸터를 숨김 */}
      {currentView !== 'login' && <Footer />}
    </div>
  );
}