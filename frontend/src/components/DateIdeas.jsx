import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDateIdeas } from '../hooks/useDateIdeas';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from './LoadingSpinner';
import './DateIdeas.css';
import { ReactComponent as DateIdeasSvg } from '../assets/date-ideas.svg';

// --- ICONS ---
const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
    </svg>
);

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.003-.001c.194-.084.69-.344 1.337-.724 1.29-1.29 2.4-3.03 2.973-5.074.572-2.044.753-4.14.032-6.327C14.012 4.71 12.224 3 10 3S5.988 4.71 5.348 6.808c-.72 2.187-.54 4.283.032 6.327.573 2.044 1.683 3.784 2.973 5.074.647.38 1.143.64 1.337.724zM10 12.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
    </svg>
);

const BudgetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.75 10.837a.75.75 0 01-1.5 0V8.25h-.5a.75.75 0 010-1.5h.5V6a.75.75 0 011.5 0v.75h.5a.75.75 0 010 1.5h-.5v2.587z" />
        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5z" clipRule="evenodd" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
);

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 9.24a.75.75 0 00-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75z" clipRule="evenodd" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
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
                <input
                    type="text"
                    placeholder="Title"
                    value={editState.title}
                    onChange={(e) => setEditState({...editState, title: e.target.value})}
                    className={`edit-input title ${errors.title ? 'error' : ''}`}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
                {errors.title && <span className="validation-error">{errors.title}</span>}
                <textarea
                    placeholder="Description..."
                    value={editState.description}
                    onChange={(e) => setEditState({...editState, description: e.target.value})}
                    className={`edit-input description ${errors.description ? 'error' : ''}`}
                    onKeyDown={handleKeyDown}
                    rows="2"
                />
                {errors.description && <span className="validation-error">{errors.description}</span>}
                <div className="edit-details">
                    <input
                        type="text"
                        placeholder="Location"
                        value={editState.location}
                        onChange={(e) => setEditState({...editState, location: e.target.value})}
                        className={`edit-input ${errors.location ? 'error' : ''}`}
                        onKeyDown={handleKeyDown}
                    />
                    <input
                        type="text"
                        placeholder="e.g., ₱500 or Free"
                        value={editState.budget}
                        onChange={(e) => setEditState({...editState, budget: e.target.value})}
                        className={`edit-input ${errors.budget ? 'error' : ''}`}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                {(errors.location || errors.budget) && <span className="validation-error">{errors.location || errors.budget}</span>}
                <div className="item-actions">
                    <button type="button" className="button-icon cancel-button" onClick={onCancel}><CloseIcon/></button>
                    <button type="button" className="button-icon save-button" onClick={handleSave}><SaveIcon/></button>
                </div>
            </div>
        );
    }

    return (
        <div className={`date-idea-item ${idea.finished ? 'finished' : ''}`}>
            <button
                type="button"
                className="finish-button"
                onClick={() => onToggleFinished(idea.id, idea.finished)}
                title={idea.finished ? "Mark as upcoming" : "Mark as completed"}
            >
                <CheckCircleIcon />
            </button>
            <div className="date-idea-content">
                <h4 className="date-idea-title">{idea.title}</h4>
                {idea.description && <p className="date-idea-description">{idea.description}</p>}
                <div className="date-idea-details">
                    {idea.location && <span><LocationIcon /> {idea.location}</span>}
                    {idea.budget && <span><BudgetIcon /> {formatBudget(idea.budget)}</span>}
                </div>
            </div>
            {!idea.finished && (
                <div className="item-actions">
                    <button type="button" className="button-icon edit-button" onClick={() => onEdit(idea.id)}>Edit</button>
                    <button type="button" className="button-icon delete-button" onClick={() => onDelete(idea)}>Delete</button>
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
        if (Object.keys(validationErrors).length === 0) {
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
                            <input
                                type="text"
                                className={`input-field ${errors.title ? 'error' : ''}`}
                                placeholder="Title (e.g., Stargazing at the park)"
                                value={formState.title}
                                onChange={(e) => setFormState({...formState, title: e.target.value})}
                                required
                                autoFocus
                            />
                            {errors.title && <span className="validation-error">{errors.title}</span>}
                        </div>
                        <div className="form-group">
                            <textarea
                                className={`input-field ${errors.description ? 'error' : ''}`}
                                placeholder="Description (optional)"
                                value={formState.description}
                                onChange={(e) => setFormState({...formState, description: e.target.value})}
                                rows="3"
                            ></textarea>
                            {errors.description && <span className="validation-error">{errors.description}</span>}
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                className={`input-field ${errors.location ? 'error' : ''}`}
                                placeholder="Location (optional)"
                                value={formState.location}
                                onChange={(e) => setFormState({...formState, location: e.target.value})}
                            />
                            {errors.location && <span className="validation-error">{errors.location}</span>}
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                className={`input-field ${errors.budget ? 'error' : ''}`}
                                placeholder="Budget (e.g., ₱500 or Free)"
                                value={formState.budget}
                                onChange={(e) => setFormState({...formState, budget: e.target.value})}
                            />
                            {errors.budget && <span className="validation-error">{errors.budget}</span>}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="button secondary-button" onClick={onClose}>Cancel</button>
                        <button type="submit" className="button save-idea-button" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Add Idea'}
                        </button>
                    </div>
                </form>
            </div>
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
                    <button type="button" className="button secondary-button" onClick={onClose}>Cancel</button> 
                    <button type="button" className="button danger-button" onClick={onConfirm}>Delete</button> 
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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [ideaToDelete, setIdeaToDelete] = useState(null);

    const handleAddIdea = async (ideaData) => {
        setIsSubmitting(true);
        try {
            await addIdea(ideaData);
            toast.success("Date idea added! 💕");
            setIsAddModalOpen(false);
        } catch (err) {
            toast.error("Failed to add idea.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateIdea = async (id, updatedData) => {
        try {
            await updateIdea(id, updatedData);
            toast.success("Date idea updated!");
        } catch (err) {
            toast.error("Failed to update idea.");
        } finally {
            setEditingIdeaId(null);
        }
    };

    const handleDeleteRequest = (idea) => {
        setIdeaToDelete(idea);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!ideaToDelete) return;
        try {
            await deleteIdea(ideaToDelete.id);
            toast.success("Date idea deleted.");
        } catch (err) {
            toast.error("Failed to delete idea.");
        } finally {
            setIsDeleteModalOpen(false);
            setIdeaToDelete(null);
        }
    };

    const unFinishedIdeas = useMemo(() => ideas.filter(idea => !idea.finished), [ideas]);
    const finishedIdeas = useMemo(() => ideas.filter(idea => idea.finished), [ideas]);
    const isListCompletelyEmpty = !loading && ideas.length === 0;

    return (
        <>
            <div className="date-ideas-page">
                <div className="date-ideas-card">
                    <div className="date-ideas-header">
                        <Link to="/dashboard" className="back-button" title="Back">
                            <BackIcon />
                        </Link>
                        <div className="header-title-container">
                            <DateIdeasSvg className="header-icon" />
                            <h1 className="header-title">Date Night Ideas</h1>
                        </div>
                        <button type="button" className="add-idea-button" onClick={() => setIsAddModalOpen(true)} title="Add Idea">
                            <PlusIcon />
                        </button>
                    </div>
                    <div className="date-ideas-content">
                        {loading ? ( 
                            <LoadingSpinner text="Loading date ideas..." />
                        ) : isListCompletelyEmpty ? (
                            <div className="empty-state-container">
                                <DateIdeasSvg className="empty-state-svg" />
                                <p>No date ideas yet.</p>
                                <span>Add your first idea to start planning amazing dates!</span>
                            </div>
                        ) : (
                            <>
                                {unFinishedIdeas.length > 0 && (
                                    <div className="list-section">
                                        <h3>
                                            Upcoming Ideas
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
                                {finishedIdeas.length > 0 && (
                                    <div className="list-section">
                                        <h3>
                                            Completed
                                            <span className="count-badge">{finishedIdeas.length}</span>
                                        </h3>
                                        <div className="date-ideas-grid">
                                            {finishedIdeas.map(idea => ( 
                                                <DateIdeaItem 
                                                    key={idea.id} 
                                                    idea={idea} 
                                                    isEditing={false}
                                                    onToggleFinished={toggleFinished} 
                                                    onDelete={handleDeleteRequest} 
                                                /> 
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
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
        </>
    );
}

export default DateIdeas;