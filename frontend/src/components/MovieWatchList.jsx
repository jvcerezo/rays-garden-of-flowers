// src/components/MovieWatchList.js

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMovies } from '../hooks/useMovies';
import './MovieWatchList.css';
import { ReactComponent as FlowerSvg } from '../assets/movie-watch-list.svg';

// --- ICONS ---
const BackIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg> );
const CheckIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" /></svg> );
const TrashIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg> );
const SpinnerIcon = () => ( <svg className="spinner" viewBox="0 0 50 50"><circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle></svg> );
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg> );
const PencilIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg> );
const SaveIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" /></svg> );
const CancelIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg> );

// --- Child Components ---
const MovieItem = React.memo(({ movie, isEditing, onToggle, onDelete, onEdit, onSave, onCancel }) => {
  const [editedTitle, setEditedTitle] = useState(movie.title);

  const handleSave = () => {
    if (editedTitle.trim()) {
      onSave(movie.id, editedTitle.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  useEffect(() => {
    if (!isEditing) {
      setEditedTitle(movie.title);
    }
  }, [isEditing, movie.title]);

  return (
    <li className={`movie-item ${movie.watched ? 'watched' : ''} ${isEditing ? 'editing' : ''}`}>
      {isEditing ? (
        <>
          <input
            type="text"
            className="edit-input"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div className="edit-actions">
            <button className="button-icon save-button" onClick={handleSave}><SaveIcon /></button>
            <button className="button-icon cancel-button" onClick={onCancel}><CancelIcon /></button>
          </div>
        </>
      ) : (
        <>
          <button className="watched-toggle-button" onClick={() => onToggle(movie.id, movie.watched)}>
            <CheckIcon />
          </button>
          <div className="movie-details">
            <span className="movie-title">{movie.title}</span>
            {movie.addedBy && <span className="movie-adder">Added by {movie.addedBy}</span>}
          </div>
          <div className="item-actions">
            <button className="button-icon edit-button" onClick={() => onEdit(movie.id)}><PencilIcon /></button>
            <button className="button-icon delete-button" onClick={() => onDelete(movie)}><TrashIcon /></button>
          </div>
        </>
      )}
    </li>
  );
});

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => { if (!isOpen) return null; return ( <div className="modal-overlay" onClick={onClose}> <div className="modal-content" onClick={(e) => e.stopPropagation()}> <h2>{title}</h2> <p>{children}</p> <div className="modal-actions"> <button className="button secondary-button" onClick={onClose}>Cancel</button> <button className="button danger-button" onClick={onConfirm}>Confirm</button> </div> </div> </div> ); };
const Toast = ({ message, type, onDismiss }) => { useEffect(() => { const timer = setTimeout(() => { onDismiss(); }, 4000); return () => clearTimeout(timer); }, [onDismiss]); return ( <div className={`toast toast-${type}`}> {message} </div> ); };

function MovieWatchList() {
  const { user } = useAuth();
  const { movies, loading, error, addMovie, toggleWatched, deleteMovie, updateMovieTitle } = useMovies();
  const [newMovieTitle, setNewMovieTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const [editingMovieId, setEditingMovieId] = useState(null);

  const addToast = (message, type = 'success') => { const id = Date.now(); setToasts(prev => [...prev, { id, message, type }]); };
  const handleAddMovie = async (e) => { e.preventDefault(); if (newMovieTitle.trim() === '' || isAdding) return; setIsAdding(true); try { await addMovie(newMovieTitle); setNewMovieTitle(''); addToast('Movie added successfully!'); } catch (err) { addToast(err.message || 'Failed to add movie.', 'error'); } finally { setIsAdding(false); } };
  const handleToggleWatched = async (id, currentStatus) => { try { await toggleWatched(id, currentStatus); } catch (err) { addToast(err.message, 'error'); } };
  const handleDeleteRequest = (movie) => { setMovieToDelete(movie); setIsModalOpen(true); };
  const handleConfirmDelete = async () => { if (!movieToDelete) return; try { await deleteMovie(movieToDelete.id); addToast('Movie deleted.'); } catch(err) { addToast(err.message, 'error'); } finally { setIsModalOpen(false); setMovieToDelete(null); } };
  const handleUpdateMovie = async (id, newTitle) => { if (editingMovieId !== id) return; try { await updateMovieTitle(id, newTitle); addToast('Movie updated!'); } catch (err) { addToast(err.message, 'error'); } finally { setEditingMovieId(null); } };

  const toWatchMovies = useMemo(() => movies.filter(m => !m.watched), [movies]);
  const watchedMovies = useMemo(() => movies.filter(m => m.watched), [movies]);
  const isListCompletelyEmpty = !loading && movies.length === 0;

  const renderMovieList = (list) => ( <ul className="movie-list"> {list.map((movie) => ( <MovieItem key={movie.id} movie={movie} isEditing={editingMovieId === movie.id} onToggle={handleToggleWatched} onDelete={handleDeleteRequest} onEdit={setEditingMovieId} onSave={handleUpdateMovie} onCancel={() => setEditingMovieId(null)} /> ))} </ul> );

  return (
    <>
      <div className="page-container movie-page-container">
        <div className="card movie-list-card">
          <div className="movie-list-header">
            <Link to="/dashboard" className="back-button"><BackIcon /></Link>
            <div className="header-title-container">
              <FlowerSvg className="header-icon" />
              <h1 className="header-title">Shared Watchlist</h1>
            </div>
            <div className="header-spacer"></div>
          </div>
          {user ? (
            <>
              <form onSubmit={handleAddMovie} className="add-movie-form">
                <input type="text" className="input-field add-movie-input" value={newMovieTitle} onChange={(e) => setNewMovieTitle(e.target.value)} placeholder="e.g., The Matrix" />
                <button type="submit" className="button add-movie-button" disabled={!newMovieTitle.trim() || isAdding}>
                  {isAdding ? <SpinnerIcon /> : <PlusIcon />}
                </button>
              </form>
              <div className="movie-list-container">
                {loading ? ( <div className="centered-feedback"><SpinnerIcon /></div> ) : error ? ( <div className="centered-feedback error-text">{error}</div> ) : (
                  <>
                    {isListCompletelyEmpty ? (
                      <div className="empty-state-container">
                        <p>Your watchlist is a blank canvas.</p>
                        <span>Add a movie to begin.</span>
                      </div>
                    ) : (
                      <>
                        <div className="list-section">
                           <div className="list-section-header"><h3>To Watch</h3><span className="movie-count-badge">{toWatchMovies.length}</span></div>
                           {toWatchMovies.length > 0 ? renderMovieList(toWatchMovies) : <p className="empty-list-message">No movies to watch.</p>}
                        </div>
                        <div className="list-section">
                           <div className="list-section-header"><h3>Watched</h3><span className="movie-count-badge">{watchedMovies.length}</span></div>
                           {watchedMovies.length > 0 ? renderMovieList(watchedMovies) : <p className="empty-list-message">Mark a movie as watched.</p>}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </>
          ) : ( <p className="centered-feedback">Please <Link to="/login">log in</Link> to use the watchlist.</p> )}
        </div>
      </div>
      <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmDelete} title="Delete Movie?"> Are you sure you want to permanently delete <strong>{movieToDelete?.title}</strong>? This action cannot be undone. </ConfirmationModal>
      <div className="toast-container"> {toasts.map(toast => ( <Toast key={toast.id} {...toast} onDismiss={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} /> ))} </div>
    </>
  );
}
export default MovieWatchList;