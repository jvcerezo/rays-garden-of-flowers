import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import {
  collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy, serverTimestamp
} from 'firebase/firestore';
import './MovieWatchList.css';

const BackIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg> );
const CheckIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" /></svg> );
const TrashIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg> );
const MoviePageIcon = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h15a3 3 0 003-3v-9a3 3 0 00-3-3h-15z" /><path fillRule="evenodd" d="M2 12.5a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm3.5 0a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm3.5 0a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm3.5 0a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zM2 15.5a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm3.5 0a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm3.5 0a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm3.5 0a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zM2 8.5a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm3.5 0a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm3.5 0a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm3.5 0a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5z" clipRule="evenodd" /></svg> );
const SpinnerIcon = () => ( <svg className="spinner" viewBox="0 0 50 50"><circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle></svg> );
const ConfirmIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" /></svg> );

function MovieWatchList() {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [newMovie, setNewMovie] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const moviesCollectionRef = useCallback(() => user ? collection(db, 'users', user.uid, 'movies') : null, [user]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const q = query(moviesCollectionRef(), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMovies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      setError('Failed to fetch movies.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, moviesCollectionRef]);
  
  // --- LOGIC IMPROVEMENTS ---
  const handleAddMovie = async (e) => {
    e.preventDefault();
    if (newMovie.trim() === '' || isAdding) return;
    setIsAdding(true);
    setError(null);
    try {
      await addDoc(moviesCollectionRef(), { title: newMovie, watched: false, createdAt: serverTimestamp() });
      setNewMovie('');
    } catch (err) { 
      setError('Failed to add movie.'); 
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWatched = async (id, currentStatus) => {
    const movieDocRef = doc(db, 'users', user.uid, 'movies', id);
    try { await updateDoc(movieDocRef, { watched: !currentStatus }); } 
    catch (err) { setError('Failed to update status.'); }
  };

  const handleDeleteMovie = async (id) => {
    setPendingDelete(null); // Hide confirmation button immediately
    const movieDocRef = doc(db, 'users', user.uid, 'movies', id);
    try { await deleteDoc(movieDocRef); }
    catch (err) { setError('Failed to delete movie.'); }
  };

  // --- DERIVED STATE FOR UI ORGANIZATION ---
  const toWatchMovies = useMemo(() => movies.filter(m => !m.watched), [movies]);
  const watchedMovies = useMemo(() => movies.filter(m => m.watched), [movies]);

  // --- RENDER LOGIC ---
  const renderMovieList = (list, type) => (
    <ul className="movie-list">
      {list.map((movie) => (
        <li key={movie.id} className={`movie-item ${movie.watched ? 'watched' : ''} ${pendingDelete === movie.id ? 'pending-delete' : ''}`}>
          <button className="watched-toggle-button" onClick={() => handleToggleWatched(movie.id, movie.watched)}>
            <CheckIcon />
          </button>
          <span className="movie-title">{movie.title}</span>
          {pendingDelete === movie.id ? (
            <button className="confirm-delete-button" onClick={() => handleDeleteMovie(movie.id)}><ConfirmIcon/></button>
          ) : (
            <button className="delete-button" onClick={() => setPendingDelete(movie.id)}><TrashIcon/></button>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="page-container movie-page-container">
      <div className="card movie-list-card">
        <div className="movie-list-header">
          <Link to="/dashboard" className="back-button"><BackIcon /></Link>
          <div className="header-text-container"><h1 className="header-title">Movie Watch List</h1></div>
          <div className="header-spacer"></div>
        </div>

        {error && <p className="error-message" onClick={() => setError(null)}>{error}</p>}

        <form onSubmit={handleAddMovie} className="add-movie-form">
          <input type="text" className="input-field add-movie-input" value={newMovie} onChange={(e) => setNewMovie(e.target.value)} placeholder="Add a new movie title..." />
          <button type="submit" className="button add-movie-button" disabled={!newMovie.trim() || isAdding}>
            {isAdding ? <SpinnerIcon/> : 'Add'}
          </button>
        </form>

        <div className="movie-list-container">
          {loading ? (<p className="loading-text">Loading your list...</p>) : (
            <>
              <div className="list-section">
                <div className="list-section-header">
                  <h3>To Watch</h3>
                  <span className="movie-count-badge">{toWatchMovies.length}</span>
                </div>
                {toWatchMovies.length > 0 ? renderMovieList(toWatchMovies) : (
                  <p className="empty-list-message">Add a movie to get started!</p>
                )}
              </div>

              <div className="list-section">
                <div className="list-section-header">
                  <h3>Watched</h3>
                  <span className="movie-count-badge">{watchedMovies.length}</span>
                </div>
                {watchedMovies.length > 0 ? renderMovieList(watchedMovies) : (
                    toWatchMovies.length > 0 ? (
                        <p className="empty-list-message">Mark a movie as watched to see it here.</p>
                    ) : (
                        <p className="empty-list-message">Your list is empty.</p>
                    )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieWatchList;