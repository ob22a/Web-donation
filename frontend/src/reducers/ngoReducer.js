export const ngoInitialState = {
    ngoData: null,
    loading: false,
    error: null,
};

export const ngoReducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_NGO_START':
            return { ...state, loading: true, error: null };
        case 'FETCH_NGO_SUCCESS':
            return { ...state, loading: false, ngoData: action.payload, error: null };
        case 'FETCH_NGO_FAILURE':
            return { ...state, loading: false, error: action.payload };
        case 'UPDATE_NGO_DATA':
            return { ...state, ngoData: { ...state.ngoData, ...action.payload } };
        default:
            return state;
    }
};
