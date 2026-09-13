import React from 'react';

export const CycleDisplay = ({ cycleInfo }) => {
    const { primaryText, secondaryText, progress = 0, phase = 'initial' } = cycleInfo || {};

    const radius = 105;
    const circumference = 2 * Math.PI * radius;
    const validProgress = Math.min(Math.max(progress, 0), 100);
    const offset = circumference - (validProgress / 100) * circumference;

    const normalizedPhase = phase ? phase.toLowerCase().replace(/\s+/g, '-') : 'initial';

    return (
        <div className="cycle-display-container">
            <svg className="cycle-svg" viewBox="0 0 240 240">
                <circle
                    className="cycle-track"
                    cx="120"
                    cy="120"
                    r={radius}
                />
                <circle
                    className={`cycle-progress phase-${normalizedPhase}`}
                    cx="120"
                    cy="120"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="cycle-info">
                <span className="cycle-primary-text">{primaryText}</span>
                <span className="cycle-secondary-text">{secondaryText}</span>
            </div>
        </div>
    );
};