'use client';

import React from 'react';
import type { Brewery } from '../../../types/mockData';
import './BreweryHeader.css';

interface BreweryHeaderProps {
  brewery: Brewery;
}

const BreweryHeader: React.FC<BreweryHeaderProps> = ({ brewery }) => {
  return (
    <div className="brewery-header">
      <h1 className="brewery-header-name">{brewery.brewery_name}</h1>
      {/* region_name -> region_type_name (API) */}
      <p className="brewery-header-region">{brewery.region_type_name}</p>
    </div>
  );
};

export default BreweryHeader;