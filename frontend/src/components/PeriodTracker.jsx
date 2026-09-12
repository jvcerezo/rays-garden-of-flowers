import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import {
    doc,
    onSnapshot,
    collection,
    addDoc,
    updateDoc,
    query,
    orderBy,
    getDocs,
    writeBatch,
    deleteDoc
} from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Calendar from 'react-calendar';

import { usePeriodCycle } from './usePeriodCycle';
import { CycleDisplay } from './CycleDisplay';
import { PeriodSettingsModal } from './PeriodSettingsModal';
import { CycleHistoryModal } from './CycleHistoryModal';
import { DayDetailDrawer } from './DayDetailDrawer';

import 'react-calendar/dist/Calendar.css';
import './PeriodTracker.css';

// --- Icon Components ---
const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.07 2.22a.75.75 0 00-1.06-.04l-3 3a.75.75 0 00-.22.53v4.5c0 .24.1.47.28.64l3 3a.75.75 0 001.06-.04l3-3a.75.75 0 00.22-.53v-4.5a.75.75 0 00-.22-.53l-3-3zM10 4.19l1.94 1.94H8.06L10 4.19zM8.5 8.75h3V10h-3V8.75z" clipRule="evenodd" transform="translate(0 1)"/>
        <path d="M18 9.5a.75.75 0 00-.75.75v1.51l-2.07-2.07a.75.75 0 00-1.06 1.06L15.94 12l-1.82 1.82a.75.75 0 101.06 1.06l2.07-2.07v1.51a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75z"/>
        <path d="M2 9.5a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5H3.56l1.82 1.82a.75.75 0 01-1.06 1.06L2.06 12.07v1.51a.75.75 0 01-1.5 0v-4.5a.75.75 0 01.75-.75z"/>
    </svg>
);

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H5a1 1 0 110-2h6V5a1 1 0 011-1z" />
    </svg>
);

function PeriodTracker() {
    const { user } = useAuth();
    const [settings, setSettings] = useState({ cycleLength: 28, periodLength: 5, useSmartPredictions: true });
    const [cycles, setCycles] = useState([]);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isLogMenuOpen, setIsLogMenuOpen] = useState(false);
    const [isCustomLogOpen, setIsCustomLogOpen] = useState(false);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [selectedDayDetails, setSelectedDayDetails] = useState(null);

    const permissions = useMemo(() => {
        if (!user || !user.email) return { canView: false, canEdit: false };
        const editorEmail = 'rheanamindo@gmail.com';
        const viewerEmails = [editorEmail, 'jetjetcerezo@gmail.com'];
        return {
            canView: viewerEmails.includes(user.email.toLowerCase()),
            canEdit: user.email.toLowerCase() === editorEmail,
        };
    }, [user]);

    const cycleInfo = usePeriodCycle(cycles, settings);

    useEffect(() => {
        if (!permissions.canView) return;

        const settingsRef = doc(db, 'periodTracker', 'shared');
        const cyclesRef = collection(db, 'periodTracker', 'shared', 'cycles');
        const q = query(cyclesRef, orderBy('startDate', 'desc'));

        const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
            if (docSnap.exists()) {
                setSettings(docSnap.data());
            } else {
                setSettings({ cycleLength: 28, periodLength: 5, useSmartPredictions: true });
            }
        });

        const unsubCycles = onSnapshot(q, (snapshot) => {
            setCycles(snapshot.docs.map(d => ({
                id: d.id,
                startDate: d.data().startDate.toDate(),
                endDate: d.data().endDate ? d.data().endDate.toDate() : null
            })));
        });

        return () => {
            unsubSettings();
            unsubCycles();
        };
    }, [permissions.canView]);

    // Backtracking / Logging handlers
    const handleLogPeriodStartToday = () => {
        if (!permissions.canEdit) return;
        const cyclesRef = collection(db, 'periodTracker', 'shared', 'cycles');
        const promise = addDoc(cyclesRef, { startDate: new Date(), endDate: null });
        toast.promise(promise, {
            loading: 'Logging period start...',
            success: <b>🌸 Period started! Take care today.</b>,
            error: <b>Could not log period.</b>
        });
        setIsLogMenuOpen(false);
    };

    const handleLogPeriodEndToday = () => {
        if (!permissions.canEdit || !cycleInfo.activeCycleId) return;
        const cycleDocRef = doc(db, 'periodTracker', 'shared', 'cycles', cycleInfo.activeCycleId);
        const promise = updateDoc(cycleDocRef, { endDate: new Date() });
        toast.promise(promise, {
            loading: 'Logging period end...',
            success: <b>✨ Period marked as ended.</b>,
            error: <b>Could not update period.</b>
        });
        setIsLogMenuOpen(false);
    };

    const handleLogStartOnDate = async (date) => {
        if (!permissions.canEdit) return;
        try {
            const cyclesRef = collection(db, 'periodTracker', 'shared', 'cycles');
            await addDoc(cyclesRef, {
                startDate: date,
                endDate: null
            });
            toast.success('Period start logged for this date!');
            setSelectedDayDetails(null);
        } catch (err) {
            console.error('Error logging start on date:', err);
            toast.error('Could not log period start');
        }
    };

    const handleLogEndOnDate = async (date, cycleId = null) => {
        if (!permissions.canEdit) return;
        const targetId = cycleId || cycleInfo.activeCycleId;
        if (!targetId) {
            toast.error('No active cycle to mark as ended.');
            return;
        }

        try {
            const cycleDocRef = doc(db, 'periodTracker', 'shared', 'cycles', targetId);
            await updateDoc(cycleDocRef, { endDate: date });
            toast.success('Period end logged for this date!');
            setSelectedDayDetails(null);
        } catch (err) {
            console.error('Error logging end on date:', err);
            toast.error('Could not update period');
        }
    };

    const handleDeleteCycle = async (cycleId) => {
        if (!permissions.canEdit) return;
        if (!window.confirm('Delete this period record?')) return;
        try {
            const cycleDocRef = doc(db, 'periodTracker', 'shared', 'cycles', cycleId);
            await deleteDoc(cycleDocRef);
            toast.success('Period record deleted.');
            setSelectedDayDetails(null);
        } catch (err) {
            console.error('Error deleting cycle:', err);
            toast.error('Could not delete record');
        }
    };

    const handleCustomDateLog = async (e) => {
        e.preventDefault();
        if (!permissions.canEdit) return;
        if (!customStartDate) {
            toast.error('Please choose a start date');
            return;
        }

        const start = new Date(`${customStartDate}T00:00:00`);
        const end = customEndDate ? new Date(`${customEndDate}T23:59:59`) : null;

        if (end && end < start) {
            toast.error('End date cannot be earlier than start date');
            return;
        }

        try {
            const cyclesRef = collection(db, 'periodTracker', 'shared', 'cycles');
            await addDoc(cyclesRef, { startDate: start, endDate: end });
            toast.success('Period record saved!');
            setIsCustomLogOpen(false);
            setIsLogMenuOpen(false);
            setCustomStartDate('');
            setCustomEndDate('');
        } catch (err) {
            console.error('Error logging custom dates:', err);
            toast.error('Could not save period dates');
        }
    };

    const performReset = () => {
        const promise = new Promise(async (resolve, reject) => {
            try {
                if (!permissions.canEdit) throw new Error("Not authorized.");
                const cyclesRef = collection(db, 'periodTracker', 'shared', 'cycles');
                const settingsRef = doc(db, 'periodTracker', 'shared');

                const querySnapshot = await getDocs(cyclesRef);
                const batch = writeBatch(db);
                querySnapshot.forEach(d => batch.delete(d.ref));
                batch.delete(settingsRef);
                await batch.commit();

                setSettings({ cycleLength: 28, periodLength: 5, useSmartPredictions: true });
                setSettingsModalOpen(false);
                resolve();
            } catch(error) {
                console.error("Error resetting data:", error);
                reject(error);
            }
        });

        toast.promise(promise, {
            loading: 'Resetting all cycle data...',
            success: <b>All period data deleted.</b>,
            error: <b>Could not reset data.</b>
        });
    };

    const showResetConfirmation = () => {
        toast((t) => (
            <div className="confirmation-toast">
                <h4>Reset All Data?</h4>
                <p>This will permanently erase all logged cycles. This cannot be undone.</p>
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
        return type && type !== 'none' ? `day-${type}` : null;
    };

    const handleCalendarClickDay = (date) => {
        if (cycleInfo.getDayDetails) {
            const details = cycleInfo.getDayDetails(date);
            setSelectedDayDetails(details);
        }
    };

    return (
        <>
            <div className="page-container period-tracker-page">
                <header className="tracker-header">
                    <Link to="/dashboard" className="back-button" title="Back to Dashboard">
                        <BackIcon />
                    </Link>
                    <h1 className="header-title">Cycle Tracker</h1>
                    <div className="header-right-actions">
                        <button
                            type="button"
                            className="history-nav-btn"
                            onClick={() => setIsHistoryModalOpen(true)}
                            title="Cycle History"
                        >
                            <HistoryIcon />
                        </button>
                        {permissions.canEdit && (
                            <button
                                type="button"
                                className="settings-button"
                                onClick={() => setSettingsModalOpen(true)}
                                title="Cycle Settings"
                            >
                                <SettingsIcon />
                            </button>
                        )}
                    </div>
                </header>

                {permissions.canView ? (
                    <div className="period-tracker-content">
                        {/* Main Interactive Cycle Display */}
                        <CycleDisplay cycleInfo={cycleInfo} />

                        {/* Overdue Alert Banner if period is late */}
                        {cycleInfo.isLate && (
                            <motion.div
                                className="overdue-banner"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <span className="banner-icon">⏳</span>
                                <div className="banner-text">
                                    <strong>Period is {cycleInfo.daysLate === 0 ? 'expected today' : `${cycleInfo.daysLate} days late`}</strong>
                                    <p>Variations are natural. Tap '+' when your period begins.</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Interactive Calendar with Backtracking support */}
                        <div className="calendar-container">
                            <div className="calendar-top-bar">
                                <span className="calendar-instruction">Tap any day to view details or log dates</span>
                            </div>
                            <Calendar
                                tileClassName={getTileClassName}
                                onClickDay={handleCalendarClickDay}
                            />
                            <div className="calendar-legend">
                                <div className="legend-item"><span className="legend-color day-period"></span>Logged Period</div>
                                <div className="legend-item"><span className="legend-color day-predicted-period"></span>Predicted Period</div>
                                <div className="legend-item"><span className="legend-color day-fertile"></span>Fertile Window</div>
                                <div className="legend-item"><span className="legend-color day-ovulation"></span>Ovulation</div>
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

            {/* Modals & Bottom Drawers */}
            <AnimatePresence>
                {/* Settings Modal */}
                {isSettingsModalOpen && permissions.canEdit && (
                    <PeriodSettingsModal
                        currentSettings={settings}
                        stats={cycleInfo.stats}
                        onClose={() => setSettingsModalOpen(false)}
                        onReset={showResetConfirmation}
                        onOpenHistory={() => setIsHistoryModalOpen(true)}
                    />
                )}

                {/* History Modal */}
                {isHistoryModalOpen && (
                    <CycleHistoryModal
                        cycles={cycles}
                        canEdit={permissions.canEdit}
                        onClose={() => setIsHistoryModalOpen(false)}
                    />
                )}

                {/* Day Detail Sheet for tapped calendar dates */}
                {selectedDayDetails && (
                    <DayDetailDrawer
                        dayDetails={selectedDayDetails}
                        canEdit={permissions.canEdit}
                        onClose={() => setSelectedDayDetails(null)}
                        onLogStartOnDate={handleLogStartOnDate}
                        onLogEndOnDate={handleLogEndOnDate}
                        onDeleteCycle={handleDeleteCycle}
                    />
                )}

                {/* Floating Action Menu for Quick Logging & Backtracking */}
                {isLogMenuOpen && permissions.canEdit && (
                    <div className="reminders-modal-backdrop" onClick={() => setIsLogMenuOpen(false)}>
                        <motion.div
                            className="log-action-menu"
                            initial={{ y: "100%" }}
                            animate={{ y: "0%" }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-handle-bar" />
                            <h2 className="modal-title">Log Your Period</h2>

                            {isCustomLogOpen ? (
                                <form onSubmit={handleCustomDateLog} className="custom-log-form">
                                    <p className="custom-log-hint">Log a past period or custom date range:</p>
                                    <div className="form-group">
                                        <label>Start Date</label>
                                        <input
                                            type="date"
                                            value={customStartDate}
                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>End Date (Optional)</label>
                                        <input
                                            type="date"
                                            value={customEndDate}
                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="custom-form-actions">
                                        <button
                                            type="button"
                                            className="button secondary"
                                            onClick={() => setIsCustomLogOpen(false)}
                                        >
                                            Back
                                        </button>
                                        <button type="submit" className="button primary">
                                            Save Entry
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="log-menu-options">
                                    {cycleInfo.isPeriod ? (
                                        <button
                                            type="button"
                                            className="button primary full-width menu-action-btn"
                                            onClick={handleLogPeriodEndToday}
                                        >
                                            🏁 Mark Period Ended Today
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="button primary full-width menu-action-btn"
                                            onClick={handleLogPeriodStartToday}
                                        >
                                            🌸 Period Started Today
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        className="button secondary full-width menu-action-btn"
                                        onClick={() => setIsCustomLogOpen(true)}
                                    >
                                        📅 Log Past or Custom Dates...
                                    </button>

                                    <button
                                        type="button"
                                        className="button secondary full-width menu-action-btn"
                                        onClick={() => {
                                            setIsLogMenuOpen(false);
                                            setIsHistoryModalOpen(true);
                                        }}
                                    >
                                        📋 View & Edit Cycle History
                                    </button>

                                    <button
                                        type="button"
                                        className="button outline full-width"
                                        onClick={() => setIsLogMenuOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            {permissions.canEdit && (
                <motion.button 
                    className="fab period-fab" 
                    onClick={() => {
                        setIsCustomLogOpen(false);
                        setIsLogMenuOpen(true);
                    }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    title="Log Period"
                >
                    <PlusIcon />
                </motion.button>
            )}
        </>
    );
}

export default PeriodTracker;