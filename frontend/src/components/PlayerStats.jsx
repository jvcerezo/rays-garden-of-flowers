import React from 'react';

const GoldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
    </svg>
);

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
    const isRay = playerName === 'Ray';

    return (
        <div className="player-stats-card">
            <div className="player-info-header">
                <div className={`player-icon-placeholder ${isRay ? 'avatar-ray' : 'avatar-taj'}`}>
                    <span>{isRay ? '👑' : '⚔️'}</span>
                </div>
                <div className="player-details">
                    <div className="player-name-level">
                        <h2 className="player-name">{playerName}</h2>
                        <span className="garden-badge garden-badge-purple">Lv. {stats.level || 1} Adventurer</span>
                    </div>
                    <div className="player-gold-display">
                        <span className="garden-badge garden-badge-amber">
                            <GoldIcon /> {stats.gold || 0} Gold
                        </span>
                    </div>
                </div>
            </div>

            <div className="player-stats-bars">
                <StatBar label="HP" color="linear-gradient(90deg, #34d399, #10b981)" />
                <StatBar label="MP" color="linear-gradient(90deg, #60a5fa, #3b82f6)" />
                <div className="stat-bar-container">
                    <div className="stat-label">
                        <span>EXP</span>
                        <span>{stats.exp || 0} / {stats.nextLevelExp}</span>
                    </div>
                    <div className="stat-bar-track">
                        <div 
                            className="stat-bar-progress" 
                            style={{ 
                                background: "linear-gradient(90deg, #f59e0b, #fbbf24)", 
                                width: `${Math.min(expPercentage, 100)}%`,
                                transition: 'width 0.4s ease-out'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerStats;
