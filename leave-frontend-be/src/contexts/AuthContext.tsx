import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/sonner';
import { jwtDecode } from 'jwt-decode';

// Define the backend DTO structure
type UserProfileDto = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STAFF' | 'ADMIN';
  msProfilePictureUrl: string | null;
  department: string | null;
  team: string | null;
  totalLeaveAllowance: number;
  usedLeaveDays: number;
};

// Define the expected structure of the JWT payload (only for expiry check now)
type JwtPayload = {
  sub: string; // Subject (usually email)
  exp: number; // Expiration time (Unix timestamp)
  // Other claims might exist but aren't strictly needed here
};

// Frontend User type - derived from UserProfileDto
type User = {
  id: number;
  name: string; // Combined name for display
  email: string;
  role: 'STAFF' | 'ADMIN';
  firstName: string;
  lastName: string;
  department: string | null;
  team: string | null;
  profilePictureUrl: string | null;
  totalLeaveAllowance: number;
  usedLeaveDays: number;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  twoFactorPending: boolean;
  pendingEmail: string | null;
  verifyTwoFactor: (code: number) => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [twoFactorPending, setTwoFactorPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  // Helper to fetch user profile
  const fetchUserProfile = async (): Promise<User | null> => {
    try {
      const response = await axiosInstance.get<UserProfileDto>('/users/me');
      const profile = response.data;
      const fetchedUser: User = {
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        name: `${profile.firstName} ${profile.lastName}`.trim(), // Combine name
        role: profile.role,
        department: profile.department,
        team: profile.team,
        profilePictureUrl: profile.msProfilePictureUrl,
        totalLeaveAllowance: profile.totalLeaveAllowance,
        usedLeaveDays: profile.usedLeaveDays,
      };
      // Store fetched user in localStorage
      localStorage.setItem('user', JSON.stringify(fetchedUser));
      return fetchedUser;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Clear potentially stale token/user if profile fetch fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  };

  // Check auth state on initial load
  useEffect(() => {
    let isMounted = true; // Prevent state updates on unmounted component
    const checkAuthState = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      let currentUser: User | null = null;

      if (token) {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          if (decoded.exp * 1000 > Date.now()) {
            // Token exists and is not expired, fetch fresh profile data
            currentUser = await fetchUserProfile();
          } else {
            // Token expired
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          // Invalid token
          console.error('Invalid token during initial check:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      if (isMounted) {
        setUser(currentUser); // Set user (null if token invalid/expired/missing or fetch failed)
        setIsLoading(false);
      }
    };

    checkAuthState();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, []); // Run only on mount

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post<{ token?: string; twoFactorRequired: boolean }>('/auth/authenticate', {
        email,
        password,
      });

      const { token, twoFactorRequired } = response.data;
      // If 2FA is required, prompt for code
      if (twoFactorRequired) {
        setTwoFactorPending(true);
        setPendingEmail(email);
        navigate('/2fa-verify');
        return;
      }

      localStorage.setItem('token', token as string);

      // IMPORTANT: Set token for subsequent requests BEFORE fetching profile
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Fetch user profile AFTER setting the token
      const loggedInUser = await fetchUserProfile();

      if (loggedInUser) {
        setUser(loggedInUser); // Set user state
        toast.success('Logged in successfully!');
        navigate('/dashboard');
      } else {
        // Handle case where profile fetch failed after successful login
        toast.error('Login succeeded but failed to fetch user details.');
        // Optionally logout user here
        logout();
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Error is handled by interceptor, but clear local storage just in case
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;

      // Fetch required fields from backend DTO (firstName, lastName, email, password are essential)
      // Add department, team, etc., if collected during registration
      await axiosInstance.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        // department: collectedDepartment, // Example
        // team: collectedTeam,          // Example
      });

      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      // Error handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Remove auth header from axios defaults
    delete axiosInstance.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';

  // Complete login by verifying 2FA code
  const verifyTwoFactor = async (code: number) => {
    if (!pendingEmail) return;
    setIsLoading(true);
    try {
      const response = await axiosInstance.post<{ token: string }>('/auth/2fa/authenticate', {
        email: pendingEmail,
        code,
      });
      const { token } = response.data;
      localStorage.setItem('token', token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const loggedInUser = await fetchUserProfile();
      if (loggedInUser) {
        setUser(loggedInUser);
        toast.success('Logged in successfully!');
        navigate('/dashboard');
      }
      // Clear pending state
      setTwoFactorPending(false);
      setPendingEmail(null);
    } catch (error) {
      console.error('2FA verification failed:', error);
      toast.error('Invalid authentication code');
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    twoFactorPending,
    pendingEmail,
    verifyTwoFactor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
