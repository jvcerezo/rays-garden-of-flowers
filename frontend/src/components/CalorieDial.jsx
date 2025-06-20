import React from 'react';
import { motion } from 'framer-motion';

export function CalorieDial({ calorieData }) {
    const { consumed = 0, remaining = 2000, goal = 2000, progress = 0 } = calorieData;

    const circumference = 2 * Math.PI * 90;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="calorie-dial-container">
            <svg viewBox="0 0 200 200" className="calorie-dial-svg">
                <circle className="dial-track" cx="100" cy="100" r="90" />
                <motion.circle
                    className="dial-progress"
                    cx="100"
                    cy="100"
                    r="90"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: "easeOut" }}
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
                    <div className="dial-divider"/>
                    <div>
                        <label>Goal</label>
                        <span>{goal}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}