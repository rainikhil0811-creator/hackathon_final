import { createContext, useContext, useState } from 'react';

// Demo user that the app is pre-logged in as
const DEMO_USER = {
  email: 'demo@dukaansaathi.in',
  shopName: 'Ramesh Kirana Store',
  isDemo: true,
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Default = already logged in with the demo account
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ds_user');
      return saved ? JSON.parse(saved) : DEMO_USER;
    } catch {
      return DEMO_USER;
    }
  });

  const login = (userData) => {
    const u = userData || DEMO_USER;
    setUser(u);
    localStorage.setItem('ds_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ds_user');
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, DEMO_USER }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
