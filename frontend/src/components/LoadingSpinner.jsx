import React from 'react';

export const LoadingSpinner = ({ text = 'Loading...', size = 38 }) => {
    return (
        <div className="loading-container">
            <div 
                className="loading-circle-spinner" 
                style={{ width: `${size}px`, height: `${size}px` }}
                aria-label="Loading"
            />
            {text && <p className="loading-text">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
