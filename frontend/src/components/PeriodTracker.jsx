import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { doc, onSnapshot, collection, addDoc, updateDoc, query, orderBy, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Calendar from 'react-calendar';

import { usePeriodCycle } from './usePeriodCycle';
import { CycleDisplay } from './CycleDisplay';
import { PeriodSettingsModal } from './PeriodSettingsModal';
import 'react-calendar/dist/Calendar.css';
import './PeriodTracker.css';

// --- Icon Components ---
const BackIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg> );
const SettingsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.07 2.22a.75.75 0 00-1.06-.04l-3 3a.75.75 0 00-.22.53v4.5c0 .24.1.47.28.64l3 3a.75.75 0 001.06-.04l3-3a.75.75 0 00.22-.53v-4.5a.75.75 0 00-.22-.53l-3-3zM10 4.19l1.94 1.94H8.06L10 4.19zM8.5 8.75h3V10h-3V8.75z" clipRule="evenodd" transform="translate(0 1)"/><path d="M18 9.5a.75.75 0 00-.75.75v1.51l-2.07-2.07a.75.75 0 00-1.06 1.06L15.94 12l-1.82 1.82a.75.75 0 101.06 1.06l2.07-2.07v1.51a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75z"/><path d="M2 9.5a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5H3.56l1.82 1.82a.75.75 0 01-1.06 1.06L2.06 12.07v1.51a.75.75 0 01-1.5 0v-4.5a.75.75 0 01.75-.75z"/></svg>);
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H5a1 1 0 110-2h6V5a1 1 0 011-1z" /></svg> );

function PeriodTracker() {
    const { user } = useAuth();
    const [settings, setSettings] = useState({ cycleLength: 28, periodLength: 5 });
    const [cycles, setCycles] = useState([]);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isLogMenuOpen, setIsLogMenuOpen] = useState(false);
    
    const permissions = useMemo(() => {
        if (!user || !user.email) return { canView: false, canEdit: false };
        const editorEmail = 'rheanamindo@gmail.com';
        const viewerEmails = [editorEmail, 'jetjetcerezo@gmail.com'];
        return {
            canView: viewerEmails.includes(user.email),
            canEdit: user.email === editorEmail,
        };
    }, [user]);

    const cycleInfo = usePeriodCycle(cycles, settings);

    useEffect(() => {
        if (!permissions.canView) return;

        const settingsRef = doc(db, 'periodTracker', 'shared');
        const cyclesRef = collection(db, 'periodTracker', 'shared', 'cycles');
        const q = query(cyclesRef, orderBy('startDate', 'desc'));

        const unsubSettings = onSnapshot(settingsRef, (doc) => { if (doc.exists()) setSettings(doc.data()); else setSettings({ cycleLength: 28, periodLength: 5 }); });
        const unsubCycles = onSnapshot(q, (snapshot) => setCycles(snapshot.docs.map(doc => ({ id: doc.id, startDate: doc.data().startDate.toDate(), endDate: doc.data().endDate ? doc.data().endDate.toDate() : null }))));

        return () => { unsubSettings(); unsubCycles(); };
    }, [permissions.canView]);

    const handleLogPeriodStart = () => {
        if (!permissions.canEdit) return;
        const cyclesRef = collection(db, 'periodTracker', 'shared', 'cycles');
        const promise = addDoc(cyclesRef, { startDate: new Date(), endDate: null });
        toast.promise(promise, { loading: 'Logging period start...', success: <b>Period started!</b>, error: <b>Could not log period.</b> });
        setIsLogMenuOpen(false);
    };

    const handleLogPeriodEnd = () => {
        if (!permissions.canEdit || !cycleInfo.activeCycleId) return;
        const cycleDocRef = doc(db, 'periodTracker', 'shared', 'cycles', cycleInfo.activeCycleId);
        const promise = updateDoc(cycleDocRef, { endDate: new Date() });
        toast.promise(promise, { loading: 'Logging period end...', success: <b>Period ended.</b>, error: <b>Could not update period.</b> });
        setIsLogMenuOpen(false);
    };

    const performReset = () => {
        const promise = new Promise(async (resolve, reject) => {
            try {
                if (!permissions.canEdit) throw new Error("Not authorized.");
                
                const cyclesRef = collection(db, 'periodTracker', 'shared', 'cycles');
                const settingsRef = doc(db, 'periodTracker', 'shared');
                
                const querySnapshot = await getDocs(cyclesRef);
                const batch = writeBatch(db);
                querySnapshot.forEach(doc => batch.delete(doc.ref));
                batch.delete(settingsRef);
                await batch.commit();

                setSettings({ cycleLength: 28, periodLength: 5 });
                setSettingsModalOpen(false);
                resolve();
            } catch(error) {
                console.error("Error resetting data:", error);
                reject(error);
            }
        });

        toast.promise(promise, {
            loading: 'Resetting all data...',
            success: <b>All period data has been deleted.</b>,
            error: <b>Could not reset data.</b>
        });
    };
    
    const showResetConfirmation = () => {
        toast((t) => (
            <div className="confirmation-toast">
                <h4>Are you sure?</h4>
                <p>This will permanently delete all data. This action cannot be undone.</p>
                <div className="toast-buttons">
                    <button className="button-confirm" onClick={() => {
                        performReset();
                        toast.dismiss(t.id);
                    }}>
                        Confirm Reset
                    </button>
                    <button className="button-cancel" onClick={() => toast.dismiss(t.id)}>
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 6000 });
    };

    const getTileClassName = ({ date, view }) => {
        if (view !== 'month' || !cycleInfo.getDayType) return null;
        const type = cycleInfo.getDayType(date);
        return type ? `day-${type}` : null;
    };

    return (
        <>
            <div className="page-container period-tracker-page">
                <header className="tracker-header">
                    <Link to="/dashboard" className="back-button"><BackIcon /></Link>
                    <h1 className="header-title">Cycle Tracker</h1>
                    {permissions.canEdit ? (
                        <button className="settings-button" onClick={() => setSettingsModalOpen(true)}><SettingsIcon /></button>
                    ) : (
                        <div style={{width: '40px'}} />
                    )}
                </header>

                {permissions.canView ? (
                    <div className="period-tracker-content">
                        <CycleDisplay cycleInfo={cycleInfo} />
                        <div className="calendar-container">
                            <Calendar tileClassName={getTileClassName} />
                            <div className="calendar-legend">
                                <div className="legend-item"><span className="legend-color day-period"></span>Logged Period</div>
                                <div className="legend-item"><span className="legend-color day-predicted-period"></span>Predicted Period</div>
                                <div className="legend-item"><span className="legend-color day-fertile"></span>Fertile Window</div>
                                <div className="legend-item"><span className="legend-color day-ovulation"></span>Predicted Ovulation</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="unauthorized-message">
                        <h2>Not Authorized</h2>
                        <p>You do not have permission to view this page.</p>
                    </div>
                )}
            </div>
            
            <AnimatePresence>
                {isSettingsModalOpen && permissions.canEdit && (
                    <PeriodSettingsModal
                        currentSettings={settings}
                        onClose={() => setSettingsModalOpen(false)}
                        onReset={showResetConfirmation}
                    />
                )}
                {isLogMenuOpen && permissions.canEdit && (
                    <div className="reminders-modal-backdrop" onClick={() => setIsLogMenuOpen(false)}>
                        <motion.div
                            className="log-action-menu"
                            initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-handle-bar" />
                            <h2 className="modal-title">Log Your Cycle</h2>
                            {cycleInfo.isPeriod ? (
                                <button className="button primary full-width" onClick={handleLogPeriodEnd}>Log Period End</button>
                            ) : (
                                <button className="button primary full-width" onClick={handleLogPeriodStart}>Log Period Start</button>
                            )}
                            <button className="button secondary full-width" onClick={() => setIsLogMenuOpen(false)}>Cancel</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {permissions.canEdit && (
                <motion.button 
                    className="fab" 
                    onClick={() => setIsLogMenuOpen(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <PlusIcon />
                </motion.button>
            )}
        </>
    );
}

export default PeriodTracker;