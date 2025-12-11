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

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Brewery as BreweryType, ProductWithDetails } from '../types/shop';
import { getBreweryById, convertBreweryDetailToType, getLatestBreweries } from '../utils/brewery';
import { getProductsByUserId, convertToProductWithDetails } from '../utils/shopApi';

type View = 'home' | 'about' | 'brewery' | 'shop' | 'community' | 'login' | 'brewery-detail' | 'product-detail' | 'cart' | 'order-history' | 'reservation-history' | 'profile' | 'purchase';

export default function MainApp() {
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedBrewery, setSelectedBrewery] = useState<BreweryType | null>(null);
  const [breweryProducts, setBreweryProducts] = useState<ProductWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleURLParams = async () => {
      setIsLoading(true);
      
      try {
        const view = searchParams.get('view') as View;
        const breweryId = searchParams.get('brewery');
        const productId = searchParams.get('product');
        
        const searchKeyword = searchParams.get('search');
        const searchType = searchParams.get('searchType');

        if (productId) {
          setCurrentView('shop');
          setSelectedBrewery(null);
          setBreweryProducts([]);
          return;
        }

        if (breweryId) {
          try {
            const targetId = parseInt(breweryId);
            let breweryDetail = await getBreweryById(targetId);
            
            if (!breweryDetail) {
              const fallbackList = await getLatestBreweries(0, 50); 
              const foundItem = fallbackList.content.find(item => item.brewery_id === targetId);
              if (foundItem) {
                // Fallback logic...
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
                    joy: [] 
                  };
              }
            }

            if (breweryDetail) {
              const convertedBrewery = convertBreweryDetailToType(breweryDetail);
              setSelectedBrewery(convertedBrewery);
              if (convertedBrewery.users_id > 0) {
                try {
                  const productResponse = await getProductsByUserId(convertedBrewery.users_id, 0);
                  const realProducts = productResponse.content.map(convertToProductWithDetails);
                  setBreweryProducts(realProducts);
                } catch (e) { setBreweryProducts([]); }
              }
              setCurrentView('brewery-detail');
            } else {
              setCurrentView('brewery');
            }
          } catch (error) {
            setCurrentView('brewery');
          }
        } 
        else if (view && ['home', 'about', 'brewery', 'shop', 'community', 'login', 'cart', 'order-history', 'reservation-history', 'profile', 'purchase'].includes(view)) { 
          setCurrentView(view);
          setSelectedBrewery(null);
          setBreweryProducts([]);
        } else {
          setCurrentView('home');
        }
      } finally {
        setIsLoading(false);
      }
    };

    handleURLParams();
  }, [searchParams]);

  const navigateToView = (view: View) => {
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    url.searchParams.delete('brewery');
    url.searchParams.delete('product');
    if (view !== 'home') url.searchParams.set('view', view);
    window.location.href = url.toString();
  };

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

      case 'brewery-detail':
        return selectedBrewery ? <BreweryDetail brewery={selectedBrewery} products={breweryProducts} /> : <Brewery />;

      default: return <Home />;
    }
  };

  if (currentView === 'login') return <Login />;

  return renderView();
}