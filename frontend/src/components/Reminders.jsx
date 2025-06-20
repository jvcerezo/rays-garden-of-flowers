import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { format, isPast, isToday, isTomorrow, formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import './Reminders.css';
import { initializeFCM } from './firebase-messaging-init';

// --- Icon Components ---
const BackIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg> );
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg> );
const BellIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.888.82 3.593 2.094 4.706A5.99 5.99 0 0010 18a5.99 5.99 0 003.906-1.294A5.998 5.998 0 0016 8a6 6 0 00-6-6zM8.21 14.832a4.487 4.487 0 003.58 0c-1.18.94-2.4.94-3.58 0zM10 4a4.5 4.5 0 00-4.5 4.5c0 1.638.73 3.12 1.868 4.094a4.486 4.486 0 016.264 0A4.483 4.483 0 0014.5 8a4.5 4.5 0 00-4.5-4.5z" clipRule="evenodd" /></svg>);
const TrashIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25-.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>);
const ChevronDownIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>);


// --- Add Reminder Modal Component ---
const AddReminderModal = ({ onClose, onAdd }) => {
    const [title, setTitle] = useState('');
    const [dateTime, setDateTime] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !dateTime) return;
        onAdd({ title, scheduledAt: new Date(dateTime) });
    };

    const modalVariants = {
        hidden: { y: "100%", opacity: 0 },
        visible: { y: "0%", opacity: 1 },
    };

    return (
        <div className="log-day-modal-backdrop" onClick={onClose}>
            <motion.div
                className="log-day-modal-content"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ type: "spring", damping: 35, stiffness: 400 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-handle-bar" />
                <div className="modal-header">
                    <h2>New Reminder</h2>
                </div>
                <form className="modal-body" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="What do you want to be reminded of?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <input
                        type="datetime-local"
                        className="input-field"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        required
                    />
                    <div className="modal-footer">
                        <motion.button type="button" className="button-log secondary" onClick={onClose} whileTap={{ scale: 0.98 }}>Cancel</motion.button>
                        <motion.button type="submit" className="button-log primary" disabled={!title || !dateTime} whileTap={{ scale: 0.98 }}>Save Reminder</motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};


// --- Main Reminders Component ---
function Reminders() {
    const { user } = useAuth();
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpcomingOpen, setIsUpcomingOpen] = useState(true);
    const [isPastOpen, setIsPastOpen] = useState(false);
    
    useEffect(() => {
        if (user?.uid) {
            initializeFCM(user);
        }
    }, [user]);

    useEffect(() => {
        if (!user) { setLoading(false); return; }
        const remindersRef = collection(db, 'users', user.uid, 'reminders');
        const q = query(remindersRef, orderBy('scheduledAt', 'asc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setReminders(snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                scheduledAt: doc.data().scheduledAt.toDate(),
            })));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleAddReminder = async (newReminder) => {
        if (!user) return;
        await addDoc(collection(db, 'users', user.uid, 'reminders'), {
            ...newReminder,
            createdAt: serverTimestamp(),
            status: 'pending'
        });
        setIsModalOpen(false);
    };

    const handleDeleteReminder = async (id) => {
        if (!user) return;
        await deleteDoc(doc(db, 'users', user.uid, 'reminders', id));
    };

    const { todayReminders, upcomingReminders, pastReminders } = useMemo(() => {
        const today = [];
        const upcoming = [];
        const past = [];
        reminders.forEach(r => {
            if (isPast(r.scheduledAt)) {
                past.push(r);
            } else if (isToday(r.scheduledAt)) {
                today.push(r);
            } else {
                upcoming.push(r);
            }
        });
        return {
            todayReminders: today.sort((a,b) => a.scheduledAt - b.scheduledAt),
            upcomingReminders: upcoming.sort((a,b) => a.scheduledAt - b.scheduledAt),
            pastReminders: past.sort((a,b) => b.scheduledAt - a.scheduledAt),
        };
    }, [reminders]);
    
    const formatRelativeTime = (date) => {
        if (isToday(date)) return `at ${format(date, 'h:mm a')}`;
        if (isTomorrow(date)) return `Tomorrow at ${format(date, 'h:mm a')}`;
        return format(date, "MMM d 'at' h:mm a");
    };

    return (
        <>
            <div className="page-container reminders-page">
                <header className="tracker-header">
                    <Link to="/dashboard" className="back-button"><BackIcon /></Link>
                    <h1 className="header-title">Reminders</h1>
                    <button className="add-reminder-button" onClick={() => setIsModalOpen(true)}>
                        <PlusIcon />
                    </button>
                </header>

                <div className="reminders-list-container">
                    {loading && <p>Loading reminders...</p>}
                    {!loading && reminders.length === 0 && (
                        <div className="empty-state">
                            <BellIcon />
                            <h2>No Reminders Yet</h2>
                            <p>Tap the '+' to add your first reminder.</p>
                        </div>
                    )}
                    
                    {!loading && (
                        <>
                            {todayReminders.length > 0 && (
                                <div className="today-section">
                                    <h3 className="section-title today-title">Today</h3>
                                    {todayReminders.map(reminder => (
                                        <div key={reminder.id} className="reminder-item today">
                                            <div className="reminder-accent-bar" />
                                            <div className="reminder-info">
                                                <h4>{reminder.title}</h4>
                                                <p className="due-soon">{formatDistanceToNow(reminder.scheduledAt, { addSuffix: true })}</p>
                                            </div>
                                            <motion.button className="delete-button" onClick={() => handleDeleteReminder(reminder.id)} whileTap={{scale: 0.9}}><TrashIcon /></motion.button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {upcomingReminders.length > 0 && (
                                <div className="list-section">
                                    <button className="section-header" onClick={() => setIsUpcomingOpen(!isUpcomingOpen)}>
                                        <h3>Upcoming</h3>
                                        <motion.div animate={{ rotate: isUpcomingOpen ? 0 : -90 }}><ChevronDownIcon /></motion.div>
                                    </button>
                                    <AnimatePresence>
                                        {isUpcomingOpen && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                                <div className="section-content">
                                                    {upcomingReminders.map(reminder => (
                                                        <div key={reminder.id} className="reminder-item">
                                                            <div className="reminder-info">
                                                                <h4>{reminder.title}</h4>
                                                                <p>{formatRelativeTime(reminder.scheduledAt)}</p>
                                                            </div>
                                                            <motion.button className="delete-button" onClick={() => handleDeleteReminder(reminder.id)} whileTap={{scale: 0.9}}><TrashIcon /></motion.button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {pastReminders.length > 0 && (
                                <div className="list-section">
                                    <button className="section-header" onClick={() => setIsPastOpen(!isPastOpen)}>
                                        <h3>Past</h3>
                                        <motion.div animate={{ rotate: isPastOpen ? 0 : -90 }}><ChevronDownIcon /></motion.div>
                                    </button>
                                    <AnimatePresence>
                                        {isPastOpen && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                                <div className="section-content">
                                                    {pastReminders.map(reminder => (
                                                        <div key={reminder.id} className="reminder-item past">
                                                            <div className="reminder-info">
                                                                <h4>{reminder.title}</h4>
                                                                <p>{format(reminder.scheduledAt, "MMM d, yyyy")}</p>
                                                            </div>
                                                            <motion.button className="delete-button" onClick={() => handleDeleteReminder(reminder.id)} whileTap={{scale: 0.9}}><TrashIcon /></motion.button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <AddReminderModal
                        onClose={() => setIsModalOpen(false)}
                        onAdd={handleAddReminder}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

export default Reminders;