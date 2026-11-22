import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Language } from '../types';
import { INITIAL_USER } from '../data/mockData';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
  quickDemoLogin: () => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setLanguage: (lang: Language) => void;
  language: Language;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('healhealth_auth') === 'true';
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const isAuth = localStorage.getItem('healhealth_auth') === 'true';
    if (!isAuth) return null;
    const saved = localStorage.getItem('healhealth_user');
    if (!saved) return INITIAL_USER;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_USER;
    }
  });

  const [language, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('healhealth_lang') as Language) || 'en';
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem('healhealth_user', JSON.stringify(user));
      localStorage.setItem('healhealth_auth', 'true');
    } else if (!isAuthenticated) {
      localStorage.removeItem('healhealth_auth');
      localStorage.removeItem('healhealth_user');
    }
    localStorage.setItem('healhealth_lang', language);
  }, [user, isAuthenticated, language]);

  const login = async (email: string, _pass: string) => {
    setIsAuthenticated(true);
    const existing = localStorage.getItem('healhealth_user');
    let u: UserProfile;
    if (existing) {
      try {
        u = { ...JSON.parse(existing), email };
      } catch {
        u = { ...INITIAL_USER, email };
      }
    } else {
      const displayName =
        email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || INITIAL_USER.name;
      u = { ...INITIAL_USER, email, name: displayName };
    }
    setUser(u);
    localStorage.setItem('healhealth_auth', 'true');
    localStorage.setItem('healhealth_user', JSON.stringify(u));
    return true;
  };

  const signup = async (name: string, email: string, _pass: string) => {
    setIsAuthenticated(true);
    const u: UserProfile = { ...INITIAL_USER, name, email };
    setUser(u);
    localStorage.setItem('healhealth_auth', 'true');
    localStorage.setItem('healhealth_user', JSON.stringify(u));
    return true;
  };

  const quickDemoLogin = () => {
    setIsAuthenticated(true);
    setUser(INITIAL_USER);
    localStorage.setItem('healhealth_auth', 'true');
    localStorage.setItem('healhealth_user', JSON.stringify(INITIAL_USER));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('healhealth_auth');
    localStorage.removeItem('healhealth_user');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    if (user) {
      setUser((prev) => (prev ? { ...prev, preferredLanguage: lang } : null));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        signup,
        quickDemoLogin,
        logout,
        updateProfile,
        setLanguage,
        language,
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
