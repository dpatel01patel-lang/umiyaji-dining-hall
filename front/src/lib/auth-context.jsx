import React, { createContext, useContext, useState, useEffect } from "react";
import { getApiUrl } from "./config";

export const UserProfile = {
  uid: null,
  email: null,
  phone: null,
  name: null,
  role: "user",
  createdAt: null,
  token: null,
};

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const storedUserProfile = localStorage.getItem('user_profile');
        
        if (token && storedUserProfile) {
          const profile = JSON.parse(storedUserProfile);
          
          // Only verify token if it's been more than 24 hours or if we're on a critical route
          const lastVerify = localStorage.getItem('last_auth_verify');
          const now = Date.now();
          const twentyFourHours = 24 * 60 * 60 * 1000;
          
          // Skip verification if recently verified and not on a protected route
          if (lastVerify && (now - parseInt(lastVerify)) < twentyFourHours) {
            setCurrentUser(profile);
            setUserProfile(profile);
            setLoading(false);
            return;
          }
          
          // Verify token is still valid
          const response = await fetch(getApiUrl("auth/verify"), {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setCurrentUser(data.data.user);
            setUserProfile({
              ...profile,
              token: token
            });
            localStorage.setItem('last_auth_verify', now.toString());
          } else {
            // Token is invalid, clear stored data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_profile');
            localStorage.removeItem('last_auth_verify');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_profile');
        localStorage.removeItem('last_auth_verify');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const updateUserProfile = (data) => {
    const profile = {
      uid: data.user.uid,
      email: data.user.email,
      phone: data.user.phone,
      name: data.user.name,
      role: data.user.role,
      createdAt: data.user.createdAt,
      token: data.token
    };
    
    setCurrentUser(data.user);
    setUserProfile(profile);
    
    // Store in localStorage
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user_profile', JSON.stringify(profile));
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Call logout endpoint to invalidate token on server
        await fetch(getApiUrl("auth/logout"), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state regardless of server response
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_profile');
      setCurrentUser(null);
      setUserProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        logout,
        isConfigured: true,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
