import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'pet_owner' | 'veterinarian' | 'admin';
  phone?: string;
  avatarUrl?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

interface VetProfile {
  _id: string;
  specialization: string;
  experience: number;
  clinicName: string;
  clinicAddress: string;
  consultingFee: number;
  licenseNumber: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  services: string[];
  availability: Array<{ day: string; slots: string[] }>;
}

interface AuthContextType {
  user: UserProfile | null;
  vetProfile: VetProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerUser: (formData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<void>;
  googleLogin: (googleData: { email: string; name: string; avatarUrl: string; googleId: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Set Axios defaults using environment configuration for local and Azure deployments
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
axios.defaults.baseURL = apiBaseUrl;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [vetProfile, setVetProfile] = useState<VetProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await axios.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setVetProfile(res.data.vetProfile);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Fetch me failed:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    
    fetchMe();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await axios.post('/auth/login', { email, password });
    if (res.data.success) {
      const newToken = res.data.token;
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setUser(res.data.user);
      setVetProfile(res.data.vetProfile);
      setToken(newToken);
    }
  };

  const registerUser = async (formData: any) => {
    const res = await axios.post('/auth/register', formData);
    if (res.data.success) {
      const newToken = res.data.token;
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setUser(res.data.user);
      setToken(newToken);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setVetProfile(null);
    setToken(null);
  };

  const updateProfile = async (profileData: any) => {
    const res = await axios.put('/auth/update-profile', profileData);
    if (res.data.success) {
      setUser(res.data.user);
      setVetProfile(res.data.vetProfile);
    }
  };

  const googleLogin = async (googleData: { email: string; name: string; avatarUrl: string; googleId: string }) => {
    const res = await axios.post('/auth/google-login', googleData);
    if (res.data.success) {
      const newToken = res.data.token;
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setUser(res.data.user);
      setToken(newToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        vetProfile,
        token,
        loading,
        login,
        registerUser,
        logout,
        updateProfile,
        googleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
