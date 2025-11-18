'use client';

import Login from '../components/Login/Login';
import Shop from '../components/shop/Shop';
import Brewery from '../components/Brewery/Brewery';
import BreweryDetail from '../components/BreweryDetail/BreweryDetail';
import About from '../components/About/About'; 
import Home from '../components/Home/Home';
import Community from '../components/community/Community';
import Cart from '../components/Cart/Cart'; 
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Brewery as BreweryType, ProductWithDetails } from '../types/mockData';
import { getBreweriesWithExperience, getProductsWithBrewery } from '../data/mockData';

type View = 'home' | 'about' | 'brewery' | 'shop' | 'community' | 'login' | 'brewery-detail' | 'product-detail' | 'cart';

export default function MainApp() {
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedBrewery, setSelectedBrewery] = useState<BreweryType | null>(null);
  const [breweryProducts, setBreweryProducts] = useState<ProductWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // URL 파라미터 처리 개선 - 검색 파라미터 지원 추가
  useEffect(() => {
    const handleURLParams = async () => {
      setIsLoading(true);
      
      try {
        const view = searchParams.get('view') as View;
        const breweryId = searchParams.get('brewery');
        const productId = searchParams.get('product');
        
        // 검색 관련 파라미터들
        const searchKeyword = searchParams.get('search');
        const searchType = searchParams.get('searchType');

        console.log('URL 파라미터:', { view, breweryId, productId, searchKeyword, searchType });

        // 상품 상세페이지 처리 - shop 뷰로 처리
        if (productId) {
          console.log('상품 상세페이지 요청:', productId);
          // Shop 컴포넌트에서 처리하도록 shop view로 설정
          setCurrentView('shop');
          setSelectedBrewery(null);
          setBreweryProducts([]);
          return;
        }

        // 양조장 상세페이지 처리
        if (breweryId) {
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
            setSelectedBrewery(null);
            setBreweryProducts([]);
          }
        } else if (view && ['home', 'about', 'brewery', 'shop', 'community', 'login', 'cart'].includes(view)) { // 수정: cart 추가
          // 일반 뷰 처리 - cart 추가
          setCurrentView(view);
          // 뷰가 변경되면 선택된 양조장 초기화
          setSelectedBrewery(null);
          setBreweryProducts([]);

          // 검색 파라미터가 있는 경우 로그 출력 (실제 검색은 각 컴포넌트에서 처리)
          if (searchKeyword && searchType) {
            console.log(`${searchType} 검색 요청: "${searchKeyword}"`);
            if (searchType === 'brewery' && view !== 'brewery') {
              // 양조장 검색인데 brewery 뷰가 아니면 brewery로 이동
              setCurrentView('brewery');
            } else if (searchType === 'product' && view !== 'shop') {
              // 상품 검색인데 shop 뷰가 아니면 shop으로 이동
              setCurrentView('shop');
            }
          }
        } else {
          // view 파라미터가 없거나 유효하지 않으면 home으로 설정
          setCurrentView('home');
          setSelectedBrewery(null);
          setBreweryProducts([]);
        }
      } catch (error) {
        console.error('URL 파라미터 처리 중 오류:', error);
        setCurrentView('home');
        setSelectedBrewery(null);
        setBreweryProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    handleURLParams();
  }, [searchParams]);

  // Header가 URL 변경을 감지할 수 있도록 커스텀 이벤트 리스너 추가
  useEffect(() => {
    const handleLocationChange = () => {
      // URL이 변경되었을 때 필요한 처리
      console.log('URL 변경 감지됨');
    };

    window.addEventListener('locationchange', handleLocationChange);
    
    return () => {
      window.removeEventListener('locationchange', handleLocationChange);
    };
  }, []);

  // 뷰 전환 함수 개선 - Nav 컴포넌트와 호환
  const navigateToView = (view: View, params?: Record<string, string>) => {
    console.log('네비게이션 요청:', view, params);
    
    const url = new URL(window.location.href);
    
    // 기존 파라미터 정리
    url.searchParams.delete('view');
    url.searchParams.delete('brewery');
    url.searchParams.delete('product');
    url.searchParams.delete('search');
    url.searchParams.delete('searchType');
    
    // 새로운 파라미터 설정
    if (view !== 'home') {
      url.searchParams.set('view', view);
    }
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    
    // URL 업데이트 - Nav 컴포넌트와 일관성 유지
    window.location.href = url.toString();
  };

  // 뷰 렌더링 함수
  const renderView = () => {
    if (isLoading) {
      return (
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
      );
    }
    
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

      case 'cart': // 추가: Cart 컴포넌트 렌더링
        return <Cart />;

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
                onClick={() => navigateToView('brewery')}
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
              onClick={() => navigateToView('home')}
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

  // 로그인 페이지일 때는 전체 레이아웃 변경
  if (currentView === 'login') {
    return <Login />;
  }

  // 일반 페이지일 때는 컨텐츠만 렌더링 (Header, Nav, Footer는 page.tsx에서 처리)
  return renderView();
}