import React, { createContext, useReducer, useContext, useEffect, useCallback, useMemo } from 'react';
import { authReducer, authInitialState } from '../reducers/authReducer';
import { getProfile, logoutUser } from '../apis/auth';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, authInitialState);
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
        // User is not authenticated or session expired
        dispatch({ type: 'LOGIN_FAILURE', payload: err.message });
      }
    };
    initAuth();
  }, []); // Empty deps: run once on mount
  const login = useCallback((userData) => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
  }, []); // No deps: dispatch is stable from useReducer
  const logout = useCallback(async () => {
    try {
      await logoutUser(); // Clear cookie on backend
      dispatch({ type: 'LOGOUT' }); // Clear local state
    } catch (err) {
      console.error('Logout failed:', err);
      // Still clear local state even if backend call fails
      dispatch({ type: 'LOGOUT' });
    }
  }, []); // No deps: dispatch is stable
  const updateUser = useCallback((updates) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  }, []); // No deps: dispatch is stable
  const refreshProfile = useCallback(async () => {
    try {
      const response = await getProfile();
      if (response.user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  }, []); // No deps: dispatch is stable
  const value = useMemo(() => ({
    user: state.user,
    isLoggedIn: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    updateUser,
    refreshProfile,
    dispatch // Expose dispatch for complex actions if needed
  }), [state.user, state.isAuthenticated, state.loading, state.error, login, logout, updateUser, refreshProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
