import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    else localStorage.removeItem('accessToken');
  }, [accessToken]);

  useEffect(() => {
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    else localStorage.removeItem('refreshToken');
  }, [refreshToken]);

  const register = async (email, password, name) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Registration failed');
      }
      const data = await res.json();
      setUser(data.user);
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Login failed');
      }
      const data = await res.json();
      setUser(data.user);
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (refreshToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) return null;
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      if (!res.ok) throw new Error('Refresh failed');
      const data = await res.json();
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch (e) {
      console.error('Token refresh failed:', e);
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      return null;
    }
  };

  const authFetch = async (url, options = {}) => {
    let token = accessToken;
    const tryRequest = async (t) => {
      const res = await fetch(url, {
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${t}` }
      });
      return res;
    };
    let res = await tryRequest(token);
    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        res = await tryRequest(newToken);
      }
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, register, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}
