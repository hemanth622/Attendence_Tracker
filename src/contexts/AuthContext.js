import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Register function
  const register = (userData) => {
    const users = JSON.parse(localStorage.getItem('attendanceUsers') || '{}');
    
    // Check if user already exists
    if (users[userData.studentId]) {
      throw new Error('Student ID already exists!');
    }

    // Check if email exists
    const emailExists = Object.values(users).some(user => user.email === userData.email);
    if (emailExists) {
      throw new Error('Email already registered!');
    }

    // Create new user
    const newUser = {
      ...userData,
      createdAt: new Date().toISOString()
    };
    
    users[userData.studentId] = newUser;
    localStorage.setItem('attendanceUsers', JSON.stringify(users));
    
    // Log in the new user
    login(newUser);
    
    return newUser;
  };

  // Context value
  const value = {
    currentUser,
    login,
    logout,
    register,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 