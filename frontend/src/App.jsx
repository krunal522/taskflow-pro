// ============================================
// APP.TSX — Root component with all providers
// Enterprise structure: Redux + ReactQuery + Theme
// ============================================

import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ReduxProvider from './providers/ReduxProvider';
import QueryProvider from './providers/QueryProvider';
import ThemeProvider from './providers/ThemeProvider';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/ErrorBoundary';
import appConfig from './config/appConfig';
import './index.css';

function App() {
  return (
    <ReduxProvider>
      <QueryProvider>
        <ThemeProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>

            <Toaster
              position={appConfig.toast.position}
              toastOptions={{
                duration: appConfig.toast.duration,
                style: {
                  background: '#0f0f1a',
                  color: '#f8fafc',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                },
                success: { iconTheme: { primary: '#10b981', secondary: '#0f0f1a' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#0f0f1a' } },
              }}
            />
          </BrowserRouter>
        </ThemeProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}

export default App;
