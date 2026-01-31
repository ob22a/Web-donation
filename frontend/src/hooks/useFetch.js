import { useState, useCallback } from 'react';
const useFetch = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchData = useCallback(async (apiCall, ...args) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiCall(...args);

            // Check for error responses from backend
            // Backend returns { message: "error message" } for errors
            if (response.error || response.message === "Server error" || response.message === "User not found") {
                throw new Error(response.message || "Something went wrong");
            }

            return response;
        } catch (err) {
            // Set error state for UI display and re-throw for caller handling
            setError(err.message);
            throw err;
        } finally {
            // Always clear loading state, even if error occurred
            setLoading(false);
        }
    }, []); // Empty deps: function doesn't depend on any props/state

    return { loading, error, fetchData };
};

export default useFetch;
