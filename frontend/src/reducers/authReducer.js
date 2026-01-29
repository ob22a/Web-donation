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
                error: null,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                loading: false,
                isAuthenticated: true,
                user: action.payload,
                error: null,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                user: null,
                error: action.payload,
            };
        case 'LOGOUT':
            return {
                ...authInitialState,
            };
        case 'UPDATE_USER':
            return {
                ...state,
                user: { ...state.user, ...action.payload },
            };
        default:
            return state;
    }
};
