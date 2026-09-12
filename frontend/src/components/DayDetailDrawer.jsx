import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export const DayDetailDrawer = ({
    dayDetails,
    canEdit,
    onClose,
    onLogStartOnDate,
    onLogEndOnDate,
    onDeleteCycle
}) => {
    if (!dayDetails) return null;

    const {
        date,
        type,
        phaseName,
        phaseEmoji,
        dayInCycle,
        description,
        loggedCycle,
        isToday,
        isPast
    } = dayDetails;

    return (
        <div className="reminders-modal-backdrop" onClick={onClose}>
            <motion.div
                className="reminders-modal-content day-detail-sheet"
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 32, stiffness: 350 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-handle-bar" />

                <div className="day-detail-header">
                    <div>
                        <span className="day-detail-relative">
                            {isToday ? "Today" : (isPast ? "Past Date" : "Future Prediction")}
                        </span>
                        <h2 className="day-detail-date">{format(date, 'EEEE, MMMM d, yyyy')}</h2>
                    </div>
                    <button type="button" className="close-sheet-btn" onClick={onClose}>✕</button>
                </div>

                <div className="day-phase-card">
                    <div className="day-phase-top">
                        <span className="day-phase-emoji">{phaseEmoji}</span>
                        <div className="day-phase-titles">
                            <span className="day-phase-name">{phaseName}</span>
                            {dayInCycle && dayInCycle > 0 && (
                                <span className="day-in-cycle-badge">Cycle Day {dayInCycle}</span>
                            )}
                        </div>
                    </div>
                    <p className="day-phase-desc">{description}</p>
                </div>

                {/* Backtracking & Logging Actions */}
                {canEdit && (
                    <div className="day-detail-actions">
                        <h4 className="actions-section-title">Quick Actions for this Date</h4>

                        {type === 'period' && loggedCycle ? (
                            <div className="action-buttons-group">
                                {!loggedCycle.endDate && (
                                    <button
                                        type="button"
                                        className="button primary full-width"
                                        onClick={() => onLogEndOnDate(date, loggedCycle.id)}
                                    >
                                        ✓ Mark Period Ended on this Date
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="button danger outline full-width"
                                    onClick={() => onDeleteCycle(loggedCycle.id)}
                                >
                                    🗑️ Delete This Period Record
                                </button>
                            </div>
                        ) : (
                            <div className="action-buttons-group">
                                <button
                                    type="button"
                                    className="button primary full-width"
                                    onClick={() => onLogStartOnDate(date)}
                                >
                                    🌸 Set Period Start on {format(date, 'MMM d')}
                                </button>
                                <button
                                    type="button"
                                    className="button secondary full-width"
                                    onClick={() => onLogEndOnDate(date)}
                                >
                                    🏁 Mark Period End on {format(date, 'MMM d')}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="modal-footer">
                    <button type="button" className="button secondary full-width" onClick={onClose}>
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
