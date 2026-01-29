import { useState, useCallback } from 'react';

/**
 * Custom hook for handling API calls with loading, error, and data states.
 */
const useFetch = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async (apiCall, ...args) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiCall(...args);

            // Assume standardized response shape from backend: { message, ...data } or specific error
            if (response.error || response.message === "Server error" || response.message === "User not found") {
                throw new Error(response.message || "Something went wrong");
            }

            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, fetchData };
};

export default useFetch;
