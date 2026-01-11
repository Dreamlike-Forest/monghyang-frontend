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
import ProfileLayout from '../components/Profile/ProfileLayout';
import Purchase from '../components/Purchase/Purchase';

// 지원 페이지들
import Guide from '../components/Guide/Guide';
import Qna from '../components/Qna/Qna';
import Faq from '../components/Faq/Faq';
import Privacy from '../components/Privacy/Privacy'; // [추가됨]

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Brewery as BreweryType, ProductWithDetails } from '../types/shop';
import { getBreweryById, convertBreweryDetailToType } from '../utils/brewery';
import { getProductsByUserId, convertToProductWithDetails } from '../utils/shopApi';

// [수정됨] View 타입에 'privacy' 추가
type View = 
  | 'home' 
  | 'about' 
  | 'brewery' 
  | 'shop' 
  | 'community' 
  | 'login' 
  | 'brewery-detail' 
  | 'product-detail' 
  | 'cart' 
  | 'order-history' 
  | 'reservation-history' 
  | 'profile' 
  | 'purchase'
  | 'guide'
  | 'qna'
  | 'faq'
  | 'privacy'; // 추가

export default function MainApp() {
  const searchParams = useSearchParams();
  
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedBrewery, setSelectedBrewery] = useState<BreweryType | null>(null);
  const [breweryProducts, setBreweryProducts] = useState<ProductWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleNavigation = async () => {
      setIsLoading(true);
      try {
        const url = new URL(window.location.href);
        const view = url.searchParams.get('view');
        const breweryId = url.searchParams.get('brewery');
        
        if (breweryId) {
          const id = parseInt(breweryId);
          if (!isNaN(id)) {
            const breweryData = await getBreweryById(id);
            if (breweryData) {
              setSelectedBrewery(convertBreweryDetailToType(breweryData));
              const productsData = await getProductsByUserId(breweryData.users_id, 0);
              const convertedProducts = productsData.content.map(convertToProductWithDetails);
              setBreweryProducts(convertedProducts);
              setCurrentView('brewery-detail');
              setIsLoading(false);
              return;
            }
          }
        }

        if (view) {
          setCurrentView(view as View);
        } else {
          setCurrentView('home');
        }

      } catch (error) {
        console.error('Navigation error:', error);
        setCurrentView('home');
      } finally {
        setIsLoading(false);
      }
    };

    handleNavigation();
  }, [searchParams]);

  const renderView = () => {
    if (isLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 110px)' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #8b5a3c', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      );
    }
    
    switch (currentView) {
      case 'home': return <Home />;
      case 'about': return <About />;
      case 'shop': return <Shop />;
      case 'community': return <Community />;
      case 'brewery': return <Brewery />;
      case 'login': return <Login />;
      case 'cart': return <Cart />;
      case 'order-history': return <OrderHistory />;
      case 'reservation-history': return <ReservationHistory />;
      case 'profile': return <ProfileLayout />;
      case 'purchase': return <Purchase />;
      
      case 'guide': return <Guide />;
      case 'qna': return <Qna />;
      case 'faq': return <Faq />;
      case 'privacy': return <Privacy />; // [추가됨] 연결

      case 'brewery-detail':
        return selectedBrewery ? (
          <BreweryDetail brewery={selectedBrewery} products={breweryProducts} />
        ) : <Brewery />;

      case 'product-detail': return <Shop />;

      default: return <Home />;
    }
  };

  return (
    <div className="main-content">
      {renderView()}
    </div>
  );
}