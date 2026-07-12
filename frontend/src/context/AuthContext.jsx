import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginThunk,
  registerThunk,
  logoutThunk,
  loadUserThunk,
} from '../store/slices/authSlice';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      dispatch(loadUserThunk()).finally(() => setInitialized(true));
    } else {
      setInitialized(true);
    }
  }, [dispatch]);

  const login = useCallback(
    async (credentials) => {
      const result = await dispatch(loginThunk(credentials));
      if (loginThunk.rejected.match(result)) {
        throw new Error(result.payload);
      }
      return result;
    },
    [dispatch]
  );

  const register = useCallback(
    async (userData) => {
      const result = await dispatch(registerThunk(userData));
      if (registerThunk.rejected.match(result)) {
        throw new Error(result.payload);
      }
      return result;
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutThunk());
  }, [dispatch]);

  const value = {
    user,
    isAuthenticated,
    loading: loading || !initialized,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
