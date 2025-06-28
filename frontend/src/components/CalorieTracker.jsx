import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { collection, query, onSnapshot, doc, setDoc, getDoc, getDocs, where } from 'firebase/firestore';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import Calendar from 'react-calendar';

import { useCalorieData } from './useCalorieData';
import { CalorieStatusHub } from './CalorieStatusHub';
import { LogFoodModal } from './LogFoodModal';
import { EditGoalsModal } from './EditGoalsModal';

import 'react-calendar/dist/Calendar.css'; // Import calendar styles
import './CalorieTracker.css'; // Your custom styles

// --- Icon Components ---
const BackIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg> );
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H5a1 1 0 110-2h6V5a1 1 0 011-1z" /></svg> );
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>);
const SettingsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.07 2.22a.75.75 0 00-1.06-.04l-3 3a.75.75 0 00-.22.53v4.5c0 .24.1.47.28.64l3 3a.75.75 0 001.06-.04l3-3a.75.75 0 00.22-.53v-4.5a.75.75 0 00-.22-.53l-3-3zM10 4.19l1.94 1.94H8.06L10 4.19zM8.5 8.75h3V10h-3V8.75z" clipRule="evenodd" transform="translate(0 1)"/><path d="M18 9.5a.75.75 0 00-.75.75v1.51l-2.07-2.07a.75.75 0 00-1.06 1.06L15.94 12l-1.82 1.82a.75.75 0 101.06 1.06l2.07-2.07v1.51a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75z"/><path d="M2 9.5a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5H3.56l1.82 1.82a.75.75 0 01-1.06 1.06L2.06 12.07v1.51a.75.75 0 01-1.5 0v-4.5a.75.75 0 01.75-.75z"/></svg>);

const DEFAULT_GOALS = { dailyCalories: 2000, currentWeight: 0, goalWeight: 0 };

function CalorieTracker() {
    const { user } = useAuth();
    const [dailyLog, setDailyLog] = useState(null);
    const [goals, setGoals] = useState(DEFAULT_GOALS);
    const [foodLibrary, setFoodLibrary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [history, setHistory] = useState({});

    const todayKey = format(new Date(), 'yyyy-MM-dd');
    const calorieData = useCalorieData(dailyLog, goals);

    useEffect(() => {
        if (!user) { setLoading(false); return; }

        const goalsDocRef = doc(db, 'users', user.uid, 'settings', 'goals');
        const logDocRef = doc(db, 'users', user.uid, 'dailyLogs', todayKey);
        const libraryRef = collection(db, 'users', user.uid, 'foodLibrary');

        const unsubscribeGoals = onSnapshot(goalsDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setGoals(docSnap.data());
            } else {
                setGoals(DEFAULT_GOALS);
            }
        });

        const unsubscribeLog = onSnapshot(logDocRef, (doc) => {
            setDailyLog(doc.exists() ? doc.data() : { breakfast: [], lunch: [], dinner: [], snacks: [] });
            setLoading(false);
        });

        const unsubscribeLibrary = onSnapshot(query(libraryRef), (snapshot) => {
            setFoodLibrary(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubscribeGoals();
            unsubscribeLog();
            unsubscribeLibrary();
        };
    }, [user, todayKey]);

    const handleFetchHistory = async (date) => {
        if (!user) return;
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        const monthKey = format(monthStart, 'yyyy-MM');

        if (history[monthKey]) return; // Don't refetch if already loaded

        const logsRef = collection(db, 'users', user.uid, 'dailyLogs');
        const q = query(logsRef, where('__name__', '>=', format(monthStart, 'yyyy-MM-dd')), where('__name__', '<=', format(monthEnd, 'yyyy-MM-dd')));
        
        const querySnapshot = await getDocs(q);
        const monthHistory = {};
        querySnapshot.forEach((doc) => {
            const allMeals = ['breakfast', 'lunch', 'dinner', 'snacks'];
            const totalCalories = allMeals.reduce((sum, meal) => {
                return sum + (doc.data()[meal] || []).reduce((mealSum, food) => mealSum + (food.calories || 0), 0);
            }, 0);
            monthHistory[doc.id] = totalCalories;
        });

        setHistory(prev => ({ ...prev, [monthKey]: monthHistory }));
    };

    const handleLogFood = async (food, mealType) => {
        if (!user || !mealType) return;
        
        const currentLog = dailyLog || { breakfast: [], lunch: [], dinner: [], snacks: [] };
        const currentMealItems = currentLog[mealType] || [];
        const updatedLog = {
            ...currentLog,
            [mealType]: [...currentMealItems, food]
        };
        
        const logDocRef = doc(db, 'users', user.uid, 'dailyLogs', todayKey);
        await setDoc(logDocRef, updatedLog, { merge: true });
        setIsLogModalOpen(false);
    };
    
    const handleSaveGoals = async (newGoals) => {
        if (!user) return;
        const goalsDocRef = doc(db, 'users', user.uid, 'settings', 'goals');
        await setDoc(goalsDocRef, newGoals);
        setGoals(newGoals);
        setIsGoalsModalOpen(false);
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
                    <div className="meal-summary">{totalCalories} Cal</div>
                </div>
                <div className="meal-items">
                    {foods.length === 0 && <p className="empty-meal-text">No food logged yet.</p>}
                    <AnimatePresence>
                        {foods.map((food, index) => (
                            <motion.div 
                                key={`${food.name}-${index}`}
                                className="food-item-chip"
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="food-item-info">
                                    <span className="food-item-name">{food.name}</span>
                                    <span className="food-item-calories">{food.calories} cal</span>
                                </div>
                                <button className="delete-food-button" onClick={() => handleDeleteFood(mealName.toLowerCase(), index)}>
                                    <CloseIcon />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="loading-container">Loading Tracker...</div>;
    }

    return (
        <>
            <div className="page-container calorie-tracker-page">
                <header className="tracker-header">
                    <Link to="/dashboard" className="back-button"><BackIcon /></Link>
                    <button className="header-date-button" onClick={() => {
                        handleFetchHistory(new Date());
                        setIsCalendarOpen(true);
                    }}>
                        <h1 className="header-title">Today's Tracker</h1>
                        <p className="header-date">{format(new Date(), 'eeee, MMMM d')}</p>
                    </button>
                    <button onClick={() => setIsGoalsModalOpen(true)} className="settings-button">
                        <SettingsIcon />
                    </button>
                </header>
                
                <div className="calorie-dashboard">
                    <CalorieStatusHub calorieData={calorieData} goals={goals} />
                    
                    <div className="daily-log-feed">
                        <MealSection mealName="Breakfast" foods={dailyLog?.breakfast} />
                        <MealSection mealName="Lunch" foods={dailyLog?.lunch} />
                        <MealSection mealName="Dinner" foods={dailyLog?.dinner} />
                        <MealSection mealName="Snacks" foods={dailyLog?.snacks} />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isLogModalOpen && (
                    <LogFoodModal 
                        onClose={() => setIsLogModalOpen(false)}
                        onLogFood={handleLogFood}
                        foodLibrary={foodLibrary}
                        userId={user.uid}
                    />
                )}
                {isGoalsModalOpen && (
                    <EditGoalsModal
                        onClose={() => setIsGoalsModalOpen(false)}
                        onSave={handleSaveGoals}
                        currentGoals={goals}
                    />
                )}
                {isCalendarOpen && (
                    <motion.div className="modal-backdrop calendar-backdrop" onClick={() => setIsCalendarOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div 
                            className="calendar-modal-content"
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        >
                            <button onClick={() => setIsCalendarOpen(false)} className="close-calendar-button"><CloseIcon/></button>
                            <Calendar
                                onActiveStartDateChange={({ activeStartDate }) => handleFetchHistory(activeStartDate)}
                                tileContent={({ date, view }) => {
                                    if (view === 'month') {
                                        const dateKey = format(date, 'yyyy-MM-dd');
                                        const monthKey = format(date, 'yyyy-MM');
                                        const calories = history[monthKey]?.[dateKey];
                                        if (calories > 0) {
                                            return <p className="calendar-day-calories">{calories} <span className="cal-unit">cal</span></p>;
                                        }
                                    }
                                    return null;
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button 
                className="fab" 
                onClick={() => setIsLogModalOpen(true)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
            >
                <PlusIcon />
            </motion.button>
        </>
    );
}
export default CalorieTracker;