export const authInitialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

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
