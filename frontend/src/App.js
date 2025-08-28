import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast'; 
import "./App.css"; 

import Login from './components/Login';
import Dashboard from './components/Dashboard'; 
import ProtectedRoute from './components/ProtectedRoute';
import MovieWatchList from './components/MovieWatchList';
import DateIdeas from './components/DateIdeas'; // Assuming you have a DateIdeas component
import Reminders from './components/Reminders';
import CalorieTracker from './components/CalorieTracker';
import CurrentGoals from './components/CurrentGoals';
import PeriodTracker from './components/PeriodTracker'; // Assuming you have a PeriodTracker component
import HashPage from './components/HashPage';
import RayConnect from './components/RayConnect'; // Assuming you have a RayConnect component
import Playbook from './components/Playbook';
import PlaybookNote from './components/PlaybookNote';

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

        <Route 
          path="/movie-watch-list"
          element={
            <ProtectedRoute>
              <MovieWatchList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/period-tracker"
          element={
            <ProtectedRoute>
              <PeriodTracker />
            </ProtectedRoute>
          }
        />

        <Route
        path="/date-ideas"
        element={
          <ProtectedRoute>
            <DateIdeas />
          </ProtectedRoute>
        }
        />

        <Route
        path="/reminders"
        element={
          <ProtectedRoute>
            <Reminders />
          </ProtectedRoute>
        }
        />

        <Route
        path="/calorie-tracker"
        element={
          <ProtectedRoute>
            <CalorieTracker />
          </ProtectedRoute>
        }
        />

        <Route
        path="/current-goals"
        element={
          <ProtectedRoute>
            <CurrentGoals />
          </ProtectedRoute>
        }
        />
        <Route
          path="/ray-connect"
          element={
            <ProtectedRoute>
              <RayConnect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playbook"
          element={
            <ProtectedRoute>
              <Playbook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playbook/note/:noteId"
          element={
            <ProtectedRoute>
              <PlaybookNote />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hash"
          element={
              <HashPage />
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
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'white',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            boxShadow: 'var(--card-shadow)',
          },
        }}
      />
    </BrowserRouter>
    </div>
  </div>
  );
}

export default App;
