import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import IoSCBranding from './IoSCBranding';

interface ErrorPageProps {
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an unexpected error. Please try again or contact support if the problem persists.',
  showRetry = true,
  onRetry
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="w-full btn-primary flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          )}
          
          <Link
            to="/"
            className="w-full btn-secondary flex items-center justify-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </div>

        {/* UniONE Branding */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Uni<span className="text-blue-600">ONE</span>
          </h2>
        </div>

        {/* Powered by IoSC */}
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <span>Powered by</span>
          <IoSCBranding variant="full" size="sm" />
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;