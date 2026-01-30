import React, { createContext, useReducer, useContext, useEffect, useCallback, useMemo } from 'react';
import { authReducer, authInitialState } from '../reducers/authReducer';
import { getProfile, logoutUser } from '../apis/auth';

/**
 * Authentication Context
 * 
 * Architecture: Uses React Context API with useReducer for global auth state management.
 * This prevents prop drilling and provides a single source of truth for authentication
 * across the entire application.
 * 
 * Why Context here: Authentication state (user, login status) is needed by many components
 * throughout the app (Header, Sidebar, protected routes, etc.). Context eliminates the
 * need to pass auth props through multiple component layers.
 */
const AuthContext = createContext(null);

/**
 * AuthProvider component that wraps the app and provides authentication state.
 * 
 * State management: Uses useReducer for predictable state updates. The reducer
 * handles all auth-related actions (LOGIN_START, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, UPDATE_USER).
 * 
 * Auto-initialization: On mount, checks if user is already authenticated by calling
 * the backend profile endpoint. This allows users to stay logged in across page refreshes
 * if their cookie is still valid.
 */
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, authInitialState);

  /**
   * Initialize auth state from backend on mount.
   * 
   * Why this is needed: When the app loads, we need to check if the user has a valid
   * session cookie. If they do, we restore their auth state without requiring a new login.
   * This provides a seamless user experience.
   */
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

  /**
   * Login function - updates auth state with user data.
   * 
   * Why useCallback: This function is passed to child components and included in
   * the context value. Without useCallback, it would be recreated on every render,
   * causing unnecessary re-renders of components that consume this context.
   */
  const login = useCallback((userData) => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
  }, []); // No deps: dispatch is stable from useReducer

  /**
   * Logout function - clears auth state and calls backend logout endpoint.
   * 
   * Why backend call: The backend clears the HttpOnly cookie. We also clear
   * local state to ensure complete logout even if the backend call fails.
   */
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

  /**
   * Update user function - merges updates into existing user state.
   * 
   * Use case: When profile is updated, we can update the auth context user
   * without requiring a full re-fetch. This keeps the UI in sync with backend changes.
   */
  const updateUser = useCallback((updates) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  }, []); // No deps: dispatch is stable

  /**
   * Refresh profile function - re-fetches user data from backend.
   * 
   * Use case: When backend data changes indirectly (e.g., after a donation, 
   * totalDonated and badges might change). Calling this ensures the frontend 
   * has the most up-to-date user statistics.
   */
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

  /**
   * Context value object.
   * 
   * Why useMemo: The value object is recreated on every render. By memoizing it,
   * we prevent unnecessary re-renders of components that consume this context.
   * Components only re-render when actual auth state changes, not on every provider render.
   */
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

/**
 * Custom hook to access auth context.
 * 
 * Why custom hook: Provides a cleaner API than useContext(AuthContext) and
 * allows for future enhancements (e.g., error handling if used outside provider).
 */
export const useAuth = () => useContext(AuthContext);
