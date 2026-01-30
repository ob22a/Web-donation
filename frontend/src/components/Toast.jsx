import React, { useEffect, useRef } from 'react';
import '../style/components/Toast.css';

/**
 * Toast notification component that automatically dismisses after 3 seconds.
 * 
 * Why useRef for onClose: The onClose callback is stored in a ref to avoid
 * re-running the effect when the parent component re-renders with a new
 * onClose function reference. This prevents the timer from resetting unnecessarily.
 */
const Toast = ({ message, onClose }) => {
    const onCloseRef = useRef(onClose);
    
    // Keep ref updated without triggering effect re-run
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        const timer = setTimeout(() => {
            onCloseRef.current();
        }, 3000);
        return () => clearTimeout(timer);
    }, []); // Empty deps: timer runs once on mount

    return (
        <div className="toast-container">
            <div className="toast-message">
                <span className="toast-icon">✅</span>
                {message}
            </div>
        </div>
    );
};

export default Toast;
