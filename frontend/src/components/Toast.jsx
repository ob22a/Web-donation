import React, { useEffect } from 'react';
import '../style/components/Toast.css';

const Toast = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

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
