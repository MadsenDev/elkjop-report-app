import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Debug environment
console.log('Environment:', {
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD,
  baseUrl: import.meta.env.BASE_URL,
  viteAppTitle: import.meta.env.VITE_APP_TITLE,
});

console.log('Application starting...');

// Add global error handler with more details
window.addEventListener('error', (event) => {
  console.error('Global error caught:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
  });
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        position: fixed;
        inset: 0;
        background: #fee2e2;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="
          max-width: 800px;
          width: 100%;
          background: white;
          padding: 2rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          border: 2px solid #ef4444;
        ">
          <h1 style="
            font-size: 1.5rem;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 1rem;
          ">Application Error</h1>
          <pre style="
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 0.375rem;
            overflow: auto;
            font-size: 0.875rem;
            margin-bottom: 1rem;
          ">${event.error?.toString() || 'Unknown error'}\n\nStack: ${event.error?.stack || 'No stack trace'}</pre>
          <button
            onclick="window.location.reload()"
            style="
              background: #059669;
              color: white;
              padding: 0.75rem 1.5rem;
              border-radius: 0.375rem;
              font-weight: 500;
              cursor: pointer;
            "
          >
            Reload Application
          </button>
        </div>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', {
    reason: event.reason,
    stack: event.reason?.stack,
  });
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        position: fixed;
        inset: 0;
        background: #fee2e2;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="
          max-width: 800px;
          width: 100%;
          background: white;
          padding: 2rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          border: 2px solid #ef4444;
        ">
          <h1 style="
            font-size: 1.5rem;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 1rem;
          ">Unhandled Promise Rejection</h1>
          <pre style="
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 0.375rem;
            overflow: auto;
            font-size: 0.875rem;
            margin-bottom: 1rem;
          ">${event.reason?.toString() || 'Unknown error'}\n\nStack: ${event.reason?.stack || 'No stack trace'}</pre>
          <button
            onclick="window.location.reload()"
            style="
              background: #059669;
              color: white;
              padding: 0.75rem 1.5rem;
              border-radius: 0.375rem;
              font-weight: 500;
              cursor: pointer;
            "
          >
            Reload Application
          </button>
        </div>
      </div>
    `;
  }
});

// Add performance timing
const startTime = performance.now();
console.debug('Looking for root element...');

// Ensure root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
  throw new Error('Root element not found');
}
console.debug('Root element found, creating root...');

try {
  const root = createRoot(rootElement);
  console.debug('Root created, rendering app...');
  
  // Wrap App in error boundary
  const AppWithErrorBoundary = () => {
    try {
      console.debug('App component starting to render...');
      return <App />;
    } catch (err) {
      const errMsg = err instanceof Error ? err.stack || err.message : String(err);
      console.error('Error in App component:', errMsg);
      return (
        <div style={{
          padding: '2rem',
          color: 'red',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <h1>Error in App Component</h1>
          <pre>{errMsg}</pre>
        </div>
      );
    }
  };

  root.render(
    <StrictMode>
      <AppWithErrorBoundary />
    </StrictMode>,
  );
  
  const endTime = performance.now();
  console.info(`App rendered successfully in ${(endTime - startTime).toFixed(2)}ms`);
} catch (err) {
  const errMsg = err instanceof Error ? err.stack || err.message : String(err);
  console.error('Error rendering app:', errMsg);
  rootElement.innerHTML = `
    <div style="
      position: fixed;
      inset: 0;
      background: #fee2e2;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <div style="
        max-width: 800px;
        width: 100%;
        background: white;
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        border: 2px solid #ef4444;
      ">
        <h1 style="
          font-size: 1.5rem;
          font-weight: bold;
          color: #dc2626;
          margin-bottom: 1rem;
        ">Error Loading Application</h1>
        <pre style="
          background: #f3f4f6;
          padding: 1rem;
          border-radius: 0.375rem;
          overflow: auto;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        ">${errMsg}</pre>
        <button
          onclick="window.location.reload()"
          style="
            background: #059669;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            font-weight: 500;
            cursor: pointer;
          "
        >
          Reload Application
        </button>
      </div>
    </div>
  `;
}
