import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast'; // Import the toast function

// --- Icon Components (no changes) ---
const PencilIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg> );
const TrashIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.84.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg> );

// --- NewFoodForm (no functional changes) ---
const NewFoodForm = ({ onSave, editingFood, mealType }) => {
    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');

    useEffect(() => {
        if (editingFood) {
            setName(editingFood.name);
            setCalories(editingFood.calories);
        }
    }, [editingFood]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const foodData = { name, calories: parseInt(calories) || 0 };
        onSave(foodData, editingFood ? editingFood.id : null);
    };

    const isEditing = !!editingFood;
    return (
        <form onSubmit={handleSubmit} className="new-food-form">
            <div className="form-inputs-grid">
                <input type="text" placeholder="Food Name" value={name} onChange={e => setName(e.target.value)} required />
                <input type="number" placeholder="Calories" value={calories} onChange={e => setCalories(e.target.value)} required />
            </div>
            <button type="submit" className="button-log primary">
                {isEditing ? 'Update Food in Library' : `Save & Add to ${mealType}`}
            </button>
        </form>
    );
};


export function LogFoodModal({ onClose, onLogFood, foodLibrary, userId }) {
    const [view, setView] = useState('library');
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [editingFood, setEditingFood] = useState(null);

    const handleStartEdit = (food) => {
        setEditingFood(food);
        setView('create');
    };

    // --- REWRITTEN Delete Handler with Toast Confirmation ---
    const handleDeleteFromLibrary = (foodId, foodName) => {
        const promise = new Promise(async (resolve, reject) => {
            try {
                const foodDocRef = doc(db, 'users', userId, 'foodLibrary', foodId);
                await deleteDoc(foodDocRef);
                resolve();
            } catch (error) {
                console.error("Error deleting food: ", error);
                reject(error);
            }
        });

        toast.promise(promise, {
            loading: 'Deleting...',
            success: <b>{`"${foodName}" deleted!`}</b>,
            error: <b>Could not delete.</b>,
        });
    };

    // --- UPDATED Save Handler with Toasts ---
    const handleSaveFoodToLibrary = async (foodData, foodId) => {
        const isEditing = !!foodId;
        const promise = new Promise(async (resolve, reject) => {
            try {
                if (isEditing) {
                    const foodDocRef = doc(db, 'users', userId, 'foodLibrary', foodId);
                    await updateDoc(foodDocRef, foodData);
                } else {
                    const libraryRef = collection(db, 'users', userId, 'foodLibrary');
                    const newDocRef = await addDoc(libraryRef, foodData);
                    onLogFood({ id: newDocRef.id, ...foodData }, selectedMeal);
                }
                resolve();
            } catch (error) {
                console.error("Error saving food: ", error);
                reject(error);
            }
        });

        await toast.promise(promise, {
            loading: 'Saving...',
            success: <b>{isEditing ? 'Food updated!' : 'Food created and added!'}</b>,
            error: <b>Could not save.</b>,
        });

        setEditingFood(null);
        setView('library');
    };

    const handleViewChange = (newView) => {
        setEditingFood(null);
        setView(newView);
    };

    const mealTypes = [
        { key: 'breakfast', label: 'Breakfast' }, { key: 'lunch', label: 'Lunch' },
        { key: 'dinner', label: 'Dinner' }, { key: 'snacks', label: 'Snacks' },
    ];
    const formattedMealType = selectedMeal ? selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1) : '';

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <motion.div
                className="modal-content"
                initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 35, stiffness: 400 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-handle-bar" />
                {!selectedMeal ? (
                    <>
                        <h2 className="modal-title">Add Food to...</h2>
                        <div className="meal-selection-grid">
                            {mealTypes.map(meal => (
                                <button key={meal.key} className="meal-selection-button" onClick={() => setSelectedMeal(meal.key)}>{meal.label}</button>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="modal-header">
                            <button className={`header-tab ${view === 'library' ? 'active' : ''}`} onClick={() => handleViewChange('library')}>My Foods</button>
                            <button className={`header-tab ${view === 'create' ? 'active' : ''}`} onClick={() => handleViewChange('create')}>Create New</button>
                        </div>
                        <div className="modal-body">
                            {view === 'library' ? (
                                <div className="food-library-list">
                                    {foodLibrary.length > 0 ? foodLibrary.map(food => (
                                        <div key={food.id} className="food-library-item">
                                            <div className="food-item-log-area" onClick={() => onLogFood(food, selectedMeal)}>
                                                <span>{food.name}</span>
                                                <span>{food.calories} Cal</span>
                                            </div>
                                            <div className="food-item-actions">
                                                <button className="edit-food-button" onClick={() => handleStartEdit(food)}><PencilIcon /></button>
                                                <button className="delete-food-button" onClick={() => handleDeleteFromLibrary(food.id, food.name)}><TrashIcon /></button>
                                            </div>
                                        </div>
                                    )) : <p className="empty-library-message">Your food library is empty. Go to "Create New" to add a food.</p>}
                                </div>
                            ) : (
                                <NewFoodForm onSave={handleSaveFoodToLibrary} editingFood={editingFood} mealType={formattedMealType} />
                            )}
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}