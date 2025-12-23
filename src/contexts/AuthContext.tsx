import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService, tokenService } from '../services/authService';
import type { User, SignupData, SigninData, UpdateProfileData, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenService.getAccessToken();
      
      if (token) {
        try {
          const response = await authService.verifyToken();
          setUser(response.user);
        } catch (error) {
          console.error('Token verification failed:', error);
          tokenService.clearTokens();
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        await authService.refreshToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
      }
    }, 50 * 60 * 1000); // Refresh every 50 minutes (token expires in 1 hour)

    return () => clearInterval(refreshInterval);
  }, [user]);

  const signup = async (data: SignupData) => {
    const response = await authService.signup(data);
    setUser(response.user);
  };

  const signin = async (data: SigninData) => {
    const response = await authService.signin(data);
    setUser(response.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (data: UpdateProfileData) => {
    const response = await authService.updateProfile(data);
    setUser(response.user);
  };

  const refreshAccessToken = async () => {
    await authService.refreshToken();
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    signup,
    signin,
    logout,
    updateProfile,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};