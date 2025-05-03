import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import AddEmployee from './pages/Employees/AddEmployee';
import ViewEmployee from './pages/Employees/ViewEmployee';
import PayrollProcess from './pages/PayrollProcess';
import Reports from './pages/Reports';
import TaxFiling from './pages/TaxFiling';
import Settings from './pages/Settings';
import EmployeePortal from './pages/Employee/EmployeePortal';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Blog from './pages/Blog';
import BlogPost from './pages/Blog/BlogPost';
import NewPost from './pages/Blog/NewPost';
import EditPost from './pages/Blog/EditPost';
import AdminDashboard from './pages/Blog/AdminDashboard';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import Terms from './pages/legal/Terms';
import CompanySetup from './pages/CompanySetup';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import FAQ from './pages/FAQ';
import TimeTracking from './pages/Employee/TimeTracking';
import Benefits from './pages/Employee/Benefits';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import MockAuth from './pages/auth/MockAuth';
import { useAuth } from './contexts/AuthContext';
import { syncManager } from './services/syncManager';
import { initDB } from './lib/indexedDB';

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Initialize IndexedDB
    initDB().catch(error => {
      console.error('Failed to initialize IndexedDB:', error);
    });

    // Start sync manager if user is authenticated
    if (user) {
      syncManager.start();
    }

    return () => {
      // Stop sync manager when component unmounts
      syncManager.stop();
    };
  }, [user]);

  return (
    <Routes>
      {/* Public routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/faq" element={<FAQ />} />
      </Route>

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/mock-auth" element={<MockAuth />} />
      
      {/* Protected routes */}
      <Route path="/setup" element={
        <ProtectedRoute isAuthenticated={!!user}>
          <CompanySetup />
        </ProtectedRoute>
      } />
      
      {/* Admin routes */}
      <Route path="/app" element={
        <ProtectedRoute isAuthenticated={!!user}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="employees/add" element={<AddEmployee />} />
        <Route path="employees/:id" element={<ViewEmployee />} />
        <Route path="payroll" element={<PayrollProcess />} />
        <Route path="reports" element={<Reports />} />
        <Route path="tax-filing" element={<TaxFiling />} />
        <Route path="settings" element={<Settings />} />
        <Route path="blog">
          <Route index element={<AdminDashboard />} />
          <Route path="new" element={<NewPost />} />
          <Route path="edit/:id" element={<EditPost />} />
        </Route>
      </Route>
      
      {/* Employee portal */}
      <Route path="/employee" element={
        <ProtectedRoute isAuthenticated={!!user}>
          <EmployeePortal />
        </ProtectedRoute>
      } />
      
      <Route path="/employee/timesheet" element={
        <ProtectedRoute isAuthenticated={!!user}>
          <TimeTracking />
        </ProtectedRoute>
      } />
      
      <Route path="/employee/benefits" element={
        <ProtectedRoute isAuthenticated={!!user}>
          <Benefits />
        </ProtectedRoute>
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}