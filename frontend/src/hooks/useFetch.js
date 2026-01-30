import { useState, useCallback } from 'react';

/**
 * Custom hook for handling API calls with loading, error, and data states.
 * 
 * Architecture: Centralizes common API call patterns (loading state, error handling)
 * to reduce boilerplate across components. Each component can use this hook instead
 * of managing loading/error state individually.
 * 
 * Why useCallback for fetchData: The function is returned and likely used in
 * useEffect dependencies or passed to child components. Without useCallback, it
 * would be recreated on every render, potentially causing infinite loops or
 * unnecessary re-renders.
 * 
 * Error handling: Checks for common error patterns in backend responses and
 * converts them to Error objects. The error is both set in state (for UI display)
 * and thrown (so callers can handle it if needed).
 */
const useFetch = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Execute an API call with automatic loading and error state management.
     * 
     * @param {Function} apiCall - The API function to call
     * @param {...any} args - Arguments to pass to the API function
     * @returns {Promise<any>} The API response data
     * @throws {Error} If the API call fails or returns an error response
     */
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
