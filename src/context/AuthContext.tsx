import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Language } from '../types';
import { INITIAL_USER } from '../data/mockData';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setLanguage: (lang: Language) => void;
  language: Language;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('healhealth_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('healhealth_auth') === 'true' || true; // default demo authenticated for smooth testing
  });
  const [language, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('healhealth_lang') as Language) || 'en';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('healhealth_user', JSON.stringify(user));
    }
    localStorage.setItem('healhealth_auth', isAuthenticated ? 'true' : 'false');
    localStorage.setItem('healhealth_lang', language);
  }, [user, isAuthenticated, language]);

  const login = async (email: string, _pass: string) => {
    setIsAuthenticated(true);
    setUser(prev => prev ? { ...prev, email } : { ...INITIAL_USER, email });
    return true;
  };

  const signup = async (name: string, email: string, _pass: string) => {
    setIsAuthenticated(true);
    setUser({ ...INITIAL_USER, name, email });
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    if (user) {
      setUser(prev => prev ? { ...prev, preferredLanguage: lang } : null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, updateProfile, setLanguage, language }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
