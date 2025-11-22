'use client';

import Login from '../components/Login/Login';
import Shop from '../components/shop/Shop';
import Brewery from '../components/Brewery/Brewery';
import BreweryDetail from '../components/BreweryDetail/BreweryDetail';
import About from '../components/About/About'; 
import Home from '../components/Home/Home';
import Community from '../components/community/Community';
import Cart from '../components/Cart/Cart'; 
// [추가] 주문 내역 및 예약 내역 컴포넌트 임포트
import OrderHistory from '../components/OrderHistory/OrderHistory';
import ReservationHistory from '../components/ReservationHistory/ReservationHistory';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Brewery as BreweryType, ProductWithDetails } from '../types/mockData';
import { getProductsWithBrewery } from '../data/mockData';
import { getBreweryById, convertBreweryDetailToType } from '../utils/brewery';

// [수정] View 타입에 'order-history'와 'reservation-history' 추가
type View = 'home' | 'about' | 'brewery' | 'shop' | 'community' | 'login' | 'brewery-detail' | 'product-detail' | 'cart' | 'order-history' | 'reservation-history';

export default function MainApp() {
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedBrewery, setSelectedBrewery] = useState<BreweryType | null>(null);
  const [breweryProducts, setBreweryProducts] = useState<ProductWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // URL 파라미터 처리
  useEffect(() => {
    const handleURLParams = async () => {
      setIsLoading(true);
      
      try {
        const view = searchParams.get('view') as View;
        const breweryId = searchParams.get('brewery');
        const productId = searchParams.get('product');
        
        // 검색 관련 파라미터
        const searchKeyword = searchParams.get('search');
        const searchType = searchParams.get('searchType');

        console.log('URL 파라미터:', { view, breweryId, productId, searchKeyword, searchType });

        // 1. 상품 상세페이지 처리
        if (productId) {
          setCurrentView('shop');
          setSelectedBrewery(null);
          setBreweryProducts([]);
          return;
        }

        // 2. 양조장 상세페이지 처리
        if (breweryId) {
          try {
            const breweryDetail = await getBreweryById(parseInt(breweryId));
            
            if (breweryDetail) {
              const convertedBrewery = convertBreweryDetailToType(breweryDetail);
              setSelectedBrewery(convertedBrewery);
              
              // 해당 양조장의 상품 가져오기 (Mock 데이터 사용 중)
              const products = getProductsWithBrewery().filter(p => p.brewery_id === convertedBrewery.id);
              
              setBreweryProducts(products);
              setCurrentView('brewery-detail');
            } else {
              setCurrentView('brewery');
              setSelectedBrewery(null);
              setBreweryProducts([]);
            }
          } catch (error) {
            console.error('양조장 상세 로드 실패:', error);
            setCurrentView('brewery');
            setSelectedBrewery(null);
            setBreweryProducts([]);
          }
        } 
        // 3. 일반 뷰 처리 (주문내역, 예약내역 포함)
        else if (view && ['home', 'about', 'brewery', 'shop', 'community', 'login', 'cart', 'order-history', 'reservation-history'].includes(view)) { 
          setCurrentView(view);
          setSelectedBrewery(null);
          setBreweryProducts([]);

          // 검색 파라미터가 있는 경우 뷰 전환 로직
          if (searchKeyword && searchType) {
            if (searchType === 'brewery' && view !== 'brewery') {
              setCurrentView('brewery');
            } else if (searchType === 'product' && view !== 'shop') {
              setCurrentView('shop');
            }
          }
        } else {
          // 기본값
          setCurrentView('home');
          setSelectedBrewery(null);
          setBreweryProducts([]);
        }
      } catch (error) {
        console.error('URL 파라미터 처리 오류:', error);
        setCurrentView('home');
        setSelectedBrewery(null);
        setBreweryProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    handleURLParams();
  }, [searchParams]);

  // 커스텀 이벤트 리스너 (Nav 등에서 발생시키는 이벤트 감지)
  useEffect(() => {
    const handleLocationChange = () => {
      console.log('URL 변경 감지됨');
    };

    window.addEventListener('locationchange', handleLocationChange);
    
    return () => {
      window.removeEventListener('locationchange', handleLocationChange);
    };
  }, []);

  // 뷰 전환 함수
  const navigateToView = (view: View, params?: Record<string, string>) => {
    const url = new URL(window.location.href);
    
    // 기존 파라미터 초기화
    url.searchParams.delete('view');
    url.searchParams.delete('brewery');
    url.searchParams.delete('product');
    url.searchParams.delete('search');
    url.searchParams.delete('searchType');
    
    if (view !== 'home') {
      url.searchParams.set('view', view);
    }
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    
    window.location.href = url.toString();
  };

  // 뷰 렌더링 로직
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

      case 'cart': 
        return <Cart />;

      // [추가] 주문 내역 페이지
      case 'order-history':
        return <OrderHistory />;

      // [추가] 체험 예약 내역 페이지
      case 'reservation-history':
        return <ReservationHistory />;

      case 'brewery-detail':
        if (selectedBrewery) {
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
                  cursor: 'pointer'
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

  if (currentView === 'login') {
    return <Login />;
  }

  return renderView();
}