import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: Sentry.captureException(error);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">😔</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Xatolik yuz berdi
              </h1>
              <p className="text-gray-600 mb-6">
                Kechirasiz, kutilmagan xatolik yuz berdi. 
                Sahifani qayta yuklang yoki bosh sahifaga qayting.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={this.handleReload}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sahifani qayta yuklash
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Bosh sahifaga qaytish
                </button>
              </div>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Xatolik tafsilotlari (faqat development)
                  </summary>
                  <div className="mt-3 p-3 bg-gray-100 rounded text-xs overflow-auto">
                    <div className="font-bold text-red-600 mb-2">Error:</div>
                    <pre className="whitespace-pre-wrap">{this.state.error && this.state.error.toString()}</pre>
                    
                    <div className="font-bold text-red-600 mt-4 mb-2">Stack Trace:</div>
                    <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

// Higher-order component to wrap components with error boundary
export const withErrorBoundary = (Component) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook to manually trigger error boundary (for testing)
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const throwError = React.useCallback((error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return throwError;
};

export default ErrorBoundary;