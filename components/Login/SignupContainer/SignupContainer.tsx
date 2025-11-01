'use client';

import React, { useState } from 'react';
import SignupTypeSelector from '../SignupTypeSelector/SignupTypeSelector';
import UserSignupForm from '../UserSignupForm/UserSignupForm';
import SellerSignupForm from '../SellerSignupForm/SellerSignupForm';
import BrewerySignupForm from '../BrewerySignupForm/BrewerySignupForm';
import './SignupContainer.css';

interface SignupContainerProps {
  onBackToLogin: () => void;
}

type SignupStep = 'select-type' | 'user-form' | 'seller-form' | 'brewery-form';

const SignupContainer: React.FC<SignupContainerProps> = ({ onBackToLogin }) => {
  const [currentStep, setCurrentStep] = useState<SignupStep>('select-type');

  const handleSelectType = (type: 'user' | 'seller' | 'brewery') => {
    switch (type) {
      case 'user':
        setCurrentStep('user-form');
        break;
      case 'seller':
        setCurrentStep('seller-form');
        break;
      case 'brewery':
        setCurrentStep('brewery-form');
        break;
    }
  };

  const handleBackToTypeSelector = () => {
    setCurrentStep('select-type');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'select-type':
        return (
          <SignupTypeSelector 
            onSelectType={handleSelectType}
            onBackToLogin={onBackToLogin}
          />
        );
      
      case 'user-form':
        return (
          <UserSignupForm 
            onBack={handleBackToTypeSelector}
            onBackToLogin={onBackToLogin} 
          />
        );
      
      case 'seller-form':
        return (
          <SellerSignupForm 
            onBack={handleBackToTypeSelector}
            onBackToLogin={onBackToLogin} 
          />
        );
      
      case 'brewery-form':
        return (
          <BrewerySignupForm 
            onBack={handleBackToTypeSelector}
            onBackToLogin={onBackToLogin} 
          />
        );
      
      default:
        return (
          <SignupTypeSelector 
            onSelectType={handleSelectType}
            onBackToLogin={onBackToLogin}
          />
        );
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-container-content">
        <div className="signup-step-transition">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default SignupContainer;