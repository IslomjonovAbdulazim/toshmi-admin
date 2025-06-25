import React from 'react';

const Loading = ({ 
  size = 'default',
  text = 'Yuklanmoqda...',
  centered = true,
  overlay = false,
  color = '#1a202c',
  className = ''
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4 border-2';
      case 'large':
        return 'w-12 h-12 border-4';
      default:
        return 'w-8 h-8 border-3';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const spinnerClasses = [
    getSizeClass(),
    'border-gray-200 border-t-current rounded-full animate-spin'
  ].join(' ');

  const containerClasses = [
    centered ? 'flex items-center justify-center' : 'flex items-center',
    overlay ? 'fixed inset-0 bg-white bg-opacity-75 z-50' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-3">
        <div 
          className={spinnerClasses}
          style={{ borderTopColor: color }}
        ></div>
        {text && (
          <div className={`${getTextSize()} text-gray-600 font-medium`}>
            {text}
          </div>
        )}
      </div>
    </div>
  );
};

// Inline spinner component for buttons
export const Spinner = ({ 
  size = 'small',
  color = 'currentColor',
  className = ''
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'tiny':
        return 'w-3 h-3 border';
      case 'small':
        return 'w-4 h-4 border-2';
      case 'medium':
        return 'w-6 h-6 border-2';
      default:
        return 'w-4 h-4 border-2';
    }
  };

  return (
    <div 
      className={`${getSizeClass()} border-gray-300 border-t-current rounded-full animate-spin ${className}`}
      style={{ borderTopColor: color }}
    ></div>
  );
};

// Full page loading overlay
export const PageLoading = ({ text = 'Sahifa yuklanmoqda...' }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg text-gray-700 font-medium">{text}</p>
        <p className="text-sm text-gray-500 mt-2">Iltimos, kuting...</p>
      </div>
    </div>
  );
};

// Content loading skeleton
export const ContentSkeleton = ({ lines = 3 }) => {
  return (
    <div className="animate-pulse">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-200 rounded mb-3 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  );
};

// Card loading skeleton
export const CardSkeleton = () => {
  return (
    <div className="animate-pulse bg-white border border-gray-200 rounded-lg p-6">
      <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
};

// Table loading skeleton
export const TableSkeleton = ({ columns = 4, rows = 5 }) => {
  return (
    <div className="animate-pulse">
      {/* Table header */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="h-5 bg-gray-200 rounded"></div>
        ))}
      </div>
      
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4 mb-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-100 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Loading button state
export const LoadingButton = ({ 
  children, 
  loading = false, 
  disabled = false,
  loadingText = 'Yuklanmoqda...',
  ...props 
}) => {
  return (
    <button 
      {...props}
      disabled={disabled || loading}
      className={`${props.className} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <Spinner size="small" />
          {loadingText}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Progress bar component
export const ProgressBar = ({ 
  progress = 0,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  height = '8px',
  showPercentage = false,
  className = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div 
        className="relative rounded-full overflow-hidden"
        style={{ height, backgroundColor }}
      >
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{ 
            width: `${Math.min(Math.max(progress, 0), 100)}%`,
            backgroundColor: color
          }}
        ></div>
      </div>
      {showPercentage && (
        <div className="text-right text-sm text-gray-600 mt-1">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

// Loading dots animation
export const LoadingDots = ({ 
  size = 'medium',
  color = '#6b7280'
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'w-1 h-1';
      case 'large':
        return 'w-3 h-3';
      default:
        return 'w-2 h-2';
    }
  };

  const dotClass = `${getSizeClass()} rounded-full`;

  return (
    <div className="flex space-x-1">
      <div 
        className={`${dotClass} animate-bounce`}
        style={{ backgroundColor: color, animationDelay: '0ms' }}
      ></div>
      <div 
        className={`${dotClass} animate-bounce`}
        style={{ backgroundColor: color, animationDelay: '150ms' }}
      ></div>
      <div 
        className={`${dotClass} animate-bounce`}
        style={{ backgroundColor: color, animationDelay: '300ms' }}
      ></div>
    </div>
  );
};

export default Loading;