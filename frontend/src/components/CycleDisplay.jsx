import React from 'react';
import { motion } from 'framer-motion';

export const CycleDisplay = ({ cycleInfo }) => {
    const { primaryText, secondaryText, progress, phase } = cycleInfo;

    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <motion.div 
            className="cycle-display-container"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <svg className="cycle-svg">
                <circle className="cycle-track" cx="130" cy="130" r={radius}></circle>
                <motion.circle 
                    className={`cycle-progress phase-${phase.toLowerCase().replace(' ', '-')}`}
                    cx="130" cy="130" r={radius}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ type: 'spring', damping: 15, stiffness: 80 }}
                ></motion.circle>
            </svg>
            <div className="cycle-info">
                <span className="cycle-primary-text">{primaryText}</span>
                <span className="cycle-secondary-text">{secondaryText}</span>
            </div>
        </motion.div>
    );
};