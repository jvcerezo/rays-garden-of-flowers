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
    Timestamp,
} from 'firebase/firestore';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Calendar from 'react-calendar';

import { usePeriodCycle } from './usePeriodCycle';
import { CycleDisplay } from './CycleDisplay';
import { PeriodSettingsModal } from './PeriodSettingsModal';
import { CycleHistoryModal } from './CycleHistoryModal';
import 'react-calendar/dist/Calendar.css';
import './PeriodTracker.css';

// --- Lightweight SVG Icons (Zero framer-motion overhead) ---
const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
        <path fillRule="evenodd" d="M11.07 2.22a.75.75 0 00-1.06-.04l-3 3a.75.75 0 00-.22.53v4.5c0 .24.1.47.28.64l3 3a.75.75 0 001.06-.04l3-3a.75.75 0 00.22-.53v-4.5a.75.75 0 00-.22-.53l-3-3zM10 4.19l1.94 1.94H8.06L10 4.19zM8.5 8.75h3V10h-3V8.75z" clipRule="evenodd" transform="translate(0 1)" />
        <path d="M18 9.5a.75.75 0 00-.75.75v1.51l-2.07-2.07a.75.75 0 00-1.06 1.06L15.94 12l-1.82 1.82a.75.75 0 101.06 1.06l2.07-2.07v1.51a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75z" />
        <path d="M2 9.5a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5H3.56l1.82 1.82a.75.75 0 01-1.06 1.06L2.06 12.07v1.51a.75.75 0 01-1.5 0v-4.5a.75.75 0 01.75-.75z" />
    </svg>
);

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H5a1 1 0 110-2h6V5a1 1 0 011-1z" />
    </svg>
);

function PeriodTracker() {
    const { user } = useAuth();
    const [settings, setSettings] = useState({ cycleLength: 28, periodLength: 5 });
    const [cycles, setCycles] = useState([]);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isLogMenuOpen, setIsLogMenuOpen] = useState(false);

    // Backtracking / Log Form State
    const [logStartDate, setLogStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [isPeriodOngoing, setIsPeriodOngoing] = useState(true);
    const [logEndDate, setLogEndDate] = useState('');
    const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);

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
                setSettings({ cycleLength: 28, periodLength: 5 });
            }
        });

        const unsubCycles = onSnapshot(q, (snapshot) => {
            setCycles(
                snapshot.docs.map((docSnap) => ({
                    id: docSnap.id,
                    startDate: docSnap.data().startDate ? docSnap.data().startDate.toDate() : new Date(),
                    endDate: docSnap.data().endDate ? docSnap.data().endDate.toDate() : null,
                }))
            );
        });

        return () => {
            unsubSettings();
            unsubCycles();
        };
    }, [permissions.canView]);

    // Open logging modal for a specific date (Backtracking support)
    const openLogModalForDate = (date) => {
        const dStr = format(date, 'yyyy-MM-dd');
        setLogStartDate(dStr);
        setIsPeriodOngoing(true);
        setLogEndDate('');
        setIsLogMenuOpen(true);
    };

    // Handle form submit for logging a new or backtracked cycle
    const handleSaveCycle = async (e) => {
        e.preventDefault();
        if (!permissions.canEdit) return;

        try {
            const startParts = logStartDate.split('-').map(Number);
            const parsedStart = new Date(startParts[0], startParts[1] - 1, startParts[2], 12, 0, 0);

            let parsedEnd = null;
            if (!isPeriodOngoing && logEndDate) {
                const endParts = logEndDate.split('-').map(Number);
                parsedEnd = new Date(endParts[0], endParts[1] - 1, endParts[2], 12, 0, 0);

                if (parsedEnd < parsedStart) {
                    toast.error('End date cannot be earlier than start date');
                    return;
                }
            }

            const cyclesRef = collection(db, 'periodTracker', 'shared', 'cycles');
            await addDoc(cyclesRef, {
                startDate: Timestamp.fromDate(parsedStart),
                endDate: parsedEnd ? Timestamp.fromDate(parsedEnd) : null,
            });

            toast.success(
                parsedEnd
                    ? 'Past cycle logged successfully!'
                    : 'Period start logged!'
            );
            setIsLogMenuOpen(false);
            setSelectedCalendarDay(null);
        } catch (error) {
            console.error('Error logging cycle:', error);
            toast.error('Could not log period entry.');
        }
    };

    // Quick log action: end currently active period
    const handleQuickEndActive = async () => {
        if (!permissions.canEdit || !cycleInfo.activeCycleId) return;

        try {
            const cycleDocRef = doc(db, 'periodTracker', 'shared', 'cycles', cycleInfo.activeCycleId);
            await updateDoc(cycleDocRef, {
                endDate: Timestamp.fromDate(new Date()),
            });
            toast.success('Period ended today.');
            setIsLogMenuOpen(false);
        } catch (error) {
            console.error('Error ending period:', error);
            toast.error('Could not end period.');
        }
    };

    const performReset = () => {
        const promise = new Promise(async (resolve, reject) => {
            try {
                if (!permissions.canEdit) throw new Error('Not authorized.');

                const cyclesRef = collection(db, 'periodTracker', 'shared', 'cycles');
                const settingsRef = doc(db, 'periodTracker', 'shared');

                const querySnapshot = await getDocs(cyclesRef);
                const batch = writeBatch(db);
                querySnapshot.forEach((d) => batch.delete(d.ref));
                batch.delete(settingsRef);
                await batch.commit();

                setSettings({ cycleLength: 28, periodLength: 5 });
                setSettingsModalOpen(false);
                resolve();
            } catch (error) {
                console.error('Error resetting data:', error);
                reject(error);
            }
        });

        toast.promise(promise, {
            loading: 'Resetting all data...',
            success: <b>All period data has been deleted.</b>,
            error: <b>Could not reset data.</b>,
        });
    };

    const showResetConfirmation = () => {
        toast(
            (t) => (
                <div className="confirmation-toast">
                    <h4>Are you sure?</h4>
                    <p>This will permanently delete all data. This action cannot be undone.</p>
                    <div className="toast-buttons">
                        <button
                            className="button-confirm"
                            onClick={() => {
                                performReset();
                                toast.dismiss(t.id);
                            }}
                        >
                            Confirm Reset
                        </button>
                        <button className="button-cancel" onClick={() => toast.dismiss(t.id)}>
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            { duration: 6000 }
        );
    };

    const getTileClassName = ({ date, view }) => {
        if (view !== 'month') return null;
        const classes = [];

        const today = new Date();
        const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

        if (isToday) {
            classes.push('day-today');
        }

        if (cycleInfo.getDayType) {
            const type = cycleInfo.getDayType(date);
            if (type) classes.push(`day-${type}`);
        }

        return classes.length > 0 ? classes.join(' ') : null;
    };

    const handleCalendarDayClick = (date) => {
        const info = cycleInfo.getDayDetail ? cycleInfo.getDayDetail(date) : null;
        const today = new Date();
        const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

        setSelectedCalendarDay({
            date,
            type: cycleInfo.getDayType(date),
            info,
            isToday,
        });
    };

    return (
        <>
            <div className="page-container period-tracker-page">
                <header className="tracker-header">
                    <Link to="/dashboard" className="back-button" title="Back to Dashboard">
                        <BackIcon />
                    </Link>
                    <div className="header-title-container">
                        <h1 className="header-title">Cycle Tracker</h1>
                        <span className="header-subtitle">Insights & Wellness</span>
                    </div>
                    <div className="header-right-actions">
                        <button
                            className="header-icon-button"
                            onClick={() => setIsHistoryModalOpen(true)}
                            title="Cycle History"
                            aria-label="Cycle History"
                        >
                            <HistoryIcon />
                        </button>
                        {permissions.canEdit && (
                            <button
                                className="header-icon-button"
                                onClick={() => setSettingsModalOpen(true)}
                                title="Settings"
                                aria-label="Cycle Settings"
                            >
                                <SettingsIcon />
                            </button>
                        )}
                    </div>
                </header>

                {permissions.canView ? (
                    <div className="period-tracker-content">
                        <CycleDisplay cycleInfo={cycleInfo} />

                        {/* Calendar Container */}
                        <div className="calendar-container">
                            <div className="calendar-header-meta">
                                <span className="calendar-meta-title">Calendar & Forecast</span>
                                {cycleInfo.activeCycleId && (
                                    <span className="active-period-badge">Period in progress</span>
                                )}
                            </div>

                            <Calendar
                                tileClassName={getTileClassName}
                                onClickDay={handleCalendarDayClick}
                            />

                            {/* Day detail popover when tapped */}
                            {selectedCalendarDay && (
                                <div className="selected-day-banner">
                                    <div className="selected-day-content">
                                        <div className="selected-day-date">
                                            {format(selectedCalendarDay.date, 'EEEE, MMM d, yyyy')}
                                            {selectedCalendarDay.isToday && (
                                                <span className="today-chip">Today ✨</span>
                                            )}
                                        </div>
                                        <div className="selected-day-phase">
                                            {selectedCalendarDay.info || 'No cycle events on this date'}
                                        </div>
                                    </div>
                                    <div className="selected-day-actions">
                                        {permissions.canEdit && (
                                            <button
                                                className="btn-sm-action"
                                                onClick={() => openLogModalForDate(selectedCalendarDay.date)}
                                            >
                                                Log here
                                            </button>
                                        )}
                                        <button
                                            className="btn-sm-close"
                                            onClick={() => setSelectedCalendarDay(null)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="calendar-legend">
                                <div className="legend-item">
                                    <span className="legend-color day-today-legend"></span>Today
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color day-period"></span>Logged Period
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color day-predicted-period"></span>Predicted Period
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color day-fertile"></span>Fertile Window
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color day-ovulation"></span>Predicted Ovulation
                                </div>
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

            {/* Modals without framer-motion lag */}
            {isSettingsModalOpen && permissions.canEdit && (
                <PeriodSettingsModal
                    currentSettings={settings}
                    onClose={() => setSettingsModalOpen(false)}
                    onReset={showResetConfirmation}
                />
            )}

            {isHistoryModalOpen && (
                <CycleHistoryModal
                    cycles={cycles}
                    onClose={() => setIsHistoryModalOpen(false)}
                    permissions={permissions}
                />
            )}

            {/* Backtracking & Period Log Modal */}
            {isLogMenuOpen && permissions.canEdit && (
                <div className="reminders-modal-backdrop" onClick={() => setIsLogMenuOpen(false)}>
                    <div
                        className="reminders-modal-content log-period-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-handle-bar" />
                        <h2 className="modal-title">Log Period Cycle</h2>

                        {/* Quick action if period is active right now */}
                        {cycleInfo.isPeriod && (
                            <div className="quick-active-box">
                                <div className="quick-active-text">
                                    <strong>Current period is ongoing.</strong>
                                    <span>Started on {cycleInfo.activeCycleStartDate ? format(cycleInfo.activeCycleStartDate, 'MMM d, yyyy') : 'recently'}.</span>
                                </div>
                                <button
                                    type="button"
                                    className="button primary quick-end-btn"
                                    onClick={handleQuickEndActive}
                                >
                                    End Period Today
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSaveCycle} className="log-cycle-form">
                            <div className="form-group">
                                <label htmlFor="log-start-date">Start Date</label>
                                <input
                                    id="log-start-date"
                                    type="date"
                                    value={logStartDate}
                                    max={format(new Date(), 'yyyy-MM-dd')}
                                    onChange={(e) => setLogStartDate(e.target.value)}
                                    required
                                />
                                <span className="input-tip">You can select past dates to log previous cycles.</span>
                            </div>

                            <div className="form-group-checkbox">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={isPeriodOngoing}
                                        onChange={(e) => setIsPeriodOngoing(e.target.checked)}
                                    />
                                    <span>Still ongoing (no end date yet)</span>
                                </label>
                            </div>

                            {!isPeriodOngoing && (
                                <div className="form-group">
                                    <label htmlFor="log-end-date">End Date</label>
                                    <input
                                        id="log-end-date"
                                        type="date"
                                        value={logEndDate}
                                        min={logStartDate}
                                        max={format(new Date(), 'yyyy-MM-dd')}
                                        onChange={(e) => setLogEndDate(e.target.value)}
                                        required={!isPeriodOngoing}
                                    />
                                </div>
                            )}

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="button secondary"
                                    onClick={() => setIsLogMenuOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="button primary">
                                    Save Cycle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            {permissions.canEdit && (
                <button
                    className="fab"
                    onClick={() => {
                        setLogStartDate(format(new Date(), 'yyyy-MM-dd'));
                        setIsPeriodOngoing(!cycleInfo.isPeriod);
                        setLogEndDate('');
                        setIsLogMenuOpen(true);
                    }}
                    title="Log Period"
                    aria-label="Log Period"
                >
                    <PlusIcon />
                </button>
            )}
        </>
    );
}

export default PeriodTracker;