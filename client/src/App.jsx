import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BalanceEnquiryPage from './pages/BalanceEnquiryPage';
import TransferPage from './pages/TransferPage';
import DepositPage from './pages/DepositPage';
import TransactionsPage from './pages/TransactionsPage';
import DfaMonitorPage from './pages/DfaMonitorPage';
import DfaSimulatorPage from './pages/DfaSimulatorPage';
import NetworkMonitorPage from './pages/NetworkMonitorPage';
import AdminPage from './pages/AdminPage';
import ThreeSubjectsPage from './pages/ThreeSubjectsPage';

// Layout wrapper for authenticated banking pages (with sidebar)
function AuthenticatedLayout({ children }) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      {isAuthenticated && <Sidebar />}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

// Standalone layout for public pages (Landing, Login, Register, or open tools)
function PublicLayout({ children }) {
  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      {children}
    </main>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 transition-colors duration-200">
            <Navbar />

            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
              <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
              <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
              
              {/* Academic Demonstration Pages (Accessible by all or logged-in users) */}
              <Route path="/dfa-monitor" element={<AuthenticatedLayout><DfaMonitorPage /></AuthenticatedLayout>} />
              <Route path="/dfa-simulator" element={<AuthenticatedLayout><DfaSimulatorPage /></AuthenticatedLayout>} />
              <Route path="/network-monitor" element={<AuthenticatedLayout><NetworkMonitorPage /></AuthenticatedLayout>} />
              <Route path="/three-subject-integration" element={<AuthenticatedLayout><ThreeSubjectsPage /></AuthenticatedLayout>} />

              {/* Protected Banking Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <DashboardPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/balance-enquiry"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <BalanceEnquiryPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/balance"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <BalanceEnquiryPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transfer"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <TransferPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/deposit"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <DepositPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <TransactionsPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AuthenticatedLayout>
                      <AdminPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
