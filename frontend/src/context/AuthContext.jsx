import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';

// 1. Create the context
const AuthContext = createContext();

// 2. Create a custom hook for easy access to the context
export function useAuth() {
  return useContext(AuthContext);
}

// 3. Create the Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully.');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  // This effect runs once on mount to set up the auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Set loading to false once we get the user status
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // The value that will be available to all children components
  const value = {
    user,
    logout: handleLogout,
  };

  // We don't render the app until we know if the user is logged in or not
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
