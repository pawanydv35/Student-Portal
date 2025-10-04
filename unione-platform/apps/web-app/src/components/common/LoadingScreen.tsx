import React from 'react';
import IoSCBranding from './IoSCBranding';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <IoSCBranding variant="logo-only" size="xl" className="mx-auto" />
        </div>
        
        {/* UniONE Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Uni<span className="text-blue-600">ONE</span>
          </h1>
          <p className="text-gray-600">University Management Platform</p>
        </div>

        {/* Loading Animation */}
        <div className="mb-6">
          <div className="loading-spinner w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"></div>
        </div>

        {/* Loading Message */}
        <p className="text-gray-600 mb-8">{message}</p>

        {/* Powered by IoSC */}
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <span>Powered by</span>
          <IoSCBranding variant="full" size="sm" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;