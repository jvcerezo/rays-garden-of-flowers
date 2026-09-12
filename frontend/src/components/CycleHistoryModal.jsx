import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { doc, deleteDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { toast } from 'react-hot-toast';

export const CycleHistoryModal = ({ cycles = [], onClose, canEdit }) => {
    const [editingCycleId, setEditingCycleId] = useState(null);
    const [editStartDate, setEditStartDate] = useState('');
    const [editEndDate, setEditEndDate] = useState('');
    const [isAddingPast, setIsAddingPast] = useState(false);
    const [newStart, setNewStart] = useState('');
    const [newEnd, setNewEnd] = useState('');

    const startEditing = (cycle) => {
        setEditingCycleId(cycle.id);
        setEditStartDate(format(cycle.startDate, 'yyyy-MM-dd'));
        setEditEndDate(cycle.endDate ? format(cycle.endDate, 'yyyy-MM-dd') : '');
    };

    const handleSaveEdit = async (cycleId) => {
        if (!editStartDate) {
            toast.error('Start date is required');
            return;
        }

        const start = new Date(`${editStartDate}T00:00:00`);
        const end = editEndDate ? new Date(`${editEndDate}T23:59:59`) : null;

        if (end && end < start) {
            toast.error('End date cannot be before start date');
            return;
        }

        try {
            const cycleDocRef = doc(db, 'periodTracker', 'shared', 'cycles', cycleId);
            await updateDoc(cycleDocRef, {
                startDate: start,
                endDate: end
            });
            toast.success('Cycle updated!');
            setEditingCycleId(null);
        } catch (err) {
            console.error('Failed to update cycle:', err);
            toast.error('Could not update cycle');
        }
    };

    const handleDeleteCycle = async (cycleId) => {
        if (!window.confirm('Delete this cycle record? This cannot be undone.')) return;

        try {
            const cycleDocRef = doc(db, 'periodTracker', 'shared', 'cycles', cycleId);
            await deleteDoc(cycleDocRef);
            toast.success('Cycle deleted');
        } catch (err) {
            console.error('Failed to delete cycle:', err);
            toast.error('Could not delete cycle');
        }
    };

    const handleAddPastCycle = async (e) => {
        e.preventDefault();
        if (!newStart) {
            toast.error('Please specify a start date');
            return;
        }

        const start = new Date(`${newStart}T00:00:00`);
        const end = newEnd ? new Date(`${newEnd}T23:59:59`) : null;

        if (end && end < start) {
            toast.error('End date cannot be before start date');
            return;
        }

        try {
            const cyclesRef = collection(db, 'periodTracker', 'shared', 'cycles');
            await addDoc(cyclesRef, {
                startDate: start,
                endDate: end
            });
            toast.success('Past cycle logged!');
            setIsAddingPast(false);
            setNewStart('');
            setNewEnd('');
        } catch (err) {
            console.error('Failed to log past cycle:', err);
            toast.error('Could not log past cycle');
        }
    };

    return (
        <div className="reminders-modal-backdrop" onClick={onClose}>
            <motion.div
                className="reminders-modal-content cycle-history-sheet"
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 32, stiffness: 350 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-handle-bar" />
                <div className="modal-header-row">
                    <h2 className="modal-title">Cycle History</h2>
                    <button type="button" className="close-sheet-btn" onClick={onClose}>✕</button>
                </div>

                <div className="history-header-actions">
                    <p className="history-subtitle">
                        {cycles.length} {cycles.length === 1 ? 'cycle' : 'cycles'} recorded
                    </p>
                    {canEdit && (
                        <button
                            type="button"
                            className="add-past-cycle-btn"
                            onClick={() => setIsAddingPast(!isAddingPast)}
                        >
                            {isAddingPast ? 'Cancel' : '+ Add Past Cycle'}
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {isAddingPast && (
                        <motion.form
                            className="add-past-cycle-form"
                            onSubmit={handleAddPastCycle}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <h4>Log Past Period Dates</h4>
                            <div className="form-row-dates">
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={newStart}
                                        onChange={(e) => setNewStart(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Date (Optional)</label>
                                    <input
                                        type="date"
                                        value={newEnd}
                                        onChange={(e) => setNewEnd(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="button primary full-width">
                                Save Past Cycle
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="cycles-list-scroll">
                    {cycles.length === 0 ? (
                        <div className="empty-cycles-state">
                            <p>No past periods logged yet.</p>
                            <span>Tap "+ Add Past Cycle" to record previous dates.</span>
                        </div>
                    ) : (
                        cycles.map((cycle, index) => {
                            const isEditing = editingCycleId === cycle.id;
                            const duration = cycle.endDate
                                ? differenceInDays(cycle.endDate, cycle.startDate) + 1
                                : null;

                            // Calculate cycle length to the previous cycle in chronological terms
                            const nextCycleInArray = cycles[index + 1];
                            const cycleLengthDays = nextCycleInArray
                                ? differenceInDays(cycle.startDate, nextCycleInArray.startDate)
                                : null;

                            return (
                                <div key={cycle.id} className={`cycle-history-card ${isEditing ? 'editing' : ''}`}>
                                    {isEditing ? (
                                        <div className="cycle-edit-fields">
                                            <div className="form-group">
                                                <label>Start Date</label>
                                                <input
                                                    type="date"
                                                    value={editStartDate}
                                                    onChange={(e) => setEditStartDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>End Date</label>
                                                <input
                                                    type="date"
                                                    value={editEndDate}
                                                    onChange={(e) => setEditEndDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="edit-actions-row">
                                                <button
                                                    type="button"
                                                    className="button secondary small"
                                                    onClick={() => setEditingCycleId(null)}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    className="button primary small"
                                                    onClick={() => handleSaveEdit(cycle.id)}
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="cycle-card-left">
                                                <div className="cycle-dot" />
                                                <div className="cycle-dates-info">
                                                    <h4 className="cycle-dates">
                                                        {format(cycle.startDate, 'MMM d, yyyy')}
                                                        {' – '}
                                                        {cycle.endDate ? format(cycle.endDate, 'MMM d, yyyy') : <span className="active-badge">Active</span>}
                                                    </h4>
                                                    <div className="cycle-pills-row">
                                                        {duration && (
                                                            <span className="pill-duration">
                                                                {duration} {duration === 1 ? 'day' : 'days'} period
                                                            </span>
                                                        )}
                                                        {cycleLengthDays && cycleLengthDays > 0 && (
                                                            <span className="pill-cycle-len">
                                                                {cycleLengthDays}d cycle
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {canEdit && (
                                                <div className="cycle-card-actions">
                                                    <button
                                                        type="button"
                                                        className="icon-action-btn edit"
                                                        onClick={() => startEditing(cycle)}
                                                        title="Edit dates"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="icon-action-btn delete"
                                                        onClick={() => handleDeleteCycle(cycle.id)}
                                                        title="Delete entry"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="modal-footer">
                    <button type="button" className="button secondary full-width" onClick={onClose}>
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
