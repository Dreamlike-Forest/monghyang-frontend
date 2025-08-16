'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Factory, 
  Star, 
  MapPin, 
  ChevronRight,
  Wine,
  Calendar,
  Users,
  Award
} from 'lucide-react';

interface BrewerySearchParams {
  region: string;
  type: string;
  hasExperience: boolean;
}

interface Program {
  id: number;
  title: string;
  description: string;
  price: string;
  rating: number;
  location: string;
}

const Home: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [brewerySearch, setBrewerySearch] = useState<BrewerySearchParams>({
    region: '',
    type: '',
    hasExperience: false
  });
  const [windowWidth, setWindowWidth] = useState(1200);

  // 반응형 처리
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Mock 데이터
  const popularPrograms: Program[] = [
    {
      id: 1,
      title: '전통주 소믈리에 클래스',
      description: '다양한 전통주 테이스팅 노하우를 배워보세요',
      price: '50,000원/인',
      rating: 4.7,
      location: '예약하기'
    },
    {
      id: 2,
      title: '전통 발효 식초 만들기',
      description: '전통주로 시작하는 건강한 발효 식초 만들기',
      price: '40,000원/인',
      rating: 4.5,
      location: '예약하기'
    },
    {
      id: 3,
      title: '양조장 투어 & 시음회',
      description: '양조장을 둘러보고 5종류의 전통주를 시음해보요',
      price: '25,000원/인',
      rating: 4.4,
      location: '예약하기'
    }
  ];

  const regions = [
    { value: '', label: '전체' },
    { value: 'seoul', label: '서울' },
    { value: 'gyeonggi', label: '경기도' },
    { value: 'gangwon', label: '강원도' },
    { value: 'chungcheong', label: '충청도' },
    { value: 'jeolla', label: '전라도' },
    { value: 'gyeongsang', label: '경상도' },
    { value: 'jeju', label: '제주도' }
  ];

  const types = [
    { value: '', label: '전체' },
    { value: 'makgeolli', label: '막걸리' },
    { value: 'soju', label: '소주' },
    { value: 'yakju', label: '약주' },
    { value: 'cheongju', label: '청주' },
    { value: 'wine', label: '과실주' }
  ];

  // 페이지 이동 함수 (URL 기반)
  const navigateToPage = (page: string, breweryId?: number) => {
    if (typeof window === 'undefined') return;
    
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    url.searchParams.delete('brewery');
    
    if (breweryId) {
      url.searchParams.set('brewery', breweryId.toString());
    } else if (page !== 'home') {
      url.searchParams.set('view', page);
    }
    
    window.location.href = url.toString();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('검색어:', searchKeyword);
    navigateToPage('shop');
  };

  const handleBrewerySearch = () => {
    console.log('양조장 검색:', brewerySearch);
    navigateToPage('brewery');
  };

  const handleProgramClick = (programId: number) => {
    console.log('프로그램 선택:', programId);
    // 프로그램에 따라 해당 양조장으로 이동
    const breweryIdMap: { [key: number]: number } = {
      1: 1, // 프로그램 1 -> 양조장 1
      2: 2, // 프로그램 2 -> 양조장 2
      3: 3  // 프로그램 3 -> 양조장 3
    };
    const breweryId = breweryIdMap[programId] || 1;
    navigateToPage('brewery', breweryId);
  };

  const handleViewAllPrograms = () => {
    console.log('모든 프로그램 보기');
    navigateToPage('brewery');
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #faf8f5 0%, #f3f1ee 50%, #ebe8e4 100%)',
      minHeight: '100vh',
      paddingBottom: '40px'
    }}>
      {/* 메인 히어로 섹션 */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(139, 90, 60, 0.9) 0%, rgba(124, 77, 52, 0.8) 50%, rgba(109, 61, 38, 0.9) 100%)',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: windowWidth > 768 ? '3.5rem' : '2.5rem',
            fontWeight: '800',
            marginBottom: '24px',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
            lineHeight: '1.2'
          }}>
            전통주와 함께하는<br />특별한 여행
          </h1>
          <p style={{
            fontSize: windowWidth > 768 ? '1.25rem' : '1rem',
            marginBottom: '40px',
            opacity: '0.9',
            lineHeight: '1.6'
          }}>
            전국의 양조장을 둘러보고, 다양한 전통주를 맛보며,<br />
            새로운 문화 체험을 즐겨보세요.
          </p>

          {/* 검색 바 */}
          <form onSubmit={handleSearch} style={{
            display: 'flex',
            maxWidth: '500px',
            margin: '0 auto',
            background: 'white',
            borderRadius: '50px',
            padding: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            flexDirection: windowWidth <= 480 ? 'column' : 'row',
            gap: windowWidth <= 480 ? '8px' : '0'
          }}>
            <input
              type="text"
              placeholder="지역명, 양조장명, 전통주명을 검색해보세요"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '16px 24px',
                fontSize: '16px',
                borderRadius: windowWidth <= 480 ? '25px' : '50px',
                color: '#333'
              }}
            />
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #8b5a3c 0%, #7c4d34 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                minWidth: 'fit-content'
              }}
            >
              <Search size={20} />
              검색
            </button>
          </form>
        </div>
      </section>

      {/* 주요 기능 소개 */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '20px',
            color: '#2d3748'
          }}>
            몽향과 함께하는 전통주 여행
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '1.125rem',
            color: '#4a5568',
            marginBottom: '60px',
            maxWidth: '600px',
            margin: '0 auto 60px auto',
            lineHeight: '1.6'
          }}>
            전통주 문화를 현대적으로 재해석하여, 누구나 쉽게 접근할 수 있는 플랫폼을 제공합니다.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: windowWidth > 768 ? 'repeat(3, 1fr)' : '1fr',
            gap: '40px'
          }}>
            {/* 양조장 체험 */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px 30px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => navigateToPage('brewery')}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #8b5a3c 0%, #7c4d34 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto'
              }}>
                <Factory size={36} color="white" />
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#2d3748'
              }}>
                양조장 체험
              </h3>
              <p style={{
                color: '#4a5568',
                lineHeight: '1.6',
                marginBottom: '24px'
              }}>
                전국의 다양한 양조장에서 제공하는 체험 프로그램을 발견하고 예약할 수 있습니다.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8b5a3c',
                fontWeight: '600',
                fontSize: '16px'
              }}>
                체험하러 가기
                <ChevronRight size={20} style={{ marginLeft: '8px' }} />
              </div>
            </div>

            {/* 전통주 쇼핑 */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px 30px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => navigateToPage('shop')}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #8b5a3c 0%, #7c4d34 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto'
              }}>
                <Wine size={36} color="white" />
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#2d3748'
              }}>
                전통주 쇼핑
              </h3>
              <p style={{
                color: '#4a5568',
                lineHeight: '1.6',
                marginBottom: '24px'
              }}>
                엄선된 전통주를 온라인으로 편리하게 구매할 수 있습니다.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8b5a3c',
                fontWeight: '600',
                fontSize: '16px'
              }}>
                쇼핑하러 가기
                <ChevronRight size={20} style={{ marginLeft: '8px' }} />
              </div>
            </div>

            {/* 커뮤니티 */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px 30px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => navigateToPage('community')}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #8b5a3c 0%, #7c4d34 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto'
              }}>
                <Users size={36} color="white" />
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#2d3748'
              }}>
                커뮤니티
              </h3>
              <p style={{
                color: '#4a5568',
                lineHeight: '1.6',
                marginBottom: '24px'
              }}>
                전통주 애호가들과 경험을 공유하고 새로운 정보를 얻을 수 있습니다.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8b5a3c',
                fontWeight: '600',
                fontSize: '16px'
              }}>
                참여하기
                <ChevronRight size={20} style={{ marginLeft: '8px' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 양조장 검색 섹션 */}
      <section style={{
        background: 'white',
        padding: '80px 20px',
        borderTop: '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '20px',
            color: '#2d3748'
          }}>
            원하는 양조장 찾기
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#4a5568',
            marginBottom: '40px',
            fontSize: '1.125rem'
          }}>
            지역과 전통주 종류를 선택해서 나에게 맞는 양조장을 찾아보세요
          </p>

          <div style={{
            background: '#f7fafc',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: windowWidth > 768 ? '1fr 1fr' : '1fr',
              gap: '20px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#4a5568'
                }}>
                  지역 선택
                </label>
                <select
                  value={brewerySearch.region}
                  onChange={(e) => setBrewerySearch(prev => ({ ...prev, region: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    backgroundColor: 'white'
                  }}
                >
                  {regions.map(region => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#4a5568'
                }}>
                  전통주 종류
                </label>
                <select
                  value={brewerySearch.type}
                  onChange={(e) => setBrewerySearch(prev => ({ ...prev, type: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    backgroundColor: 'white'
                  }}
                >
                  {types.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '500',
                color: '#4a5568',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={brewerySearch.hasExperience}
                  onChange={(e) => setBrewerySearch(prev => ({ ...prev, hasExperience: e.target.checked }))}
                  style={{ marginRight: '8px' }}
                />
                <Users size={16} color="#8b5a3c" />
                체험 프로그램 여부
              </label>
            </div>

            <button 
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #8b5a3c 0%, #7c4d34 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onClick={handleBrewerySearch}
            >
              <Search size={18} />
              검색하기
            </button>
          </div>
        </div>
      </section>

      {/* 인기 체험 프로그램 섹션 */}
      <section style={{
        background: '#f7fafc',
        padding: '80px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
            flexDirection: windowWidth <= 768 ? 'column' : 'row',
            gap: windowWidth <= 768 ? '20px' : '0'
          }}>
            <div>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#2d3748',
                marginBottom: '8px'
              }}>
                인기 체험 프로그램
              </h2>
              <p style={{ color: '#4a5568', fontSize: '1.125rem' }}>
                다른 사람들이 많이 선택한 체험 프로그램을 만나보세요
              </p>
            </div>
            <button
              onClick={handleViewAllPrograms}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: '#8b5a3c',
                border: '2px solid #8b5a3c',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              전체 보기
              <ChevronRight size={18} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: windowWidth > 1024 ? 'repeat(3, 1fr)' : windowWidth > 768 ? 'repeat(2, 1fr)' : '1fr',
            gap: '24px'
          }}>
            {popularPrograms.map(program => (
              <div
                key={program.id}
                onClick={() => handleProgramClick(program.id)}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < Math.floor(program.rating) ? '#fbbf24' : 'none'}
                        color={i < Math.floor(program.rating) ? '#fbbf24' : '#d1d5db'}
                      />
                    ))}
                  </div>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#4a5568'
                  }}>
                    {program.rating}
                  </span>
                </div>

                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#2d3748'
                }}>
                  {program.title}
                </h3>

                <p style={{
                  color: '#4a5568',
                  lineHeight: '1.5',
                  marginBottom: '16px',
                  fontSize: '14px'
                }}>
                  {program.description}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '16px',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#8b5a3c'
                  }}>
                    {program.price}
                  </span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#8b5a3c',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    <Calendar size={14} />
                    {program.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;