import React, { useState } from 'react';
import { motion } from 'framer-motion';

export function EditGoalsModal({ onClose, onSave, currentGoals }) {
    const [goals, setGoals] = useState(currentGoals);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Use parseFloat for weight to allow decimals, parseInt for calories
        const parsedValue = name === 'dailyCalories' ? parseInt(value, 10) : parseFloat(value);
        setGoals(prev => ({ ...prev, [name]: isNaN(parsedValue) ? '' : parsedValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(goals);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <motion.div
                className="modal-content"
                initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 35, stiffness: 400 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-handle-bar" />
                <h2 className="modal-title">Update Goals & Weight</h2>
                <form onSubmit={handleSubmit} className="new-food-form">
                    <div className="form-group">
                        <label>Daily Calorie Goal</label>
                        <input type="number" name="dailyCalories" value={goals.dailyCalories} onChange={handleChange} required />
                    </div>
                    <div className="form-inputs-grid weight-inputs">
                        <div className="form-group">
                            <label>Current Weight (kg)</label>
                            <input type="number" step="0.1" name="currentWeight" value={goals.currentWeight} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Goal Weight (kg)</label>
                            <input type="number" step="0.1" name="goalWeight" value={goals.goalWeight} onChange={handleChange} />
                        </div>
                    </div>
                    <button type="submit" className="button-log primary">Save Changes</button>
                </form>
            </motion.div>
        </div>
    );
}