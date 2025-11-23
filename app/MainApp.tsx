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
import ProfileLayout from '../components/Profile/ProfileLayout'; // [추가] 프로필 레이아웃 임포트

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Brewery as BreweryType, ProductWithDetails } from '../types/mockData';
import { getBreweryById, convertBreweryDetailToType, getLatestBreweries } from '../utils/brewery';
import { getProductsByUserId, convertToProductWithDetails } from '../utils/shopApi';

// [수정] View 타입에 'profile' 추가
type View = 'home' | 'about' | 'brewery' | 'shop' | 'community' | 'login' | 'brewery-detail' | 'product-detail' | 'cart' | 'order-history' | 'reservation-history' | 'profile';

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
            const targetId = parseInt(breweryId);
            
            // [1차 시도] 양조장 상세 정보 API 호출
            let breweryDetail = await getBreweryById(targetId);
            
            // [2차 시도 - 폴백 로직] 상세 API가 실패 시 목록 API에서 검색
            if (!breweryDetail) {
              console.warn(`⚠️ 양조장(ID:${targetId}) 상세 API 실패. 목록 API에서 정보를 찾습니다.`);
              try {
                const fallbackList = await getLatestBreweries(0, 50); 
                const foundItem = fallbackList.content.find(item => item.brewery_id === targetId);

                if (foundItem) {
                  console.log('✅ 목록에서 양조장 정보를 찾았습니다:', foundItem);
                  
                  // 체험 프로그램(joy) 데이터 임시 생성
                  const joyList = [];
                  const joyCount = Number(foundItem.brewery_joy_count || foundItem.joy_count || 0);
                  
                  if (joyCount > 0) {
                    for (let i = 0; i < joyCount; i++) {
                      joyList.push({
                        joy_id: -(i + 1),
                        joy_name: i === 0 ? '대표 체험 프로그램' : `체험 프로그램 ${i + 1}`,
                        joy_place: foundItem.region_type_name || '양조장 내',
                        joy_detail: '현재 상세 정보를 불러올 수 없습니다. 전화로 문의해주세요.',
                        joy_final_price: foundItem.brewery_joy_min_price || 0,
                        joy_origin_price: foundItem.brewery_joy_min_price || 0,
                        joy_sales_volume: 0,
                        joy_is_soldout: false,
                        joy_image_key: foundItem.image_key 
                      });
                    }
                  }

                  // List Item 형식을 Detail 형식으로 강제 변환
                  breweryDetail = {
                    brewery_id: foundItem.brewery_id,
                    users_id: 0, 
                    users_email: '',
                    users_phone: '',
                    region_type_name: foundItem.region_type_name,
                    brewery_name: foundItem.brewery_brewery_name || foundItem.brewery_name || '이름 없음',
                    brewery_address: '주소 정보 없음',
                    brewery_address_detail: '',
                    brewery_introduction: foundItem.brewery_introduction || '소개글이 없습니다.',
                    brewery_website: '',
                    brewery_registered_at: new Date().toISOString(),
                    brewery_is_regular_visit: foundItem.is_regular_visit,
                    brewery_is_visiting_brewery: foundItem.is_visiting_brewery,
                    brewery_image_image_key: [{
                      brewery_image_image_key: foundItem.image_key,
                      brewery_image_seq: 1
                    }],
                    tags_name: foundItem.tag_name || [],
                    joy: joyList 
                  };
                }
              } catch (fallbackError) {
                console.error('❌ 목록 폴백 검색 실패:', fallbackError);
              }
            }

            // [결과 처리]
            if (breweryDetail) {
              const convertedBrewery = convertBreweryDetailToType(breweryDetail);
              setSelectedBrewery(convertedBrewery);
              
              if (convertedBrewery.users_id > 0) {
                try {
                  const productResponse = await getProductsByUserId(convertedBrewery.users_id, 0);
                  const realProducts = productResponse.content.map(convertToProductWithDetails);
                  setBreweryProducts(realProducts);
                } catch (prodError) {
                  setBreweryProducts([]);
                }
              } else {
                setBreweryProducts([]);
              }

              setCurrentView('brewery-detail');
            } else {
              console.error('❌ 양조장 정보를 찾을 수 없습니다.');
              setCurrentView('brewery');
              setSelectedBrewery(null);
              setBreweryProducts([]);
            }
          } catch (error) {
            console.error('양조장 처리 중 치명적 오류:', error);
            setCurrentView('brewery');
            setSelectedBrewery(null);
            setBreweryProducts([]);
          }
        } 
        // 3. 일반 뷰 처리 (profile 추가)
        else if (view && ['home', 'about', 'brewery', 'shop', 'community', 'login', 'cart', 'order-history', 'reservation-history', 'profile'].includes(view)) { 
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

      case 'profile': // [추가] 프로필 화면 케이스
        return <ProfileLayout />;

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