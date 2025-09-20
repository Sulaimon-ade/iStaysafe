import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { PropertyGrid } from './components/PropertyGrid';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { useProperties } from './hooks/useProperties';
import { useEventConfig } from './hooks/useEventConfig';

// Simple admin authentication - in production, use proper authentication
const ADMIN_PASSWORD = 'admin123'; // Change this to a secure password
function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = React.useState(false);
  const [adminLoginError, setAdminLoginError] = React.useState<string | null>(null);

  const { properties, loading: propertiesLoading, error: propertiesError, refetch } = useProperties();
  const { eventConfig, loading: configLoading } = useEventConfig();

  const handleAdminLogin = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setAdminLoginError(null);
    } else {
      setAdminLoginError('Invalid password');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminLoginError(null);
  };

  const PublicApp = () => {
    const isLoading = propertiesLoading || configLoading;

    if (propertiesError) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ErrorMessage 
              message={propertiesError} 
              onRetry={refetch} 
            />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <Header eventConfig={eventConfig} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <PropertyGrid 
              properties={properties}
              eventConfig={eventConfig}
              loading={propertiesLoading}
              onPropertyUpdate={refetch}
            />
          )}
        </main>

        <footer className="bg-white border-t mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <p>&copy; 2025 Event Housing. All rights reserved.</p>
              {eventConfig && (
                <p className="mt-2 text-sm">
                  Questions? Contact us on WhatsApp: {eventConfig.whatsapp_number}
                </p>
              )}
            </div>
          </div>
        </footer>
      </div>
    );
  };
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicApp />} />
        <Route 
          path="/admin" 
          element={
            isAdminAuthenticated ? (
              <AdminDashboard onLogout={handleAdminLogout} />
            ) : (
              <AdminLogin onLogin={handleAdminLogin} error={adminLoginError} />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;