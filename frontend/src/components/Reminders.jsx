import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

import { ReactComponent as RemindersEmptyIcon } from '../assets/reminders.svg';
import { initializeFCM } from './firebase-messaging-init';
import { AddReminderModal } from './AddReminderModal';
import { ReminderList } from './ReminderList';
import './Reminders.css';

// --- Icon Components ---
const BackIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg> );
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H5a1 1 0 110-2h6V5a1 1 0 011-1z" /></svg> );

// --- Hero Card for the Next Reminder ---
const NextReminderHero = ({ reminder }) => {
    if (!reminder) return null;

    const formatRelativeTime = (date) => {
        if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
        if (isTomorrow(date)) return `Tomorrow at ${format(date, 'h:mm a')}`;
        return format(date, "eeee, MMM d 'at' h:mm a");
    };

    return (
        <motion.div 
            className="next-reminder-hero"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="hero-accent" />
            <div className="hero-content">
                <span className="hero-label">Next Up</span>
                <h3 className="hero-title">{reminder.title}</h3>
                <p className="hero-time">{formatRelativeTime(reminder.scheduledAt)}</p>
            </div>
        </motion.div>
    );
};

function Reminders() {
    const { user } = useAuth();
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        const promise = addDoc(collection(db, 'users', user.uid, 'reminders'), {
            ...newReminder,
            createdAt: serverTimestamp(),
            status: 'pending'
        });
        
        toast.promise(promise, {
            loading: 'Saving reminder...',
            success: <b>Reminder saved!</b>,
            error: <b>Could not save.</b>,
        });

        setIsModalOpen(false);
    };

    const handleDeleteReminder = (id, title) => {
        if (!user) return;
        const promise = deleteDoc(doc(db, 'users', user.uid, 'reminders', id));

        toast.promise(promise, {
            loading: 'Deleting...',
            success: <b>{`"${title}" deleted.`}</b>,
            error: <b>Could not delete.</b>,
        });
    };

    const { todayReminders, upcomingReminders, pastReminders, nextReminder } = useMemo(() => {
        const today = [];
        const upcoming = [];
        const past = [];
        
        reminders.forEach(r => {
            if (isPast(r.scheduledAt) && !isToday(r.scheduledAt)) {
                past.push(r);
            } else if (isToday(r.scheduledAt)) {
                today.push(r);
            } else {
                upcoming.push(r);
            }
        });
        
        const sortedToday = today.sort((a,b) => a.scheduledAt - b.scheduledAt);
        const sortedUpcoming = upcoming.sort((a,b) => a.scheduledAt - b.scheduledAt);
        const next = sortedToday.find(r => !isPast(r.scheduledAt)) || sortedUpcoming[0];

        return {
            todayReminders: sortedToday,
            upcomingReminders: sortedUpcoming,
            pastReminders: past.sort((a,b) => b.scheduledAt - a.scheduledAt),
            nextReminder: next,
        };
    }, [reminders]);

    return (
        <>
            <div className="page-container reminders-page">
                <header className="tracker-header">
                    <Link to="/dashboard" className="back-button"><BackIcon /></Link>
                    <h1 className="header-title">Reminders</h1>
                    <button className="add-button" onClick={() => setIsModalOpen(true)}>
                        <PlusIcon />
                    </button>
                </header>

                <div className="reminders-content">
                    {loading && <p>Loading reminders...</p>}
                    
                    {!loading && reminders.length === 0 && (
                        <div className="empty-state">
                            <RemindersEmptyIcon className="empty-state-icon" />
                            <h2>No Reminders Yet</h2>
                            <p>Tap the '+' button to add your first reminder and stay on track.</p>
                        </div>
                    )}
                    
                    {!loading && reminders.length > 0 && (
                        <>
                            <NextReminderHero reminder={nextReminder} />
                            <ReminderList
                                today={todayReminders}
                                upcoming={upcomingReminders}
                                past={pastReminders}
                                onDelete={handleDeleteReminder}
                            />
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