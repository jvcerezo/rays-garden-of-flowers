// src/components/CurrentGoals.js

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoals } from '../hooks/useGoals';
import './CurrentGoals.css';
import { ReactComponent as GoalsSvg } from '../assets/current-goals.svg';

// --- ICONS (Added TrashIcon) ---
const BackIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg> );
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg> );
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg> );
const CheckCircleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>);
const SpinnerIcon = () => ( <svg className="spinner" viewBox="0 0 50 50"><circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle></svg> );
const PencilIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg> );
const TrashIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg> );


// --- Helper & Child Component Definitions ---
const formatCurrency = (amount) => `₱${new Intl.NumberFormat('en-US').format(amount)}`;
const Toast = ({ message, type, onDismiss }) => { useEffect(() => { const timer = setTimeout(() => { onDismiss(); }, 4000); return () => clearTimeout(timer); }, [onDismiss]); return ( <div className={`toast toast-${type}`}> {message} </div> ); };
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => { if (!isOpen) return null; return ( <div className="modal-backdrop" onClick={onClose}> <div className="modal-content" onClick={(e) => e.stopPropagation()}> <h2>{title}</h2> <p>{children}</p> <div className="modal-actions"> <button className="button secondary-button" onClick={onClose}>Cancel</button> <button className="button danger-button" onClick={onConfirm}>Confirm</button> </div> </div> </div> ); };


const GoalItem = React.memo(({ goal, onAddProgress, onToggleComplete, onEdit, onDelete }) => {
    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    
    return (
        <div className={`goal-item ${goal.isComplete ? 'complete' : ''}`}>
            <div className="goal-header">
                <h4 className="goal-title">{goal.title}</h4>
                <button className="complete-button" onClick={() => onToggleComplete(goal.id, goal.isComplete)}><CheckCircleIcon /></button>
            </div>
            <div className="goal-body">
                <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                </div>
                <div className="goal-stats">
                    <span className="current-amount">{formatCurrency(goal.currentAmount)}</span>
                    <span className="target-amount">of {formatCurrency(goal.targetAmount)}</span>
                </div>
                {goal.deadline && <p className="goal-deadline">Deadline: {goal.deadline}</p>}
            </div>
            <div className="goal-footer">
                <div className="footer-actions-left">
                    <button className="button-icon edit-button" onClick={() => onEdit(goal)}><PencilIcon /></button>
                    <button className="button-icon delete-button" onClick={() => onDelete(goal)}><TrashIcon /></button>
                </div>
                {!goal.isComplete && (
                    <button className="button add-progress-button" onClick={() => onAddProgress(goal)}>Add Progress</button>
                )}
            </div>
        </div>
    );
});

const GoalModal = ({ isOpen, onClose, onSave, isSubmitting, goal }) => {
    const [formState, setFormState] = useState({ title: '', description: '', targetAmount: '', deadline: '' });
    useEffect(() => { if (isOpen) { setFormState(goal || { title: '', description: '', targetAmount: '', deadline: '' }); } }, [isOpen, goal]);
    const handleSubmit = (e) => { e.preventDefault(); onSave(formState); };
    if (!isOpen) return null;
    return (<div className="modal-backdrop" onClick={onClose}><div className="modal-content" onClick={e => e.stopPropagation()}><form onSubmit={handleSubmit}><div className="modal-header"><h2>{goal ? 'Edit Goal' : 'New Goal'}</h2><button type="button" className="close-modal-button" onClick={onClose}><CloseIcon /></button></div><div className="modal-body"><input type="text" className="input-field" placeholder="Goal Title (e.g., Trip to Japan)" value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} required autoFocus /><textarea className="input-field" placeholder="Description (optional)" value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})} rows="3"></textarea><div className="form-row"><input type="number" className="input-field" placeholder="Target Amount (₱)" value={formState.targetAmount} onChange={e => setFormState({...formState, targetAmount: Number(e.target.value)})} required /><input type="date" className="input-field" value={formState.deadline} onChange={e => setFormState({...formState, deadline: e.target.value})} /></div></div><div className="modal-footer"><button type="button" className="button secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="button save-idea-button" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Goal'}</button></div></form></div></div>);
};

const AddProgressModal = ({ isOpen, onClose, onSave, isSubmitting, goal }) => {
    const [amount, setAmount] = useState('');
    useEffect(() => { if(!isOpen) setAmount('') }, [isOpen]);
    if (!isOpen) return null;
    return (<div className="modal-backdrop" onClick={onClose}><div className="modal-content" onClick={e => e.stopPropagation()}><form onSubmit={(e) => { e.preventDefault(); onSave(Number(amount)); }}><div className="modal-header"><h2>Add Progress to "{goal.title}"</h2><button type="button" className="close-modal-button" onClick={onClose}><CloseIcon /></button></div><div className="modal-body"><input type="number" className="input-field" placeholder="Amount (₱)" value={amount} onChange={e => setAmount(e.target.value)} required autoFocus/></div><div className="modal-footer"><button type="button" className="button secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="button save-idea-button" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Add'}</button></div></form></div></div>);
};


function CurrentGoals() {
    const { user } = useAuth();
    const { goals, loading, addGoal, updateGoal, addProgress, toggleComplete, deleteGoal } = useGoals();
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const addToast = (message, type = 'success') => { const id = Date.now(); setToasts(p => [...p, { id, message, type }]); };
    const handleOpenGoalModal = (goal = null) => { setSelectedGoal(goal); setIsGoalModalOpen(true); };
    const handleCloseGoalModal = () => setIsGoalModalOpen(false);
    const handleSaveGoal = async (goalData) => {
        setIsSubmitting(true);
        try {
            if (selectedGoal) {
                await updateGoal(selectedGoal.id, goalData);
                addToast("Goal updated!");
            } else {
                await addGoal(goalData);
                addToast("Goal added!");
            }
            handleCloseGoalModal();
        } catch(err) { addToast("An error occurred.", "error"); }
        finally { setIsSubmitting(false); }
    };
    
    const handleOpenProgressModal = (goal) => { setSelectedGoal(goal); setIsProgressModalOpen(true); };
    const handleCloseProgressModal = () => setIsProgressModalOpen(false);
    const handleSaveProgress = async (amount) => {
        if (!selectedGoal || !amount || amount <= 0) return;
        setIsSubmitting(true);
        try {
            await addProgress(selectedGoal.id, amount);
            addToast(`₱${amount} added!`);
            handleCloseProgressModal();
        } catch(err) { addToast("Failed to add progress.", "error"); }
        finally { setIsSubmitting(false); }
    };

    const handleDeleteRequest = (goal) => {
        setSelectedGoal(goal);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedGoal) return;
        try {
            await deleteGoal(selectedGoal.id);
            addToast("Goal deleted.");
        } catch (err) {
            addToast("Failed to delete goal.", "error");
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedGoal(null);
        }
    };

    const inProgressGoals = useMemo(() => goals.filter(g => !g.isComplete), [goals]);
    const completedGoals = useMemo(() => goals.filter(g => g.isComplete), [goals]);

    const renderGoalList = (list) => (
        <div className="goals-grid">
            {list.map(goal => (
                <GoalItem
                    key={goal.id}
                    goal={goal}
                    onAddProgress={handleOpenProgressModal}
                    onToggleComplete={toggleComplete}
                    onEdit={handleOpenGoalModal}
                    onDelete={handleDeleteRequest}
                />
            ))}
        </div>
    );

    return (
        <>
            <div className="page-container goals-page">
                <div className="card goals-card">
                    <div className="goals-header">
                        <Link to="/dashboard" className="back-button"><BackIcon /></Link>
                        <div className="header-title-container">
                            <GoalsSvg className="header-icon" />
                            <h1 className="header-title">Current Goals</h1>
                        </div>
                        <button className="add-idea-button" onClick={() => handleOpenGoalModal()}><PlusIcon/></button>
                    </div>
                    <div className="goals-list-container">
                        {loading ? (<div className="centered-feedback"><SpinnerIcon/></div>) : goals.length === 0 ? (
                            <div className="empty-state-container">
                                <GoalsSvg className="empty-state-svg" />
                                <p>No goals set yet.</p>
                                <span>Click the '+' to create your first goal!</span>
                            </div>
                        ) : (
                            <>
                                {inProgressGoals.length > 0 && <div className="list-section"><h3>In Progress<span className="count-badge">{inProgressGoals.length}</span></h3>{renderGoalList(inProgressGoals)}</div>}
                                {completedGoals.length > 0 && <div className="list-section"><h3>Completed<span className="count-badge">{completedGoals.length}</span></h3>{renderGoalList(completedGoals)}</div>}
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            <GoalModal isOpen={isGoalModalOpen} onClose={handleCloseGoalModal} onSave={handleSaveGoal} isSubmitting={isSubmitting} goal={selectedGoal} />
            <AddProgressModal isOpen={isProgressModalOpen} onClose={handleCloseProgressModal} onSave={handleSaveProgress} isSubmitting={isSubmitting} goal={selectedGoal} />
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Delete Goal?">Are you sure you want to permanently delete <strong>{selectedGoal?.title}</strong>? This action cannot be undone.</ConfirmationModal>
            <div className="toast-container"> {toasts.map(t => ( <Toast key={t.id} {...t} onDismiss={() => setToasts(p => p.filter(toast => toast.id !== t.id))} /> ))} </div>
        </>
    );
}
export default CurrentGoals;