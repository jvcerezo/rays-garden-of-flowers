import React from 'react';

const CalorieDial = ({ progress = 0, consumed = 0, remaining = 0, target = 2000 }) => {
    const radius = 78;
    const circumference = 2 * Math.PI * radius;
    const safeProgress = Math.min(Math.max(0, progress), 100);
    const offset = circumference - (safeProgress / 100) * circumference;
    const remainingText = remaining >= 0 ? `${remaining} kcal left` : `${Math.abs(remaining)} kcal over`;
    const remainingColor = remaining >= 0 ? '#047857' : '#be123c';
    const remainingBg = remaining >= 0 ? '#ecfdf5' : '#fff1f2';

    return (
        <div className="calorie-dial-container">
            <svg className="calorie-dial-svg" viewBox="0 0 190 190">
                <circle className="dial-track" cx="95" cy="95" r={radius} />
                <circle
                    className="dial-progress"
                    cx="95"
                    cy="95"
                    r={radius}
                    stroke="#10b981"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="dial-info">
                <span className="dial-value">{consumed}</span>
                <span className="dial-label">calories eaten</span>
                <span
                    className="dial-remaining"
                    style={{
                        color: remainingColor,
                        backgroundColor: remainingBg,
                    }}
                >
                    {remainingText}
                </span>
                <span className="dial-target-label">Target: {target} kcal</span>
            </div>
        </div>
    );
};

const WeightStat = ({ icon, label, value, unit }) => (
    <div className="weight-stat">
        <span className="weight-stat-icon">{icon}</span>
        <div className="weight-stat-info">
            <span className="weight-stat-label">{label}</span>
            <span className="weight-stat-value">
                {value} <span className="weight-stat-unit">{unit}</span>
            </span>
        </div>
    </div>
);

export function CalorieStatusHub({ calorieData, goals }) {
    const { consumed = 0, remaining = 0, progress = 0 } = calorieData || {};
    const { currentWeight, goalWeight, dailyCalories = 2000 } = goals || {};

    return (
        <div className="status-hub-card">
            <CalorieDial
                progress={progress}
                consumed={consumed}
                remaining={remaining}
                target={dailyCalories}
            />
            <div className="weight-panel">
                <WeightStat icon="⚖️" label="Current" value={currentWeight || '—'} unit="kg" />
                <div className="weight-divider" />
                <WeightStat icon="🎯" label="Goal" value={goalWeight || '—'} unit="kg" />
            </div>
        </div>
    );
}

export default CalorieStatusHub;