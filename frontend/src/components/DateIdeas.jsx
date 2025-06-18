import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import './DateIdeas.css';

// --- Icon Components ---
const BackIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg> );
const LocationIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.003-.001c.194-.084.69-.344 1.337-.724 1.29-1.29 2.4-3.03 2.973-5.074.572-2.044.753-4.14.032-6.327C14.012 4.71 12.224 3 10 3S5.988 4.71 5.348 6.808c-.72 2.187-.54 4.283.032 6.327.573 2.044 1.683 3.784 2.973 5.074.647.38 1.143.64 1.337.724zM10 12.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" /></svg> );
const BudgetIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 10.837a.75.75 0 01-1.5 0V8.25h-.5a.75.75 0 010-1.5h.5V6a.75.75 0 011.5 0v.75h.5a.75.75 0 010 1.5h-.5v2.587z" /><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5z" clipRule="evenodd" /></svg> );
const EditIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg> );
const DatePageIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 8.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zm3 0a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zm3 0a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zm-6 3a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zm3 0a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zm3 0a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1z" clipRule="evenodd" /></svg>);
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg> );
const CheckCircleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>);

// --- Skeleton Loader Component ---
const DateIdeaSkeleton = () => (
    <div className="date-idea-item skeleton">
        <div className="skeleton-icon"></div>
        <div className="skeleton-content">
            <div className="skeleton-text skeleton-title"></div>
            <div className="skeleton-text skeleton-details"></div>
        </div>
    </div>
);

const initialFormState = { title: '', description: '', location: '', budget: '', finished: false };

function DateIdeas() {
    const { user } = useAuth();
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIdeaId, setSelectedIdeaId] = useState(null);
    const [formState, setFormState] = useState(initialFormState);

    const dateIdeasCollectionRef = useCallback(() => user ? collection(db, 'users', user.uid, 'dateIdeas') : null, [user]);
    
    useEffect(() => {
        if (!user) { setLoading(false); return; }
        // Simplified query for stability
        const q = query(dateIdeasCollectionRef(), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedIdeas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Client-side sort to organize by 'finished' status
            fetchedIdeas.sort((a, b) => a.finished - b.finished);
            setIdeas(fetchedIdeas);
            setLoading(false);
        }, (err) => {
            console.error("Firestore onSnapshot error: ", err);
            setError('Failed to fetch date ideas.');
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user, dateIdeasCollectionRef]);

    const selectedIdea = useMemo(() => ideas.find(idea => idea.id === selectedIdeaId), [ideas, selectedIdeaId]);

    useEffect(() => {
        if (selectedIdea) setFormState(selectedIdea);
        else setFormState(initialFormState);
    }, [selectedIdea]);

    const handleOpenModal = (ideaId = null) => {
        setSelectedIdeaId(ideaId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedIdeaId(null), 300);
    };
    
    const handleToggleFinished = async (e, ideaToToggle) => {
        e.stopPropagation();
        const originalIdeas = ideas;
        const optimisticIdeas = ideas.map(idea => 
            idea.id === ideaToToggle.id ? { ...idea, finished: !idea.finished } : idea
        );
        optimisticIdeas.sort((a, b) => a.finished - b.finished);
        setIdeas(optimisticIdeas);

        const ideaDocRef = doc(db, 'users', user.uid, 'dateIdeas', ideaToToggle.id);
        try {
            await updateDoc(ideaDocRef, { finished: !ideaToToggle.finished });
        } catch (err) {
            setError('Failed to update status.');
            setIdeas(originalIdeas);
        }
    };
    
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (formState.title.trim() === '' || isSubmitting) return;
        setIsSubmitting(true);
        setError(null);
        const isEditing = !!selectedIdeaId;
        try {
            if (isEditing) {
                const ideaDocRef = doc(db, 'users', user.uid, 'dateIdeas', selectedIdeaId);
                const { id, ...ideaToUpdate } = formState;
                await updateDoc(ideaDocRef, ideaToUpdate);
            } else {
                await addDoc(dateIdeasCollectionRef(), { ...formState, createdAt: serverTimestamp() });
            }
            handleCloseModal();
        } catch (err) {
            setError(isEditing ? 'Failed to update idea.' : 'Failed to add idea.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteIdea = async (id) => {
        if (!id) return;
        handleCloseModal();
        try {
            const ideaDocRef = doc(db, 'users', user.uid, 'dateIdeas', id);
            await deleteDoc(ideaDocRef);
        } catch (err) { setError('Failed to delete idea.'); }
    };
    
    const unFinishedIdeas = ideas.filter(idea => !idea.finished);
    const finishedIdeas = ideas.filter(idea => idea.finished);

    const ListContent = () => {
        if (loading) {
            return (
                <div className="date-ideas-grid">
                    <DateIdeaSkeleton />
                    <DateIdeaSkeleton />
                    <DateIdeaSkeleton />
                </div>
            );
        }

        if (ideas.length === 0) {
            return (
                <div className="empty-state">
                    <div className="empty-state-icon"><DatePageIcon /></div>
                    <h2>Your Canvas is Clear</h2>
                    <p>Click the '+' button to add your first great date idea!</p>
                </div>
            );
        }

        return (
            <>
                {unFinishedIdeas.length > 0 && (
                     <div className="list-section">
                        <div className="list-section-header">
                            <h3>To Do</h3>
                            <span className="movie-count-badge">{unFinishedIdeas.length}</span>
                        </div>
                        <div className="date-ideas-grid">
                            {unFinishedIdeas.map(idea => (
                                <div key={idea.id} className="date-idea-item">
                                    <button className="finish-button" onClick={(e) => handleToggleFinished(e, idea)}><CheckCircleIcon /></button>
                                    <div className="date-idea-content">
                                        <h4 className="date-idea-title">{idea.title}</h4>
                                        {idea.description && <p className="date-idea-description">{idea.description}</p>}
                                        <div className="date-idea-details">
                                            {idea.location && <span><LocationIcon /> {idea.location}</span>}
                                            {idea.budget && <span><BudgetIcon /> {idea.budget}</span>}
                                        </div>
                                    </div>
                                    <div className="date-idea-actions">
                                        <button className="edit-button" onClick={() => handleOpenModal(idea.id)}><EditIcon /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
               
                {finishedIdeas.length > 0 && (
                    <div className="list-section">
                        <div className="list-section-header">
                            <h3>Finished</h3>
                            <span className="movie-count-badge">{finishedIdeas.length}</span>
                        </div>
                        <div className="date-ideas-grid">
                            {finishedIdeas.map(idea => (
                                <div key={idea.id} className="date-idea-item finished">
                                    <button className="finish-button" onClick={(e) => handleToggleFinished(e, idea)}><CheckCircleIcon /></button>
                                    <div className="date-idea-content">
                                        <h4 className="date-idea-title">{idea.title}</h4>
                                        {idea.description && <p className="date-idea-description">{idea.description}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
    };

    return (
        <>
            <div className="page-container date-ideas-page">
                <div className="card date-ideas-card">
                    <div className="date-ideas-header">
                        <Link to="/dashboard" className="back-button"><BackIcon /></Link>
                        <div className="header-text-container"><h1 className="header-title">Date Night Ideas</h1></div>
                        <button className="add-idea-button" onClick={() => handleOpenModal()}>+</button>
                    </div>

                    {error && <p className="error-message" onClick={() => setError(null)}>{error}</p>}
                    
                    <div className="date-ideas-list-container">
                        <ListContent />
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-backdrop" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleFormSubmit}>
                           <div className="modal-header">
                                <h2>{selectedIdeaId ? 'Edit Date Idea' : 'New Date Idea'}</h2>
                                <button type="button" className="close-modal-button" onClick={handleCloseModal}><CloseIcon /></button>
                            </div>
                            <div className="modal-body">
                                <input type="text" className="input-field" placeholder="Title" value={formState.title} onChange={(e) => setFormState({...formState, title: e.target.value})} required />
                                <textarea className="input-field" placeholder="Description" value={formState.description} onChange={(e) => setFormState({...formState, description: e.target.value})} rows="3"></textarea>
                                <input type="text" className="input-field" placeholder="Location" value={formState.location} onChange={(e) => setFormState({...formState, location: e.target.value})} />
                                <input type="text" className="input-field" placeholder="Budget" value={formState.budget} onChange={(e) => setFormState({...formState, budget: e.target.value})} />
                            </div>
                            <div className="modal-footer">
                                {selectedIdeaId && (<button type="button" className="button delete-idea-button" onClick={() => handleDeleteIdea(selectedIdeaId)}>Delete</button>)}
                                <button type="submit" className="button save-idea-button" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default DateIdeas;