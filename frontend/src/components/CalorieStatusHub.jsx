import React from 'react';
import { motion } from 'framer-motion';

const CalorieDial = ({ progress, consumed, remaining }) => {
    const radius = 85;
    const circumference = 2 * Math.PI * radius;
    // Ensure progress is never negative for the stroke offset calculation
    const safeProgress = Math.max(0, progress);
    const offset = circumference - (safeProgress / 100) * circumference;
    const remainingText = remaining >= 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over`;
    const remainingColor = remaining >= 0 ? '#059669' : '#ef4444'; // Green if remaining, red if over

    return (
        <div className="calorie-dial-container">
            <svg className="calorie-dial-svg">
                <circle className="dial-track" cx="100" cy="100" r={radius}></circle>
                <motion.circle 
                    className="dial-progress"
                    cx="100" cy="100" r={radius}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                ></motion.circle>
            </svg>
            <div className="dial-info">
                <span className="dial-value">{consumed}</span>
                <span className="dial-label">Calories Eaten</span>
                <span className="dial-remaining" style={{ color: remainingColor, backgroundColor: remaining >= 0 ? '#f0fdf4' : '#fee2e2' }}>
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
    const { consumed, remaining, progress } = calorieData;
    const { currentWeight, goalWeight } = goals;

    return (
        <motion.div 
            className="status-hub-card"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <CalorieDial progress={progress} consumed={consumed} remaining={remaining} />
            <div className="weight-panel">
                <WeightStat label="Current" value={currentWeight || 'N/A'} unit="kg" />
                <div className="weight-divider" />
                <WeightStat label="Goal" value={goalWeight || 'N/A'} unit="kg" />
            </div>
        </motion.div>
    );
}