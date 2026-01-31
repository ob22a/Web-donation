import React, { useEffect, useRef } from 'react';
import '../style/components/Toast.css';
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
                {message}
            </div>
        </div>
    );
};

export default Toast;
