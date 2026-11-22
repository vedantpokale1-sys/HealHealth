import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';

// Authenticated Pages
import { DashboardPage } from './pages/DashboardPage';
import { AiNavigatorPage } from './pages/AiNavigatorPage';
import { DoctorDiscoveryPage } from './pages/DoctorDiscoveryPage';
import { DoctorProfilePage } from './pages/DoctorProfilePage';
import { AppointmentBookingPage } from './pages/AppointmentBookingPage';
import { MyAppointmentsPage } from './pages/MyAppointmentsPage';
import { ReportAnalyzerPage } from './pages/ReportAnalyzerPage';
import { HealthRecordsPage } from './pages/HealthRecordsPage';
import { MedicationManagerPage } from './pages/MedicationManagerPage';
import { FamilyHealthPage } from './pages/FamilyHealthPage';
import { LocationsPage } from './pages/LocationsPage';

// Heavy 3D route — lazy-loaded so the anatomical viewer and Three.js
// never slow down the main bundle.
const BodyExplorerPage = React.lazy(() =>
  import('./pages/BodyExplorerPage').then((m) => ({ default: m.BodyExplorerPage }))
);
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpSupportPage } from './pages/HelpSupportPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Public Marketing & Auth */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* Authenticated Clinical SaaS Shell */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/ai-navigator" element={<AiNavigatorPage />} />
              <Route path="/doctors" element={<DoctorDiscoveryPage />} />
              <Route path="/doctors/:doctorId" element={<DoctorProfilePage />} />
              <Route path="/locations" element={<LocationsPage />} />
              <Route path="/booking/:doctorId" element={<AppointmentBookingPage />} />
              <Route path="/appointments" element={<MyAppointmentsPage />} />
              <Route path="/reports/analyzer" element={<ReportAnalyzerPage />} />
              <Route path="/health-records" element={<HealthRecordsPage />} />
              <Route path="/medications" element={<MedicationManagerPage />} />
              <Route path="/family-health" element={<FamilyHealthPage />} />
              <Route
                path="/body-explorer"
                element={
                  <React.Suspense
                    fallback={
                      <div className="h-64 flex flex-col items-center justify-center gap-3 text-sm text-slate-500">
                        <span className="w-7 h-7 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
                        Preparing the 3D anatomy viewer…
                      </div>
                    }
                  >
                    <BodyExplorerPage />
                  </React.Suspense>
                }
              />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpSupportPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
