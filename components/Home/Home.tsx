'use client';

import { useState, useEffect } from 'react';
import HeroSection from './HeroSection/HeroSection';
import FeaturesSection from './FeaturesSection/FeaturesSection';
import BreweryFinderSection from './BreweryFinderSection/BreweryFinderSection';
import PopularProgramsSection from './PopularProgramsSection/PopularProgramsSection';
import './Home.css';

const Home: React.FC = () => {
  const [windowWidth, setWindowWidth] = useState(1200);

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

  return (
    <div className="home-container">
      <div className="home-section">
        <HeroSection windowWidth={windowWidth} />
      </div>
      <div className="home-section">
        <FeaturesSection windowWidth={windowWidth} />
      </div>
      <div className="home-section">
        <BreweryFinderSection windowWidth={windowWidth} />
      </div>
      <div className="home-section">
        <PopularProgramsSection windowWidth={windowWidth} />
      </div>
    </div>
  );
};

export default Home;