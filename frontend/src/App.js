import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import "./App.css"; 

import Login from './components/Login';
import Dashboard from './components/Dashboard'; 
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user } = useAuth();

  return (
    <div className="phone-simulation-container">
      <div className="app-frame">
    <BrowserRouter>
      <Routes>
        {/*
          Route 1: Login Page
          If a logged-in user tries to go to /login, redirect them to the dashboard.
        */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login />} 
        />

        {/*
          Route 2: Dashboard Page (Protected)
          This route is wrapped by our ProtectedRoute component.
        */}
        <Route 
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/*
          Route 3: Root Path
          This will be the default page. It redirects to the dashboard if logged in,
          or to the login page if not.
        */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
        />
        
      </Routes>
    </BrowserRouter>
    </div>
  </div>
  );
}

export default App;
