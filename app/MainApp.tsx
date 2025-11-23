'use client';

import Login from '../components/Login/Login';
import Shop from '../components/shop/Shop';
import Brewery from '../components/Brewery/Brewery';
import BreweryDetail from '../components/BreweryDetail/BreweryDetail';
import About from '../components/About/About'; 
import Home from '../components/Home/Home';
import Community from '../components/community/Community';
import Cart from '../components/Cart/Cart'; 
import OrderHistory from '../components/OrderHistory/OrderHistory';
import ReservationHistory from '../components/ReservationHistory/ReservationHistory';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Brewery as BreweryType, ProductWithDetails } from '../types/mockData';
// [수정] Mock 데이터 import 제거 (더 이상 사용 안 함)
// import { getProductsWithBrewery } from '../data/mockData'; 
import { getBreweryById, convertBreweryDetailToType } from '../utils/brewery';
// [수정] 상품 API 함수 import 추가
import { getProductsByUserId, convertToProductWithDetails } from '../utils/shopApi';

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
            // 양조장 상세 정보 호출
            const breweryDetail = await getBreweryById(parseInt(breweryId));
            
            if (breweryDetail) {
              const convertedBrewery = convertBreweryDetailToType(breweryDetail);
              setSelectedBrewery(convertedBrewery);
              
              // [수정] Mock 데이터 대신 API를 통해 해당 양조장(판매자)의 상품 목록 가져오기
              try {
                // users_id를 사용하여 상품 조회 (0페이지)
                const productResponse = await getProductsByUserId(convertedBrewery.users_id, 0);
                
                // API 응답 데이터를 UI 모델로 변환
                const realProducts = productResponse.content.map(convertToProductWithDetails);
                
                console.log(`양조장(ID:${convertedBrewery.id}) 상품 로드 성공:`, realProducts.length, '개');
                setBreweryProducts(realProducts);
              } catch (prodError) {
                console.error('양조장 상품 로드 실패:', prodError);
                setBreweryProducts([]);
              }

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
        // 3. 일반 뷰 처리
        else if (view && ['home', 'about', 'brewery', 'shop', 'community', 'login', 'cart', 'order-history', 'reservation-history'].includes(view)) { 
          setCurrentView(view);
          setSelectedBrewery(null);
          setBreweryProducts([]);

          if (searchKeyword && searchType) {
            if (searchType === 'brewery' && view !== 'brewery') {
              setCurrentView('brewery');
            } else if (searchType === 'product' && view !== 'shop') {
              setCurrentView('shop');
            }
          }
        } else {
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

  // ... (이하 코드는 기존과 동일) ...

  useEffect(() => {
    const handleLocationChange = () => {
      console.log('URL 변경 감지됨');
    };

    window.addEventListener('locationchange', handleLocationChange);
    
    return () => {
      window.removeEventListener('locationchange', handleLocationChange);
    };
  }, []);

  const navigateToView = (view: View, params?: Record<string, string>) => {
    const url = new URL(window.location.href);
    
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

      case 'order-history':
        return <OrderHistory />;

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