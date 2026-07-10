import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Contexts
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SOSButton } from './components/SOSButton';
import { AIChatbotModal } from './components/AIChatbotModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { PetOwnerPortal } from './pages/PetOwnerPortal';
import { VeterinarianPortal } from './pages/VeterinarianPortal';
import { AdminPortal } from './pages/AdminPortal';
import { Veterinarians } from './pages/Veterinarians';
import { BookAppointmentWizard } from './pages/BookAppointmentWizard';
import { NotFound } from './pages/NotFound';
import { AboutPage, ServicesPage, EmergencyPage, ContactPage, PrivacyPage, TermsPage } from './pages/InfoPages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Protected Route wrapper
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their correct portal
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'veterinarian') return <Navigate to="/vet" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/vets" element={<Veterinarians />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route
            path="/login"
            element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'veterinarian' ? '/vet' : '/dashboard'} replace /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/dashboard" replace /> : <Register />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Pet Owner Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['pet_owner']}>
                <PetOwnerPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book"
            element={
              <ProtectedRoute allowedRoles={['pet_owner']}>
                <BookAppointmentWizard />
              </ProtectedRoute>
            }
          />

          {/* Veterinarian Protected Routes */}
          <Route
            path="/vet"
            element={
              <ProtectedRoute allowedRoles={['veterinarian']}>
                <VeterinarianPortal />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPortal />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />

      {/* Floating Global Widgets — only for authenticated pet owners */}
      {user && user.role === 'pet_owner' && <SOSButton />}

      {/* AI Chatbot available to everyone */}
      <AIChatbotModal />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
