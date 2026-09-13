import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMovies } from '../hooks/useMovies';
import { LoadingSpinner } from './LoadingSpinner';
import './MovieWatchList.css';

// --- ICONS ---
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
  </svg>
);

const CancelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
  </svg>
);

// Enhanced Movie Item Component with lightweight transitions
const MovieItem = React.memo(({ movie, isEditing, onToggle, onDelete, onEdit, onSave, onCancel }) => {
  const [editedTitle, setEditedTitle] = useState(movie.title);

  const handleSave = () => {
    if (editedTitle.trim()) {
      onSave(movie.id, editedTitle.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
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
            placeholder="Enter movie title..."
          />
          <div className="edit-actions">
            <button
              className="button-icon save-button"
              onClick={handleSave}
              aria-label="Save changes"
            >
              <SaveIcon />
            </button>
            <button
              className="button-icon cancel-button"
              onClick={onCancel}
              aria-label="Cancel editing"
            >
              <CancelIcon />
            </button>
          </div>
        </>
      ) : (
        <>
          <button
            className="watched-toggle-button"
            onClick={() => onToggle(movie.id, movie.watched)}
            aria-label={movie.watched ? 'Mark as unwatched' : 'Mark as watched'}
          >
            {movie.watched ? (
              <span className="checkbox-icon checked"><CheckIcon /></span>
            ) : (
              <span className="checkbox-icon" />
            )}
          </button>
          <span className="movie-title-text" onClick={() => onEdit(movie.id)}>
            {movie.title}
          </span>
          <div className="movie-item-actions">
            <button
              className="button-icon edit-button"
              onClick={() => onEdit(movie.id)}
              aria-label="Edit title"
            >
              <PencilIcon />
            </button>
            <button
              className="button-icon delete-button"
              onClick={() => onDelete(movie)}
              aria-label="Delete movie"
            >
              <TrashIcon />
            </button>
          </div>
        </>
      )}
    </li>
  );
});

function MovieWatchList() {
  const { user } = useAuth();
  const {
    movies,
    loading,
    error,
    addMovie,
    updateMovie,
    toggleWatched,
    deleteMovie
  } = useMovies();

  const [newMovieTitle, setNewMovieTitle] = useState('');
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);

  const unwatchedMovies = useMemo(() => movies.filter(m => !m.watched), [movies]);
  const watchedMovies = useMemo(() => movies.filter(m => m.watched), [movies]);

  const handleAddMovie = async (e) => {
    e.preventDefault();
    if (!newMovieTitle.trim() || isAdding) return;

    setIsAdding(true);
    try {
      await addMovie(newMovieTitle.trim());
      setNewMovieTitle('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateMovie = async (id, newTitle) => {
    try {
      await updateMovie(id, newTitle);
      setEditingMovieId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleWatched = async (id, currentStatus) => {
    try {
      await toggleWatched(id, currentStatus);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRequest = (movie) => {
    setMovieToDelete(movie);
  };

  const handleConfirmDelete = async () => {
    if (!movieToDelete) return;
    try {
      await deleteMovie(movieToDelete.id);
      setMovieToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const isListCompletelyEmpty = !loading && movies.length === 0;

  const renderMovieList = (list) => (
    <ul className="movie-list">
      {list.map((movie) => (
        <MovieItem
          key={movie.id}
          movie={movie}
          isEditing={editingMovieId === movie.id}
          onToggle={handleToggleWatched}
          onDelete={handleDeleteRequest}
          onEdit={setEditingMovieId}
          onSave={handleUpdateMovie}
          onCancel={() => setEditingMovieId(null)}
        />
      ))}
    </ul>
  );

  return (
    <>
      <div className="page-container movie-page">
        {/* Universal Header */}
        <header className="tracker-header">
          <Link to="/dashboard" className="back-button" title="Back to Dashboard">
            <BackIcon />
          </Link>
          <div className="header-title-container">
            <h1 className="header-title">Shared Watchlist</h1>
            <span className="header-subtitle">Movies to watch together</span>
          </div>
          <div className="header-right-actions">
            <span className="badge-movie-count">{unwatchedMovies.length} left</span>
          </div>
        </header>

        {user ? (
          <>
            {/* Add Movie Form */}
            <form onSubmit={handleAddMovie} className="add-movie-form">
              <input
                type="text"
                className="add-movie-input"
                value={newMovieTitle}
                onChange={(e) => setNewMovieTitle(e.target.value)}
                placeholder="Add a movie title..."
                autoComplete="off"
              />
              <button
                type="submit"
                className="add-movie-button"
                disabled={!newMovieTitle.trim() || isAdding}
                aria-label="Add movie"
              >
                {isAdding ? <div className="mini-btn-spinner" /> : <PlusIcon />}
              </button>
            </form>

            {/* Movie Lists Container */}
            <div className="movie-list-container">
              {loading ? (
                <LoadingSpinner text="Loading Watchlist..." />
              ) : error ? (
                <div className="centered-feedback error-text">{error}</div>
              ) : (
                <>
                  {isListCompletelyEmpty ? (
                    <div className="empty-state-container">
                      <p>Your watchlist is a blank canvas.</p>
                      <span>Add a movie above to begin your journey.</span>
                    </div>
                  ) : (
                    <>
                      {unwatchedMovies.length > 0 && (
                        <div className="list-section">
                          <h2 className="list-section-title">
                            To Watch
                            <span className="count-badge">{unwatchedMovies.length}</span>
                          </h2>
                          {renderMovieList(unwatchedMovies)}
                        </div>
                      )}

                      {watchedMovies.length > 0 && (
                        <div className="list-section">
                          <h2 className="list-section-title">
                            Watched
                            <span className="count-badge">{watchedMovies.length}</span>
                          </h2>
                          {renderMovieList(watchedMovies)}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <div className="centered-feedback">
            Please log in to manage your movie watchlist.
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {movieToDelete && (
        <div className="modal-overlay" onClick={() => setMovieToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Delete Movie?</h3>
            <p className="modal-message">
              Are you sure you want to remove <strong>"{movieToDelete.title}"</strong> from your watchlist?
            </p>
            <div className="modal-actions">
              <button
                className="button button-secondary"
                onClick={() => setMovieToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="button button-danger"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MovieWatchList;