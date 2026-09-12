import React from 'react';
import { motion } from 'framer-motion';

const CalorieDial = ({ progress, consumed, remaining, target }) => {
    const radius = 85;
    const circumference = 2 * Math.PI * radius;
    // Ensure progress is never negative for the stroke offset calculation
    const safeProgress = Math.min(100, Math.max(0, progress));
    const offset = circumference - (safeProgress / 100) * circumference;
    const isOver = remaining < 0;
    const remainingText = isOver ? `${Math.abs(remaining)} cal over` : `${remaining} cal left`;
    const dialStrokeColor = isOver ? '#f43f5e' : '#10b981';
    const pillBg = isOver ? '#fff1f2' : '#ecfdf5';
    const pillColor = isOver ? '#e11d48' : '#059669';

    return (
        <div className="calorie-dial-container">
            <svg viewBox="0 0 200 200" className="calorie-dial-svg">
                <circle className="dial-track" cx="100" cy="100" r={radius}></circle>
                <motion.circle 
                    className="dial-progress"
                    cx="100" cy="100" r={radius}
                    stroke={dialStrokeColor}
                    strokeDasharray={`${circumference} ${circumference}`}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ 
                        strokeDashoffset: offset,
                        opacity: safeProgress > 0 ? 1 : 0
                    }}
                    transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                ></motion.circle>
            </svg>
            <div className="dial-info">
                <span className="dial-value">{consumed}</span>
                <span className="dial-label">Calories Eaten</span>
                <span className="dial-remaining" style={{ color: pillColor, backgroundColor: pillBg }}>
                    {remainingText}
                </span>
                {target > 0 && (
                    <span className="dial-target-caption">Target: {target} cal</span>
                )}
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
    const { currentWeight, goalWeight, dailyCalories } = goals;

    const weightDifference = (currentWeight && goalWeight && currentWeight > goalWeight)
        ? (currentWeight - goalWeight).toFixed(1)
        : null;

    return (
        <motion.div 
            className="status-hub-card"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            <CalorieDial 
                progress={progress} 
                consumed={consumed} 
                remaining={remaining} 
                target={dailyCalories} 
            />
            <div className="weight-panel">
                <WeightStat label="Current" value={currentWeight || '—'} unit="kg" />
                <div className="weight-divider" />
                <WeightStat label="Goal" value={goalWeight || '—'} unit="kg" />
            </div>
            {weightDifference && (
                <div className="weight-delta-pill">
                    <span>🎯 {weightDifference} kg to reach target weight</span>
                </div>
            )}
        </motion.div>
    );
}