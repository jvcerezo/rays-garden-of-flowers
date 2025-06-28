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
                            placeholder="e.g., Water the plants"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
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