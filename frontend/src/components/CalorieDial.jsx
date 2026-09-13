import React from 'react';

export function CalorieDial({ calorieData }) {
    const { consumed = 0, remaining = 2000, goal = 2000, progress = 0 } = calorieData || {};

    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const safeProgress = Math.min(Math.max(0, progress), 100);
    const strokeDashoffset = circumference - (safeProgress / 100) * circumference;

    return (
        <div className="calorie-dial-container">
            <svg viewBox="0 0 190 190" className="calorie-dial-svg">
                <circle className="dial-track" cx="95" cy="95" r={radius} />
                <circle
                    className="dial-progress"
                    cx="95"
                    cy="95"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                />
            </svg>
            <div className="dial-info">
                <span className="dial-value">{Math.round(remaining)}</span>
                <span className="dial-label">Calories Remaining</span>
                <div className="dial-sub-info">
                    <div>
                        <label>Consumed</label>
                        <span>{consumed}</span>
                    </div>
                    <div className="dial-divider" />
                    <div>
                        <label>Goal</label>
                        <span>{goal}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CalorieDial;