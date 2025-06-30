import React from 'react';
import { motion } from 'framer-motion';

const GoldIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" /></svg>);

const StatBar = ({ label, color }) => {
    return (
        <div className="stat-bar-container">
            <div className="stat-label">
                <span>{label}</span>
            </div>
            <div className="stat-bar-track">
                <div 
                    className="stat-bar-progress" 
                    style={{ background: color, width: '100%' }}
                />
            </div>
        </div>
    );
};

export const PlayerStats = ({ data, playerName }) => {
    const stats = data || { name: 'Player', level: 1, gold: 0, exp: 0, nextLevelExp: 1000 };
    const expPercentage = stats.nextLevelExp > 0 ? (stats.exp / stats.nextLevelExp) * 100 : 0;

    return (
        <motion.div 
            className="player-stats-card"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="player-info-header">
                <div className="player-icon-placeholder">
                    <span>{playerName?.charAt(0)}</span>
                </div>
                <div className="player-details">
                    <div className="player-name-level">
                        <h2 className="player-name">{playerName}</h2>
                        <span className="player-level">Lv. {stats.level || 1}</span>
                    </div>
                    <div className="player-gold-display">
                        <GoldIcon />
                        <span>{stats.gold || 0}</span>
                    </div>
                </div>
            </div>

            <div className="player-stats-bars">
                <StatBar label="HP" color="linear-gradient(90deg, #4ade80, #86efac)" />
                <StatBar label="MP" color="linear-gradient(90deg, #60a5fa, #93c5fd)" />
                <div className="stat-bar-container">
                    <div className="stat-label">
                        <span>EXP</span>
                        <span>{stats.exp || 0} / {stats.nextLevelExp}</span>
                    </div>
                    <div className="stat-bar-track">
                        <motion.div 
                            className="stat-bar-progress" 
                            style={{ background: "linear-gradient(90deg, #facc15, #fde047)", width: `${expPercentage}%` }}
                            initial={{ width: '0%' }}
                            animate={{ width: `${expPercentage}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
