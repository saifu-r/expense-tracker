import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => {
    const u = localStorage.getItem('auth_user');
    return u ? JSON.parse(u) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || null);

  function login(userData, authToken) {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('auth_user',  JSON.stringify(userData));
    localStorage.setItem('auth_token', authToken);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  }

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
