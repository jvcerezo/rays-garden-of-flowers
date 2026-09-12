import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const AddReminderModal = ({ onClose, onAdd }) => {
    const [title, setTitle] = useState('');
    const [dateTime, setDateTime] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !dateTime) return;
        onAdd({ title, scheduledAt: new Date(dateTime) });
    };

    const setPresetTime = (hoursFromNow = null, targetHour = null, daysToAdd = 0) => {
        const target = new Date();
        if (hoursFromNow !== null) {
            target.setHours(target.getHours() + hoursFromNow);
        } else if (targetHour !== null) {
            target.setDate(target.getDate() + daysToAdd);
            target.setHours(targetHour, 0, 0, 0);
        }
        const year = target.getFullYear();
        const month = String(target.getMonth() + 1).padStart(2, '0');
        const day = String(target.getDate()).padStart(2, '0');
        const hours = String(target.getHours()).padStart(2, '0');
        const minutes = String(target.getMinutes()).padStart(2, '0');
        setDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    };

    return (
        <div className="reminders-modal-backdrop" onClick={onClose}>
            <motion.div
                className="reminders-modal-content"
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 35, stiffness: 400 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-handle-bar" />
                <h2 className="modal-title">New Reminder</h2>
                <form className="new-reminder-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">What to remember?</label>
                        <input
                            id="title"
                            type="text"
                            placeholder="e.g., Take vitamins, call Tajie..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="reminder-presets-row">
                        <span className="presets-label">Quick time:</span>
                        <div className="presets-chips">
                            <button type="button" className="preset-chip" onClick={() => setPresetTime(1)}>
                                +1 Hour
                            </button>
                            <button type="button" className="preset-chip" onClick={() => setPresetTime(null, 20, 0)}>
                                Tonight 8PM
                            </button>
                            <button type="button" className="preset-chip" onClick={() => setPresetTime(null, 9, 1)}>
                                Tomorrow 9AM
                            </button>
                            <button type="button" className="preset-chip" onClick={() => setPresetTime(null, 20, 1)}>
                                Tomorrow 8PM
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="datetime">When?</label>
                        <input
                            id="datetime"
                            type="datetime-local"
                            value={dateTime}
                            onChange={(e) => setDateTime(e.target.value)}
                            required
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="button primary" disabled={!title || !dateTime}>Save Reminder</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};