// src/components/CurrentGoals.js

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoals } from '../hooks/useGoals';
import './CurrentGoals.css';
import { ReactComponent as GoalsSvg } from '../assets/current-goals.svg';

// --- ICONS ---
const BackIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg> );
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg> );
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg> );
const CheckCircleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>);
const SpinnerIcon = () => ( <svg className="spinner" viewBox="0 0 50 50"><circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle></svg> );
const PencilIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg> );
const TrashIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg> );

// --- Helper & Child Component Definitions ---
const formatValue = (value = 0) => new Intl.NumberFormat('en-US').format(value);
const formatProgressText = (current = 0, target = 0, unit = '', type = 'general') => { const formattedCurrent = formatValue(current); const formattedTarget = formatValue(target); if (type === 'financial') { return `₱${formattedCurrent} of ₱${formattedTarget}`; } if (unit) { return `${formattedCurrent} of ${formattedTarget} ${unit}`; } return `${formattedCurrent} of ${formattedTarget}`; };
const Toast = ({ message, type, onDismiss }) => { useEffect(() => { const timer = setTimeout(() => { onDismiss(); }, 4000); return () => clearTimeout(timer); }, [onDismiss]); return ( <div className={`toast toast-${type}`}> {message} </div> ); };
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => { if (!isOpen) return null; return ( <div className="modal-backdrop" onClick={onClose}> <div className="modal-content" onClick={(e) => e.stopPropagation()}> <h2>{title}</h2> <p>{children}</p> <div className="modal-actions"> <button className="button secondary-button" onClick={onClose}>Cancel</button> <button className="button danger-button" onClick={onConfirm}>Confirm</button> </div> </div> </div> ); };

const GoalItem = React.memo(({ goal, onAddProgress, onToggleComplete, onEdit, onDelete, onCheckboxToggle }) => {
    const progress = goal.targetValue > 0 ? ((goal.currentValue || 0) / goal.targetValue) * 100 : 0;
    
    const renderCheckboxes = () => {
        if (!goal.targetValue || goal.targetValue > 50) return <p className='checkbox-limit-message'>({goal.targetValue} steps)</p>;
        const checkboxes = [];
        for (let i = 1; i <= goal.targetValue; i++) {
            const isChecked = i <= goal.currentValue;
            checkboxes.push(<div key={i} className={`progress-checkbox ${isChecked ? 'checked' : ''}`} onClick={() => onCheckboxToggle(goal, isChecked)}>{isChecked && <CheckCircleIcon />}</div>);
        }
        return checkboxes;
    };

    return (
        <div className={`goal-item ${goal.isComplete ? 'complete' : ''}`}>
            <div className="goal-header"><h4 className="goal-title" onClick={() => onEdit(goal)}>{goal.title}</h4><button className="complete-button" onClick={() => onToggleComplete(goal.id, goal.isComplete)}><CheckCircleIcon /></button></div>
            <div className="goal-body">
                <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div></div>
                <div className="goal-stats"><span>{formatProgressText(goal.currentValue, goal.targetValue, goal.unit, goal.goalType)}</span></div>
                {goal.goalType === 'general' && !goal.isComplete && (<div className="checkbox-grid">{renderCheckboxes()}</div>)}
                {goal.description && <p className="goal-description">{goal.description}</p>}
                {goal.deadline && <p className="goal-deadline">Deadline: {goal.deadline}</p>}
            </div>
            <div className="goal-footer"><button className="button-icon delete-button" onClick={() => onDelete(goal)}><TrashIcon /></button>{goal.goalType === 'financial' && !goal.isComplete && (<button className="button add-progress-button" onClick={() => onAddProgress(goal)}>Add Progress</button>)}</div>
        </div>
    );
});

const GoalModal = ({ isOpen, onClose, onSave, onDelete, isSubmitting, goal }) => {
    const isEditing = !!goal;
    const initialFormState = { goalType: 'financial', title: '', description: '', targetValue: '', unit: '', deadline: '' };
    const [formState, setFormState] = useState(initialFormState);
    const [type, setType] = useState('financial');

    useEffect(() => { if (isOpen) { const state = { ...initialFormState, ...(goal || {}) }; setFormState(state); setType(state.goalType || 'financial'); } }, [isOpen, goal]);
    const handleSubmit = (e) => { e.preventDefault(); onSave({ ...formState, goalType: type }); };
    if (!isOpen) return null;
    return (<div className="modal-backdrop" onClick={onClose}><div className="modal-content" onClick={e => e.stopPropagation()}><form onSubmit={handleSubmit}><div className="modal-header"><h2>{goal ? 'Edit Goal' : 'New Goal'}</h2><button type="button" className="close-modal-button" onClick={onClose}><CloseIcon /></button></div><div className="modal-body">{!isEditing && (<div className="goal-type-selector"><button type="button" className={type === 'financial' ? 'active' : ''} onClick={() => setType('financial')}>Financial</button><button type="button" className={type === 'general' ? 'active' : ''} onClick={() => setType('general')}>General</button></div>)}<input type="text" className="input-field" placeholder={type === 'financial' ? "e.g., Save for a Trip" : "e.g., Read 20 Books"} value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} required autoFocus /><textarea className="input-field" placeholder="Description (optional)" value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})} rows="3"></textarea><div className="form-row"><input type="number" className="input-field" placeholder="Target Value" value={formState.targetValue} onChange={e => setFormState({...formState, targetValue: Number(e.target.value)})} required />{type === 'general' && (<input type="text" className="input-field" placeholder="Unit (e.g., books)" value={formState.unit} onChange={e => setFormState({...formState, unit: e.target.value})} />)}</div><input type="date" className="input-field" value={formState.deadline} onChange={e => setFormState({...formState, deadline: e.target.value})} /></div><div className="modal-footer">{goal && (<button type="button" className="button delete-goal-button" onClick={() => onDelete(goal)}>Delete Goal</button>)}<button type="submit" className="button save-goal-button" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Goal'}</button></div></form></div></div>);
};

const AddProgressModal = ({ isOpen, onClose, onSave, isSubmitting, goal }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    useEffect(() => { if (!isOpen) { setAmount(''); setError(''); } }, [isOpen]);
    const handleChange = (e) => { const value = Number(e.target.value); if (goal && goal.targetValue) { const remaining = goal.targetValue - (goal.currentValue || 0); if (value > remaining) { setError(`Amount cannot exceed the remaining ${formatValue(remaining)}.`); } else { setError(''); } } setAmount(e.target.value); };
    const handleSubmit = (e) => { e.preventDefault(); if (error || !amount) return; onSave(Number(amount)); };
    if (!isOpen || !goal) return null;
    return (<div className="modal-backdrop" onClick={onClose}><div className="modal-content" onClick={e => e.stopPropagation()}><form onSubmit={handleSubmit}><div className="modal-header"><h2>Add Progress to "{goal.title}"</h2><button type="button" className="close-modal-button" onClick={onClose}><CloseIcon /></button></div><div className="modal-body"><div className="form-group"><input type="number" className={`input-field ${error ? 'error' : ''}`} placeholder={`Value to add (e.g., 500)`} value={amount} onChange={handleChange} required autoFocus/>{error && <span className="validation-error">{error}</span>}</div></div><div className="modal-footer"><button type="button" className="button secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="button save-goal-button" disabled={isSubmitting || !!error}>{isSubmitting ? 'Saving...' : 'Add'}</button></div></form></div></div>);
};

function CurrentGoals() {
    const { user } = useAuth();
    const { goals, loading, addGoal, updateGoal, addProgress, toggleComplete, deleteGoal } = useGoals();
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [selectedGoal, setSelectedGoal] = useState(null);

    const addToast = (message, type = 'success') => { const id = Date.now(); setToasts(p => [...p, { id, message, type }]); };
    const handleOpenGoalModal = (goal = null) => { setSelectedGoal(goal); setIsGoalModalOpen(true); };
    const handleCloseGoalModal = () => { setIsGoalModalOpen(false); setSelectedGoal(null); };
    const handleSaveGoal = async (goalData) => {setIsSubmitting(true); try { if (selectedGoal) { await updateGoal(selectedGoal.id, goalData); addToast("Goal updated!"); } else { await addGoal(goalData); addToast("Goal added!"); } handleCloseGoalModal(); } catch(err) { addToast("An error occurred.", "error"); } finally { setIsSubmitting(false); } };
    const handleOpenProgressModal = (goal) => { setSelectedGoal(goal); setIsProgressModalOpen(true); };
    const handleCloseProgressModal = () => { setIsProgressModalOpen(false); setSelectedGoal(null); };
    const handleSaveProgress = async (amount) => { if (!selectedGoal || !amount || amount <= 0) return; setIsSubmitting(true); try { await addProgress(selectedGoal.id, amount); addToast(`${formatValue(amount)} ${selectedGoal.unit || ''} added!`); handleCloseProgressModal(); } catch(err) { addToast("Failed to add progress.", "error"); } finally { setIsSubmitting(false); } };
    const handleDeleteRequest = (goal) => { handleCloseGoalModal(); setSelectedGoal(goal); setIsDeleteModalOpen(true); };
    const handleConfirmDelete = async () => { if (!selectedGoal) return; setIsSubmitting(true); try { await deleteGoal(selectedGoal.id); addToast("Goal deleted."); } catch (err) { addToast("Failed to delete goal.", "error"); } finally { setIsDeleteModalOpen(false); setSelectedGoal(null); setIsSubmitting(false); } };
    const handleToggleComplete = async (id, currentStatus) => { try { await toggleComplete(id, currentStatus); addToast("Goal status updated!"); } catch (err) { addToast("Failed to update status.", "error"); } };
    const handleCheckboxToggle = async (goal, isChecked) => { const amount = isChecked ? -1 : 1; if ((goal.currentValue + amount) > goal.targetValue || (goal.currentValue + amount) < 0) return; try { await addProgress(goal.id, amount); } catch (err) { addToast("Failed to update progress.", "error"); }};

    const inProgressGoals = useMemo(() => goals.filter(g => !g.isComplete), [goals]);
    const completedGoals = useMemo(() => goals.filter(g => g.isComplete), [goals]);

    return (
        <>
            <div className="page-container goals-page">
                <div className="card goals-card">
                    <div className="goals-header"><Link to="/dashboard" className="back-button"><BackIcon /></Link><div className="header-title-container"><GoalsSvg className="header-icon" /><h1 className="header-title">Current Goals</h1></div><button className="add-idea-button" onClick={() => handleOpenGoalModal()}><PlusIcon/></button></div>
                    <div className="goals-list-container">
                        {loading ? (<div className="centered-feedback"><SpinnerIcon/></div>) : goals.length === 0 ? (
                            <div className="empty-state-container"><GoalsSvg className="empty-state-svg" /><p>No goals set yet.</p><span>Click the '+' to create your first goal!</span></div>
                        ) : (
                            <>
                                {inProgressGoals.length > 0 && <div className="list-section"><h3>In Progress<span className="count-badge">{inProgressGoals.length}</span></h3><div className="goals-grid">{inProgressGoals.map(goal => ( <GoalItem key={goal.id} goal={goal} onAddProgress={handleOpenProgressModal} onToggleComplete={handleToggleComplete} onEdit={handleOpenGoalModal} onDelete={handleDeleteRequest} onCheckboxToggle={handleCheckboxToggle}/>))}</div></div>}
                                {completedGoals.length > 0 && <div className="list-section"><h3>Completed<span className="count-badge">{completedGoals.length}</span></h3><div className="goals-grid">{completedGoals.map(goal => ( <GoalItem key={goal.id} goal={goal} onToggleComplete={handleToggleComplete} onEdit={handleOpenGoalModal} onDelete={handleDeleteRequest} onCheckboxToggle={handleCheckboxToggle} />))}</div></div>}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <GoalModal isOpen={isGoalModalOpen} onClose={handleCloseGoalModal} onSave={handleSaveGoal} onDelete={handleDeleteRequest} isSubmitting={isSubmitting} goal={selectedGoal} />
            <AddProgressModal isOpen={isProgressModalOpen} onClose={handleCloseProgressModal} onSave={handleSaveProgress} isSubmitting={isSubmitting} goal={selectedGoal} />
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Delete Goal?">Are you sure you want to permanently delete <strong>{selectedGoal?.title}</strong>? This action cannot be undone.</ConfirmationModal>
            <div className="toast-container"> {toasts.map(t => ( <Toast key={t.id} {...t} onDismiss={() => setToasts(p => p.filter(toast => toast.id !== t.id))} /> ))} </div>
        </>
    );
}
export default CurrentGoals;