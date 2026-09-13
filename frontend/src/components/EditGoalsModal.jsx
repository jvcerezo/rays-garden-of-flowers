import React, { useState } from 'react';

export function EditGoalsModal({ onClose, onSave, currentGoals }) {
    const [goals, setGoals] = useState(currentGoals || { dailyCalories: 2000, currentWeight: 0, goalWeight: 0 });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const parsedValue = name === 'dailyCalories' ? parseInt(value, 10) : parseFloat(value);
        setGoals((prev) => ({ ...prev, [name]: isNaN(parsedValue) ? '' : parsedValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(goals);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-handle-bar" />
                <h2 className="modal-title">Update Goals & Weight</h2>
                <form onSubmit={handleSubmit} className="new-food-form">
                    <div className="form-group">
                        <label htmlFor="dailyCalories">Daily Calorie Goal</label>
                        <input
                            id="dailyCalories"
                            type="number"
                            name="dailyCalories"
                            value={goals.dailyCalories}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-inputs-grid weight-inputs">
                        <div className="form-group">
                            <label htmlFor="currentWeight">Current Weight (kg)</label>
                            <input
                                id="currentWeight"
                                type="number"
                                step="0.1"
                                name="currentWeight"
                                value={goals.currentWeight}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="goalWeight">Goal Weight (kg)</label>
                            <input
                                id="goalWeight"
                                type="number"
                                step="0.1"
                                name="goalWeight"
                                value={goals.goalWeight}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <button type="submit" className="button-log primary">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}

export default EditGoalsModal;