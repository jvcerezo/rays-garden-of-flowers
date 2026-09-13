import React from 'react';

const CalorieDial = ({ progress = 0, consumed = 0, remaining = 0 }) => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const safeProgress = Math.min(Math.max(0, progress), 100);
    const offset = circumference - (safeProgress / 100) * circumference;
    const remainingText = remaining >= 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over`;
    const remainingColor = remaining >= 0 ? '#059669' : '#ef4444';

    return (
        <div className="calorie-dial-container">
            <svg className="calorie-dial-svg" viewBox="0 0 190 190">
                <circle className="dial-track" cx="95" cy="95" r={radius} />
                <circle
                    className="dial-progress"
                    cx="95"
                    cy="95"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="dial-info">
                <span className="dial-value">{consumed}</span>
                <span className="dial-label">Calories Eaten</span>
                <span
                    className="dial-remaining"
                    style={{
                        color: remainingColor,
                        backgroundColor: remaining >= 0 ? '#f0fdf4' : '#fee2e2',
                    }}
                >
                    {remainingText}
                </span>
            </div>
        </div>
    );
};

const WeightStat = ({ label, value, unit }) => (
    <div className="weight-stat">
        <span className="weight-stat-value">{value}</span>
        <div className="weight-stat-label">
            <span>{label}</span>
            <span className="weight-stat-unit">{unit}</span>
        </div>
    </div>
);

export function CalorieStatusHub({ calorieData, goals }) {
    const { consumed = 0, remaining = 0, progress = 0 } = calorieData || {};
    const { currentWeight, goalWeight } = goals || {};

    return (
        <div className="status-hub-card">
            <CalorieDial progress={progress} consumed={consumed} remaining={remaining} />
            <div className="weight-panel">
                <WeightStat label="Current" value={currentWeight || 'N/A'} unit="kg" />
                <div className="weight-divider" />
                <WeightStat label="Goal" value={goalWeight || 'N/A'} unit="kg" />
            </div>
        </div>
    );
}

export default CalorieStatusHub;