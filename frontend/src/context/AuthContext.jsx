import React, { createContext, useReducer, useContext, useEffect, useCallback } from 'react';
import { authReducer, authInitialState } from '../reducers/authReducer';
import { getProfile, logoutUser } from '../apis/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, authInitialState);

  // Initialize auth state from backend on mount
  useEffect(() => {
    const initAuth = async () => {
      dispatch({ type: 'LOGIN_START' });
      try {
        const response = await getProfile();
        if (response.user) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
        } else {
          dispatch({ type: 'LOGIN_FAILURE', payload: null });
        }
      } catch (err) {
        dispatch({ type: 'LOGIN_FAILURE', payload: err.message });
      }
    };
    initAuth();
  }, []);

  const login = useCallback((userData) => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      dispatch({ type: 'LOGOUT' });
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }, []);

  const updateUser = useCallback((updates) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  }, []);

  const value = {
    user: state.user,
    isLoggedIn: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    updateUser,
    dispatch // Expose dispatch for complex actions if needed
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
