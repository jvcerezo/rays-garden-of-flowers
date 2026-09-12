import React from 'react';
import { motion } from 'framer-motion';

export const CycleDisplay = ({ cycleInfo }) => {
    const {
        primaryText,
        secondaryText,
        progress,
        phaseKey = 'initial',
        stats,
        isPeriod,
        daysLate
    } = cycleInfo;

    const radius = 105;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

    const getPhaseBadge = () => {
        switch (phaseKey) {
            case 'period':
                return { icon: '🌸', text: isPeriod ? 'Period Active' : 'Period Day', color: '#f43f5e', bg: '#ffe4e6' };
            case 'late':
                return { icon: '⏳', text: daysLate > 0 ? `${daysLate}d Overdue` : 'Due Today', color: '#ea580c', bg: '#ffedd5' };
            case 'ovulation-day':
                return { icon: '🥚', text: 'Peak Ovulation', color: '#8b5cf6', bg: '#ede9fe' };
            case 'fertile-window':
                return { icon: '✨', text: 'Fertile Window', color: '#0284c7', bg: '#e0f2fe' };
            case 'follicular':
                return { icon: '🌱', text: 'Follicular Phase', color: '#10b981', bg: '#dcfce7' };
            case 'luteal':
                return { icon: '🌙', text: 'Luteal Phase', color: '#a855f7', bg: '#f3e8ff' };
            default:
                return { icon: '💐', text: 'Garden Cycle', color: '#a78bfa', bg: '#f5f3ff' };
        }
    };

    const badge = getPhaseBadge();

    return (
        <motion.div 
            className="cycle-display-container"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <div className="cycle-outer-glow" style={{ '--glow-color': badge.color }} />
            
            <svg className="cycle-svg" viewBox="0 0 240 240">
                <defs>
                    <linearGradient id="periodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fb7185" />
                        <stop offset="100%" stopColor="#e11d48" />
                    </linearGradient>
                    <linearGradient id="fertileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <linearGradient id="lutealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c084fc" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                    <linearGradient id="lateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                </defs>

                {/* Track */}
                <circle className="cycle-track" cx="120" cy="120" r={radius} />

                {/* Progress */}
                <motion.circle 
                    className={`cycle-progress phase-${phaseKey}`}
                    cx="120" cy="120" r={radius}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ type: 'spring', damping: 20, stiffness: 70 }}
                />
            </svg>

            <div className="cycle-info">
                <div 
                    className="cycle-phase-pill" 
                    style={{ color: badge.color, backgroundColor: badge.bg }}
                >
                    <span className="phase-pill-icon">{badge.icon}</span>
                    <span className="phase-pill-text">{badge.text}</span>
                </div>

                <span className="cycle-primary-text">{primaryText}</span>
                <span className="cycle-secondary-text">{secondaryText}</span>

                {stats && (
                    <div className="cycle-stats-preview">
                        <span>Avg: {stats.avgCycleLength}d cycle</span>
                        <span className="dot-separator">•</span>
                        <span>{stats.avgPeriodLength}d period</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};