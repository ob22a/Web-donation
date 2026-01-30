/**
 * Initial state for authentication reducer.
 * 
 * Architecture: Defines the shape of auth state used throughout the app.
 * All auth-related state is centralized here for consistency.
 */
export const authInitialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

/**
 * Authentication reducer for managing auth state.
 * 
 * Architecture: Uses Redux-style reducer pattern with action types.
 * This provides predictable state updates and makes state transitions explicit.
 * 
 * Action types:
 * - LOGIN_START: Set loading state during auth check
 * - LOGIN_SUCCESS: Set authenticated user and clear loading/error
 * - LOGIN_FAILURE: Clear user, set error message
 * - LOGOUT: Reset to initial state
 * - UPDATE_USER: Merge updates into existing user object
 * 
 * Why reducer pattern: Centralizes all auth state logic in one place,
 * making it easier to reason about state changes and debug issues.
 */
export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                ...state,
                loading: true,
                error: null, // Clear any previous errors
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                loading: false,
                isAuthenticated: true,
                user: action.payload, // User object from backend
                error: null,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                user: null,
                error: action.payload, // Error message string
            };
        case 'LOGOUT':
            // Reset to initial state (complete logout)
            return {
                ...authInitialState,
            };
        case 'UPDATE_USER':
            // Merge updates into existing user object
            // This allows partial updates without replacing entire user object
            return {
                ...state,
                user: { ...state.user, ...action.payload },
            };
        default:
            // Return unchanged state for unknown actions
            return state;
    }
};
