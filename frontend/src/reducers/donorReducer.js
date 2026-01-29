export const donorInitialState = {
    donorData: null,
    loading: false,
    error: null,
};

export const donorReducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_DONOR_START':
            return { ...state, loading: true, error: null };
        case 'FETCH_DONOR_SUCCESS':
            return { ...state, loading: false, donorData: action.payload, error: null };
        case 'FETCH_DONOR_FAILURE':
            return { ...state, loading: false, error: action.payload };
        case 'UPDATE_DONOR_DATA':
            return { ...state, donorData: { ...state.donorData, ...action.payload } };
        default:
            return state;
    }
};
