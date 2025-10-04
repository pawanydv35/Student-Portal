import React from 'react';

interface IoSCBrandingProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'text-only' | 'icon-only' | 'logo-only';
  className?: string;
  showTagline?: boolean;
}

const IoSCBranding: React.FC<IoSCBrandingProps> = ({ 
  size = 'md', 
  variant = 'text-only',
  className = '',
  showTagline = true
}) => {
  const sizeClasses = {
    xs: { text: 'text-xs', logo: 'h-4', spacing: 'space-x-1' },
    sm: { text: 'text-sm', logo: 'h-5', spacing: 'space-x-1.5' },
    md: { text: 'text-base', logo: 'h-6', spacing: 'space-x-2' },
    lg: { text: 'text-lg', logo: 'h-8', spacing: 'space-x-2.5' },
    xl: { text: 'text-xl', logo: 'h-10', spacing: 'space-x-3' }
  };

  const currentSize = sizeClasses[size];

  // IoSC Logo Component using the actual SVG from public folder
  const IoSCLogo = ({ className }: { className?: string }) => (
    <img 
      src="/iosc-logo.svg" 
      alt="IoSC Logo" 
      className={className}
    />
  );

  // Fallback Circuit Icon for cases where we want just an icon
  const CircuitIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main circle */}
      <circle cx="40" cy="40" r="20" fill="none" stroke="#9ca3af" strokeWidth="2"/>
      
      {/* Circuit connections */}
      <line x1="25" y1="30" x2="15" y2="20" stroke="#00bcd4" strokeWidth="1.5"/>
      <circle cx="15" cy="20" r="2.5" fill="#00bcd4"/>
      
      <line x1="55" y1="30" x2="65" y2="20" stroke="#9ca3af" strokeWidth="1.5"/>
      <circle cx="65" cy="20" r="2.5" fill="#9ca3af"/>
      
      <line x1="25" y1="50" x2="15" y2="60" stroke="#00bcd4" strokeWidth="1.5"/>
      <circle cx="15" cy="60" r="2.5" fill="#00bcd4"/>
      
      <line x1="55" y1="50" x2="65" y2="60" stroke="#9ca3af" strokeWidth="1.5"/>
      <circle cx="65" cy="60" r="2.5" fill="#9ca3af"/>
      
      <line x1="40" y1="20" x2="40" y2="10" stroke="#00bcd4" strokeWidth="1.5"/>
      <circle cx="40" cy="10" r="3" fill="#00bcd4"/>
      
      <line x1="40" y1="60" x2="40" y2="70" stroke="#9ca3af" strokeWidth="1.5"/>
      <circle cx="40" cy="70" r="2.5" fill="#9ca3af"/>
    </svg>
  );

  if (variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <CircuitIcon className={`${currentSize.logo} text-gray-400`} />
      </div>
    );
  }

  if (variant === 'logo-only') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <IoSCLogo className={`${currentSize.logo} object-contain`} />
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`inline-flex items-center ${currentSize.spacing} ${className}`}>
        <IoSCLogo className={`${currentSize.logo} object-contain flex-shrink-0`} />
        <div className="flex flex-col">
          <span className={`font-bold text-cyan-500 ${currentSize.text} leading-tight`}>IoSC</span>
          {showTagline && (
            <span className="text-xs text-gray-500 leading-none">GGSIPU EDC</span>
          )}
        </div>
      </div>
    );
  }

  // text-only variant (default)
  return (
    <div className={`inline-flex items-center ${currentSize.spacing} ${className}`}>
      <span className={`font-bold text-cyan-500 ${currentSize.text}`}>
        IoSC
      </span>
      {showTagline && size !== 'xs' && (
        <span className="text-xs text-gray-500">GGSIPU EDC</span>
      )}
    </div>
  );
};

export default IoSCBranding;