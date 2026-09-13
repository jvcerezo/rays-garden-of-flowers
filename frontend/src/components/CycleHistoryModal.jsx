import React, { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { db } from '../firebase/firebase';
import { doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export const CycleHistoryModal = ({ cycles, onClose, permissions }) => {
    const [editingCycleId, setEditingCycleId] = useState(null);
    const [editStartDate, setEditStartDate] = useState('');
    const [editEndDate, setEditEndDate] = useState('');

    // Sort descending (newest first)
    const sortedCycles = [...cycles].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    const handleDelete = async (cycleId) => {
        if (!permissions.canEdit) return;
        if (!window.confirm('Delete this logged cycle entry?')) return;

        try {
            const cycleDocRef = doc(db, 'periodTracker', 'shared', 'cycles', cycleId);
            await deleteDoc(cycleDocRef);
            toast.success('Cycle entry deleted');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete cycle');
        }
    };

    const startEditing = (cycle) => {
        setEditingCycleId(cycle.id);
        const sDate = new Date(cycle.startDate);
        setEditStartDate(format(sDate, 'yyyy-MM-dd'));
        if (cycle.endDate) {
            const eDate = new Date(cycle.endDate);
            setEditEndDate(format(eDate, 'yyyy-MM-dd'));
        } else {
            setEditEndDate('');
        }
    };

    const handleSaveEdit = async (cycleId) => {
        if (!permissions.canEdit || !editStartDate) return;

        try {
            const startParts = editStartDate.split('-').map(Number);
            const parsedStart = new Date(startParts[0], startParts[1] - 1, startParts[2], 12, 0, 0);

            let parsedEnd = null;
            if (editEndDate) {
                const endParts = editEndDate.split('-').map(Number);
                parsedEnd = new Date(endParts[0], endParts[1] - 1, endParts[2], 12, 0, 0);

                if (parsedEnd < parsedStart) {
                    toast.error('End date cannot be earlier than start date');
                    return;
                }
            }

            const cycleDocRef = doc(db, 'periodTracker', 'shared', 'cycles', cycleId);
            await updateDoc(cycleDocRef, {
                startDate: Timestamp.fromDate(parsedStart),
                endDate: parsedEnd ? Timestamp.fromDate(parsedEnd) : null,
            });

            toast.success('Cycle updated successfully');
            setEditingCycleId(null);
        } catch (err) {
            console.error(err);
            toast.error('Failed to update cycle');
        }
    };

    return (
        <div className="reminders-modal-backdrop" onClick={onClose}>
            <div
                className="reminders-modal-content cycle-history-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-handle-bar" />
                <div className="history-modal-header">
                    <h2 className="modal-title" style={{ margin: 0 }}>Cycle History ({sortedCycles.length})</h2>
                    <button className="history-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="cycle-history-list">
                    {sortedCycles.length === 0 ? (
                        <div className="empty-history-text">No cycle entries recorded yet.</div>
                    ) : (
                        sortedCycles.map((cycle, index) => {
                            const startDate = new Date(cycle.startDate);
                            const endDate = cycle.endDate ? new Date(cycle.endDate) : null;
                            const isOngoing = !endDate;
                            const duration = endDate ? differenceInDays(endDate, startDate) + 1 : null;

                            // Cycle interval compared to the previous cycle in chronological order
                            const prevCycle = sortedCycles[index + 1];
                            const cycleInterval = prevCycle
                                ? differenceInDays(startDate, new Date(prevCycle.startDate))
                                : null;

                            const isEditing = editingCycleId === cycle.id;

                            return (
                                <div key={cycle.id} className="cycle-history-card">
                                    {isEditing ? (
                                        <div className="cycle-edit-form">
                                            <div className="form-group">
                                                <label>Start Date</label>
                                                <input
                                                    type="date"
                                                    value={editStartDate}
                                                    onChange={(e) => setEditStartDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>End Date (leave empty if ongoing)</label>
                                                <input
                                                    type="date"
                                                    value={editEndDate}
                                                    onChange={(e) => setEditEndDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="cycle-edit-actions">
                                                <button
                                                    type="button"
                                                    className="button secondary sm"
                                                    onClick={() => setEditingCycleId(null)}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    className="button primary sm"
                                                    onClick={() => handleSaveEdit(cycle.id)}
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="cycle-card-header">
                                                <div className="cycle-date-range">
                                                    <span className="cycle-start">
                                                        {format(startDate, 'MMM d, yyyy')}
                                                    </span>
                                                    <span className="cycle-arrow-sep">→</span>
                                                    <span className={`cycle-end ${isOngoing ? 'status-ongoing' : ''}`}>
                                                        {isOngoing ? 'Ongoing' : format(endDate, 'MMM d, yyyy')}
                                                    </span>
                                                </div>
                                                {permissions.canEdit && (
                                                    <div className="cycle-actions">
                                                        <button
                                                            className="cycle-action-btn edit"
                                                            title="Edit"
                                                            onClick={() => startEditing(cycle)}
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className="cycle-action-btn delete"
                                                            title="Delete"
                                                            onClick={() => handleDelete(cycle.id)}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="cycle-card-meta">
                                                {duration && (
                                                    <span className="meta-badge duration">
                                                        🩸 {duration} {duration === 1 ? 'day' : 'days'} period
                                                    </span>
                                                )}
                                                {isOngoing && (
                                                    <span className="meta-badge ongoing">
                                                        🩸 Active now
                                                    </span>
                                                )}
                                                {cycleInterval && (
                                                    <span className="meta-badge interval">
                                                        🔄 {cycleInterval}-day cycle
                                                    </span>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
