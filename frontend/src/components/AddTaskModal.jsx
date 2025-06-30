import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const AddTaskModal = ({ onClose, onAdd }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [gold, setGold] = useState('');
    const [exp, setExp] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const taskData = {
            title,
            description,
            rewards: {
                gold: parseInt(gold) || 0,
                exp: parseInt(exp) || 0,
            }
        };
        onAdd(taskData);
    };

    return (
        <div className="reminders-modal-backdrop" onClick={onClose}>
            <motion.div
                className="reminders-modal-content"
                initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 35, stiffness: 400 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-handle-bar" />
                <h2 className="modal-title">Assign New Quest</h2>
                <form className="new-reminder-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Quest Title</label>
                        <input type="text" placeholder="e.g., Defeat the Laundry Monster" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea placeholder="Add details about the quest..." value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Rewards</label>
                        <div className="rewards-grid">
                            <input type="number" placeholder="Gold" value={gold} onChange={e => setGold(e.target.value)} />
                            <input type="number" placeholder="EXP" value={exp} onChange={e => setExp(e.target.value)} />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="button primary">Assign Quest</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
