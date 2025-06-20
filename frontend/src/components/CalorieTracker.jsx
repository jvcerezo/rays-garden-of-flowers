import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { collection, query, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

import './CalorieTracker.css';
import { useCalorieData } from './useCalorieData';
import { CalorieDial } from './CalorieDial';
import { LogFoodModal } from './LogFoodModal';

const BackIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg> );
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg> );
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>);

const DEFAULT_GOALS = { dailyCalories: 2000, protein: 150, carbs: 200, fat: 60 };

function CalorieTracker() {
    const { user } = useAuth();
    const [dailyLog, setDailyLog] = useState(null);
    const [goals, setGoals] = useState(DEFAULT_GOALS);
    const [foodLibrary, setFoodLibrary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMeal, setCurrentMeal] = useState('');

    const todayKey = format(new Date(), 'yyyy-MM-dd');
    const calorieData = useCalorieData(dailyLog, goals);

    // Set user-specific goals
    useEffect(() => {
        if (user?.email) {
            if (user.email === 'rheanamindo@gmail.com') {
                setGoals({ dailyCalories: 1100, protein: 100, carbs: 100, fat: 35 });
            } else if (user.email === 'jetjetcerezo@gmail.com') {
                setGoals({ dailyCalories: 1300, protein: 120, carbs: 120, fat: 40 });
            } else {
                setGoals(DEFAULT_GOALS);
            }
        }
    }, [user]);

    // Fetch data from Firestore
    useEffect(() => {
        if (!user) { setLoading(false); return; }
        
        const logDocRef = doc(db, 'users', user.uid, 'dailyLogs', todayKey);
        const unsubscribeLog = onSnapshot(logDocRef, (doc) => {
            setDailyLog(doc.exists() ? doc.data() : { breakfast: [], lunch: [], dinner: [], snacks: [] });
            setLoading(false);
        });

        const libraryRef = collection(db, 'users', user.uid, 'foodLibrary');
        const unsubscribeLibrary = onSnapshot(query(libraryRef), (snapshot) => {
            setFoodLibrary(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubscribeLog();
            unsubscribeLibrary();
        };
    }, [user, todayKey]);
    
    const handleOpenModal = (meal) => {
        setCurrentMeal(meal);
        setIsModalOpen(true);
    };

    const handleLogFood = async (food) => {
        if (!user || !currentMeal) return;
        const currentMealItems = dailyLog[currentMeal] || [];
        const updatedLog = {
            ...dailyLog,
            [currentMeal]: [...currentMealItems, food]
        };
        const logDocRef = doc(db, 'users', user.uid, 'dailyLogs', todayKey);
        await setDoc(logDocRef, updatedLog, { merge: true });
        setIsModalOpen(false);
    };

    const handleDeleteFood = async (mealName, foodIndex) => {
        if (!user || !dailyLog || !dailyLog[mealName]) return;
        const updatedMealItems = dailyLog[mealName].filter((_, index) => index !== foodIndex);
        const updatedLog = { ...dailyLog, [mealName]: updatedMealItems };
        const logDocRef = doc(db, 'users', user.uid, 'dailyLogs', todayKey);
        await setDoc(logDocRef, updatedLog, { merge: true });
    };

    const MealSection = ({ mealName, foods = [] }) => {
        const totalCalories = foods.reduce((sum, item) => sum + (item.calories || 0), 0);
        return (
            <div className="meal-section">
                <div className="meal-header">
                    <h3>{mealName}</h3>
                    <button className="add-food-button" onClick={() => handleOpenModal(mealName.toLowerCase())}><PlusIcon /></button>
                </div>
                 <div className="meal-summary">
                    <span>{totalCalories}</span> Cal
                </div>
                <div className="meal-items">
                    {foods.map((food, index) => (
                        <motion.div key={index} className="food-item-chip" layout>
                           <div className="food-item-info">
                                <span className="food-item-name">{food.name}</span>
                                <span className="food-item-calories">{food.calories} cal</span>
                           </div>
                           <button className="delete-food-button" onClick={() => handleDeleteFood(mealName.toLowerCase(), index)}>
                               <CloseIcon />
                           </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="page-container calorie-tracker-page">
                <header className="tracker-header">
                    <Link to="/dashboard" className="back-button"><BackIcon /></Link>
                    <h1 className="header-title">Today's Tracker</h1>
                </header>
                
                <div className="calorie-dashboard">
                    <CalorieDial calorieData={calorieData} />

                    <div className="daily-log-feed">
                        <div className="macros-panel">
                            <div className="macro-item protein">
                                <div className="macro-label"><span>Protein</span><span>{calorieData.protein} / {goals.protein}g</span></div>
                                <div className="macro-bar"><div style={{ width: `${calorieData.proteinPercent}%` }}></div></div>
                            </div>
                            <div className="macro-item carbs">
                                <div className="macro-label"><span>Carbs</span><span>{calorieData.carbs} / {goals.carbs}g</span></div>
                                <div className="macro-bar"><div style={{ width: `${calorieData.carbsPercent}%` }}></div></div>
                            </div>
                            <div className="macro-item fat">
                                 <div className="macro-label"><span>Fat</span><span>{calorieData.fat} / {goals.fat}g</span></div>
                                <div className="macro-bar"><div style={{ width: `${calorieData.fatPercent}%` }}></div></div>
                            </div>
                        </div>
                        
                        <MealSection mealName="Breakfast" foods={dailyLog?.breakfast} />
                        <MealSection mealName="Lunch" foods={dailyLog?.lunch} />
                        <MealSection mealName="Dinner" foods={dailyLog?.dinner} />
                        <MealSection mealName="Snacks" foods={dailyLog?.snacks} />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <LogFoodModal 
                        onClose={() => setIsModalOpen(false)}
                        onLogFood={handleLogFood}
                        foodLibrary={foodLibrary}
                        userId={user.uid}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
export default CalorieTracker;