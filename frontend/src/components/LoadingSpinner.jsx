import React from 'react';

export const LoadingSpinner = ({ text = "Loading..." }) => {
    return (
        <div className="loading-container">
            <div className="loading-circle-spinner" />
            {text && <p className="loading-text">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
