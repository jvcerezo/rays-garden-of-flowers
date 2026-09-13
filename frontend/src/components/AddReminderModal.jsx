import React, { useState } from 'react';

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
            <div
                className="reminders-modal-content"
                onClick={(e) => e.stopPropagation()}
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
                            autoFocus
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
                        <button type="button" className="button secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="button primary"
                            disabled={!title || !dateTime}
                        >
                            Save Reminder
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddReminderModal;