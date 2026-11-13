import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, accountApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('securebank_token'));
  const [loading, setLoading] = useState(true);
  const [lastDfaResult, setLastDfaResult] = useState(null);

  // Load user profile on startup if token exists
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('securebank_token');
      if (storedToken) {
        try {
          const res = await authApi.getProfile();
          if (res.data.success) {
            setUser(res.data.user);
            setAccount(res.data.account);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data.success) {
      const { token: newToken, user: userData, account: accountData, dfaValidation } = res.data;
      localStorage.setItem('securebank_token', newToken);
      setToken(newToken);
      setUser(userData);
      setAccount(accountData);
      setLastDfaResult(dfaValidation);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    if (res.data.success) {
      const { token: newToken, user: userData, account: accountData, dfaValidation } = res.data;
      localStorage.setItem('securebank_token', newToken);
      setToken(newToken);
      setUser(userData);
      setAccount(accountData);
      setLastDfaResult(dfaValidation);
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('securebank_token');
    setToken(null);
    setUser(null);
    setAccount(null);
    setLastDfaResult(null);
  };

  const refreshBalance = async () => {
    try {
      const res = await accountApi.getBalance();
      if (res.data.success) {
        setAccount(prev => ({
          ...prev,
          balance: res.data.balance,
          accountNumber: res.data.accountNumber
        }));
        return res.data.balance;
      }
    } catch (err) {
      console.warn('Failed to refresh balance:', err.message);
    }
  };

  const updateAccount = (updatedData) => {
    setAccount(prev => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        account,
        token,
        loading,
        lastDfaResult,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshBalance,
        updateAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
