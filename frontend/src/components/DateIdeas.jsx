// src/components/DateIdeas.js

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDateIdeas } from '../hooks/useDateIdeas';
import { LoadingSpinner } from './LoadingSpinner';
import './DateIdeas.css';
import { ReactComponent as DateIdeasSvg } from '../assets/date-ideas.svg';

// --- ICONS ---
const BackIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg> );
const LocationIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.003-.001c.194-.084.69-.344 1.337-.724 1.29-1.29 2.4-3.03 2.973-5.074.572-2.044.753-4.14.032-6.327C14.012 4.71 12.224 3 10 3S5.988 4.71 5.348 6.808c-.72 2.187-.54 4.283.032 6.327.573 2.044 1.683 3.784 2.973 5.074.647.38 1.143.64 1.337.724zM10 12.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" /></svg> );
const BudgetIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 10.837a.75.75 0 01-1.5 0V8.25h-.5a.75.75 0 010-1.5h.5V6a.75.75 0 011.5 0v.75h.5a.75.75 0 010 1.5h-.5v2.587z" /><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5z" clipRule="evenodd" /></svg> );
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg> );
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg> );
const SaveIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 9.24a.75.75 0 00-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75z" clipRule="evenodd" /></svg> );
const CheckCircleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>);
const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
  </svg>
);

// --- HELPER FUNCTIONS ---
const formatBudget = (budgetStr) => {
    if (!budgetStr || budgetStr.trim() === '') return '';
    const trimmed = budgetStr.trim();
    if (/^\d/.test(trimmed) && !trimmed.startsWith('₱')) {
        return `₱${trimmed}`;
    }
    return trimmed;
};

const validateIdea = (idea) => {
    const errors = {};
    if (!idea.title || idea.title.trim().length === 0) {
        errors.title = "Title is required.";
    } else if (idea.title.length > 100) {
        errors.title = "Title cannot exceed 100 characters.";
    }
    if (idea.description && idea.description.length > 500) {
        errors.description = "Description cannot exceed 500 characters.";
    }
    if (idea.location && idea.location.length > 100) {
        errors.location = "Location cannot exceed 100 characters.";
    }

    const budgetRegex = /^([₱\d,.\s-]+|Free)$/i;
    if (idea.budget && !budgetRegex.test(idea.budget)) {
        errors.budget = "Budget must be a number (e.g., 500) or 'Free'.";
    } else if (idea.budget && idea.budget.length > 50) {
        errors.budget = "Budget cannot exceed 50 characters.";
    }
    return errors;
};

// --- CHILD COMPONENTS ---
const DateIdeaItem = React.memo(({ idea, isEditing, onToggleFinished, onDelete, onEdit, onSave, onCancel }) => {
    const [editState, setEditState] = useState(idea);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isEditing) {
            setEditState(idea);
            setErrors({});
        }
    }, [isEditing, idea]);

    const handleSave = () => {
        const validationErrors = validateIdea(editState);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            onSave(idea.id, editState);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    if (isEditing) {
        return (
            <div className="date-idea-item editing">
                <input type="text" placeholder="Title" value={editState.title} onChange={(e) => setEditState({...editState, title: e.target.value})} className={`edit-input title ${errors.title ? 'error' : ''}`} onKeyDown={handleKeyDown} autoFocus/>
                {errors.title && <span className="validation-error">{errors.title}</span>}
                <textarea placeholder="Description..." value={editState.description} onChange={(e) => setEditState({...editState, description: e.target.value})} className={`edit-input description ${errors.description ? 'error' : ''}`} onKeyDown={handleKeyDown} rows="2"/>
                {errors.description && <span className="validation-error">{errors.description}</span>}
                <div className="edit-details">
                    <input type="text" placeholder="Location" value={editState.location} onChange={(e) => setEditState({...editState, location: e.target.value})} className={`edit-input ${errors.location ? 'error' : ''}`} onKeyDown={handleKeyDown}/>
                    <input type="text" placeholder="e.g., ₱500 or Free" value={editState.budget} onChange={(e) => setEditState({...editState, budget: e.target.value})} className={`edit-input ${errors.budget ? 'error' : ''}`} onKeyDown={handleKeyDown}/>
                </div>
                 {(errors.location || errors.budget) && <span className="validation-error">{errors.location || errors.budget}</span>}
                <div className="item-actions">
                    <button className="button-icon cancel-button" onClick={onCancel}><CloseIcon/></button>
                    <button className="button-icon save-button" onClick={handleSave}><SaveIcon/></button>
                </div>
            </div>
        )
    }

    return (
        <div className={`date-idea-item ${idea.finished ? 'finished' : ''}`}>
            <button
                className="finish-button"
                onClick={() => onToggleFinished(idea.id, idea.finished)}
                title={idea.finished ? 'Mark as upcoming' : 'Mark as completed'}
                aria-label={idea.finished ? 'Mark as upcoming' : 'Mark as completed'}
            >
                <CheckCircleIcon />
            </button>
            <div className="date-idea-content">
                <h4 className="date-idea-title">{idea.title}</h4>
                {idea.description && <p className="date-idea-description">{idea.description}</p>}
                <div className="date-idea-details">
                    {idea.location && (
                        <span className="garden-badge garden-badge-blue">
                            <LocationIcon /> {idea.location}
                        </span>
                    )}
                    {idea.budget && (
                        <span className="garden-badge garden-badge-emerald">
                            <BudgetIcon /> {formatBudget(idea.budget)}
                        </span>
                    )}
                    {idea.finished && (
                        <span className="garden-badge garden-badge-pink">
                            💖 Completed!
                        </span>
                    )}
                </div>
            </div>
            {!idea.finished && (
                <div className="item-actions">
                    <button
                        className="button-icon edit-button"
                        onClick={() => onEdit(idea.id)}
                        title="Edit idea"
                        aria-label="Edit idea"
                    >
                        <PencilIcon />
                    </button>
                    <button
                        className="button-icon delete-button"
                        onClick={() => onDelete(idea)}
                        title="Delete idea"
                        aria-label="Delete idea"
                    >
                        <TrashIcon />
                    </button>
                </div>
            )}
        </div>
    );
});

const AddIdeaModal = ({ isOpen, onClose, onAdd, isSubmitting }) => {
    const [formState, setFormState] = useState({ title: '', description: '', location: '', budget: '' });
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateIdea(formState);
        setErrors(validationErrors);
        if(Object.keys(validationErrors).length === 0){
            onAdd(formState);
        }
    };
    
    useEffect(() => {
        if (!isOpen) {
            setFormState({ title: '', description: '', location: '', budget: '' });
            setErrors({});
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                   <div className="modal-header">
                        <h2>New Date Idea</h2>
                        <button type="button" className="close-modal-button" onClick={onClose}><CloseIcon /></button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <input type="text" className={`input-field ${errors.title ? 'error' : ''}`} placeholder="Title (e.g., Stargazing at the park)" value={formState.title} onChange={(e) => setFormState({...formState, title: e.target.value})} required autoFocus/>
                            {errors.title && <span className="validation-error">{errors.title}</span>}
                            
                            {/* Suggestion Chips */}
                            <div className="suggestion-chips-row">
                                {['Stargazing 🌌', 'Sunset Picnic 🧺', 'Coffee Crawl ☕', 'Cook Dinner 🍝', 'Photobooth 📸'].map((chip) => (
                                    <button
                                        key={chip}
                                        type="button"
                                        className="suggestion-chip"
                                        onClick={() => setFormState(prev => ({ ...prev, title: chip }))}
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <textarea className={`input-field ${errors.description ? 'error' : ''}`} placeholder="Description (optional)" value={formState.description} onChange={(e) => setFormState({...formState, description: e.target.value})} rows="3"></textarea>
                            {errors.description && <span className="validation-error">{errors.description}</span>}
                        </div>
                        <div className="form-group">
                            <input type="text" className={`input-field ${errors.location ? 'error' : ''}`} placeholder="Location (optional)" value={formState.location} onChange={(e) => setFormState({...formState, location: e.target.value})} />
                            {errors.location && <span className="validation-error">{errors.location}</span>}
                        </div>
                        <div className="form-group">
                            <input type="text" className={`input-field ${errors.budget ? 'error' : ''}`} placeholder="Budget (e.g., ₱500 or Free)" value={formState.budget} onChange={(e) => setFormState({...formState, budget: e.target.value})} />
                            {errors.budget && <span className="validation-error">{errors.budget}</span>}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="button secondary-button" onClick={onClose}>Cancel</button>
                        <button type="submit" className="button save-idea-button" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Add Idea'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Toast = ({ message, type, onDismiss }) => { 
    useEffect(() => { 
        const timer = setTimeout(() => { 
            onDismiss(); 
        }, 4000); 
        return () => clearTimeout(timer); 
    }, [onDismiss]); 
    
    return ( 
        <div className={`toast ${type}`} onClick={onDismiss}> 
            {message} 
        </div> 
    ); 
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => { 
    if (!isOpen) return null; 
    
    return ( 
        <div className="modal-backdrop" onClick={onClose}> 
            <div className="modal-content" onClick={(e) => e.stopPropagation()}> 
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button type="button" className="close-modal-button" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                <div className="modal-footer"> 
                    <button className="button secondary-button" onClick={onClose}>Cancel</button> 
                    <button className="button" style={{background: 'var(--danger-color)', color: 'white'}} onClick={onConfirm}>Delete</button> 
                </div> 
            </div> 
        </div> 
    ); 
};

function DateIdeas() {
    const { ideas, loading, addIdea, updateIdea, toggleFinished, deleteIdea } = useDateIdeas();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingIdeaId, setEditingIdeaId] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [ideaToDelete, setIdeaToDelete] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'completed'
    const [pickedIdea, setPickedIdea] = useState(null);

    const addToast = (message, type = 'success') => { const id = Date.now(); setToasts(p => [...p, { id, message, type }]); };
    const handleAddIdea = async (ideaData) => { setIsSubmitting(true); try { await addIdea(ideaData); addToast("Date idea added!"); setIsAddModalOpen(false); } catch (err) { addToast("Failed to add idea.", "error"); } finally { setIsSubmitting(false); } };
    const handleUpdateIdea = async (id, updatedData) => { try { await updateIdea(id, updatedData); addToast("Date idea updated!"); } catch (err) { addToast("Failed to update idea.", "error"); } finally { setEditingIdeaId(null); } };
    const handleDeleteRequest = (idea) => { setIdeaToDelete(idea); setIsDeleteModalOpen(true); };
    const handleConfirmDelete = async () => { if (!ideaToDelete) return; try { await deleteIdea(ideaToDelete.id); addToast("Date idea deleted."); } catch (err) { addToast("Failed to delete idea.", "error"); } finally { setIsDeleteModalOpen(false); setIdeaToDelete(null); } };

    const unFinishedIdeas = useMemo(() => ideas.filter(idea => !idea.finished), [ideas]);
    const finishedIdeas = useMemo(() => ideas.filter(idea => idea.finished), [ideas]);
    const isListCompletelyEmpty = !loading && ideas.length === 0;

    const handlePickRandomIdea = () => {
        if (unFinishedIdeas.length === 0) return;
        const randomIndex = Math.floor(Math.random() * unFinishedIdeas.length);
        setPickedIdea(unFinishedIdeas[randomIndex]);
    };

    return (
        <>
            <div className="page-container date-ideas-page">
                <header className="tracker-header">
                    <Link to="/dashboard" className="back-button" title="Back to Dashboard">
                        <BackIcon />
                    </Link>
                    <div className="header-title-container">
                        <h1 className="header-title">Date Night Ideas 💖</h1>
                        <span className="header-subtitle">What should we do next?</span>
                    </div>
                    <div className="header-right-actions">
                        <button
                            className="header-icon-button"
                            onClick={() => setIsAddModalOpen(true)}
                            title="Add Date Idea"
                            aria-label="Add Date Idea"
                        >
                            <PlusIcon />
                        </button>
                    </div>
                </header>

                <div className="date-ideas-content">
                    {loading ? ( 
                        <LoadingSpinner text="Loading Date Ideas..." />
                    ) : isListCompletelyEmpty ? (
                            <div className="empty-state-container">
                                <DateIdeasSvg className="empty-state-svg" />
                                <p>No date ideas yet.</p>
                                <span>Add your first idea to start planning amazing dates!</span>
                            </div>
                        ) : (
                            <>
                                {/* Filter Bar & Surprise Pick Button */}
                                <div className="date-actions-row">
                                    <div className="garden-filter-bar">
                                        <button
                                            type="button"
                                            className={`garden-filter-pill ${filter === 'all' ? 'active' : ''}`}
                                            onClick={() => setFilter('all')}
                                        >
                                            All ({ideas.length})
                                        </button>
                                        <button
                                            type="button"
                                            className={`garden-filter-pill ${filter === 'upcoming' ? 'active' : ''}`}
                                            onClick={() => setFilter('upcoming')}
                                        >
                                            Upcoming ({unFinishedIdeas.length})
                                        </button>
                                        <button
                                            type="button"
                                            className={`garden-filter-pill ${filter === 'completed' ? 'active' : ''}`}
                                            onClick={() => setFilter('completed')}
                                        >
                                            💖 Completed ({finishedIdeas.length})
                                        </button>
                                    </div>

                                    {unFinishedIdeas.length > 0 && (
                                        <button
                                            type="button"
                                            className="random-pick-btn date-surprise-btn"
                                            onClick={handlePickRandomIdea}
                                            title="Pick a surprise date idea"
                                        >
                                            🎲 Surprise Us!
                                        </button>
                                    )}
                                </div>

                                {(filter === 'all' || filter === 'upcoming') && unFinishedIdeas.length > 0 && (
                                    <div className="list-section">
                                        <h3>
                                            ✨ Upcoming Ideas
                                            <span className="count-badge">{unFinishedIdeas.length}</span>
                                        </h3>
                                        <div className="date-ideas-grid">
                                            {unFinishedIdeas.map(idea => ( 
                                                <DateIdeaItem 
                                                    key={idea.id} 
                                                    idea={idea} 
                                                    isEditing={editingIdeaId === idea.id} 
                                                    onToggleFinished={toggleFinished} 
                                                    onDelete={handleDeleteRequest} 
                                                    onEdit={setEditingIdeaId} 
                                                    onSave={handleUpdateIdea} 
                                                    onCancel={() => setEditingIdeaId(null)} 
                                                /> 
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(filter === 'all' || filter === 'completed') && finishedIdeas.length > 0 && (
                                    <div className="list-section">
                                        <h3>
                                            💖 Completed Memories
                                            <span className="count-badge">{finishedIdeas.length}</span>
                                        </h3>
                                        <div className="date-ideas-grid">
                                            {finishedIdeas.map(idea => ( 
                                                <DateIdeaItem 
                                                    key={idea.id} 
                                                    idea={idea} 
                                                    onToggleFinished={toggleFinished} 
                                                    onDelete={handleDeleteRequest} 
                                                /> 
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {filter === 'upcoming' && unFinishedIdeas.length === 0 && (
                                    <div className="empty-filter-state">
                                        <p>No upcoming dates planned yet. Add one above! ✨</p>
                                    </div>
                                )}

                                {filter === 'completed' && finishedIdeas.length === 0 && (
                                    <div className="empty-filter-state">
                                        <p>No completed date ideas yet. Check one off when you go! 💖</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
            </div>

            {/* Surprise Date Winner Modal */}
            {pickedIdea && (
                <div className="modal-backdrop" onClick={() => setPickedIdea(null)}>
                    <div className="modal-content random-winner-modal" onClick={e => e.stopPropagation()}>
                        <div className="random-modal-icon">💖✨</div>
                        <span className="random-modal-tag">Our Date Night Pick!</span>
                        <h3 className="random-modal-title">{pickedIdea.title}</h3>
                        {pickedIdea.description && (
                            <p className="random-modal-desc">{pickedIdea.description}</p>
                        )}
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="button secondary-button"
                                onClick={handlePickRandomIdea}
                            >
                                🎲 Roll Again
                            </button>
                            <button
                                type="button"
                                className="button save-idea-button"
                                onClick={() => setPickedIdea(null)}
                            >
                                Let's Go! 🌹
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <AddIdeaModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onAdd={handleAddIdea} 
                isSubmitting={isSubmitting} 
            />
            <ConfirmationModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={handleConfirmDelete} 
                title="Delete Date Idea?"
            > 
                Are you sure you want to permanently delete <strong>{ideaToDelete?.title}</strong>? This action cannot be undone. 
            </ConfirmationModal>
            {toasts.length > 0 && (
                <div className="toast-container"> 
                    {toasts.map(t => ( 
                        <Toast 
                            key={t.id} 
                            {...t} 
                            onDismiss={() => setToasts(p => p.filter(toast => toast.id !== t.id))} 
                        /> 
                    ))} 
                </div>
            )}
        </>
    );
}
export default DateIdeas;