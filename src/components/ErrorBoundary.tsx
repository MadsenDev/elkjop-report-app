import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-red-50 dark:bg-red-900/20 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 border-2 border-red-500">
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
              Application Error
            </h1>
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Message:</h2>
                <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-auto text-sm font-mono">
                  {this.state.error?.toString()}
                </pre>
              </div>
              {this.state.errorInfo && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Component Stack:</h2>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-auto text-sm font-mono">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-elkjop-green text-white rounded-lg hover:bg-elkjop-green/90 font-medium"
              >
                Reload App
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 