import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';

const NewFoodForm = ({ onFoodCreated }) => {
    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const foodData = { 
            name, 
            calories: parseInt(calories) || 0, 
            protein: parseInt(protein) || 0, 
            carbs: parseInt(carbs) || 0, 
            fat: parseInt(fat) || 0 
        };
        onFoodCreated(foodData);
    };

    return (
        <form onSubmit={handleSubmit} className="new-food-form">
            <input type="text" placeholder="Food Name" value={name} onChange={e => setName(e.target.value)} required />
            <div className="macro-inputs">
                <input type="number" placeholder="Cals" value={calories} onChange={e => setCalories(e.target.value)} required />
                <input type="number" placeholder="Protein (g)" value={protein} onChange={e => setProtein(e.target.value)} />
                <input type="number" placeholder="Carbs (g)" value={carbs} onChange={e => setCarbs(e.target.value)} />
                <input type="number" placeholder="Fat (g)" value={fat} onChange={e => setFat(e.target.value)} />
            </div>
            <button type="submit" className="button-log primary">Save and Add Food</button>
        </form>
    );
};

export function LogFoodModal({ onClose, onLogFood, foodLibrary, userId }) {
    const [view, setView] = useState('library'); // 'library' or 'create'

    const handleCreateAndLog = async (foodData) => {
        // Save to library
        const libraryRef = collection(db, 'users', userId, 'foodLibrary');
        await addDoc(libraryRef, foodData);
        // Log it to the meal
        onLogFood(foodData);
    };

    return (
        <div className="log-day-modal-backdrop" onClick={onClose}>
            <motion.div
                className="log-day-modal-content"
                initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 35, stiffness: 400 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-handle-bar" />
                <div className="modal-header">
                    <button className={`header-tab ${view === 'library' ? 'active' : ''}`} onClick={() => setView('library')}>My Foods</button>
                    <button className={`header-tab ${view === 'create' ? 'active' : ''}`} onClick={() => setView('create')}>Create New</button>
                </div>
                <div className="modal-body">
                    {view === 'library' ? (
                        <div className="food-library-list">
                            {foodLibrary.map(food => (
                                <div key={food.id} className="food-library-item" onClick={() => onLogFood(food)}>
                                    <span>{food.name}</span>
                                    <span>{food.calories} Cal</span>
                                </div>
                            ))}
                            {foodLibrary.length === 0 && <p className="empty-library-message">Your food library is empty. Add a food to get started!</p>}
                        </div>
                    ) : (
                        <NewFoodForm onFoodCreated={handleCreateAndLog} />
                    )}
                </div>
            </motion.div>
        </div>
    );
}