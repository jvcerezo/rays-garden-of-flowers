// src/hooks/useMovies.js

import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/firebase';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const moviesCollectionRef = collection(db, 'movies');

export const useMovies = () => {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setMovies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(moviesCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedMovies = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMovies(fetchedMovies);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore snapshot error:", err);
        setError('Failed to connect to the movie list.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addMovie = useCallback(async (title) => {
    if (!user) throw new Error("Authentication required.");
    const newMovie = {
      title,
      watched: false,
      createdAt: serverTimestamp(),
      addedBy: user.displayName || user.email,
      userId: user.uid,
    };
    await addDoc(moviesCollectionRef, newMovie);
  }, [user]);


  const toggleWatched = useCallback(async (id, currentStatus) => {
    // Optimistic UI Update
    const originalMovies = [...movies];
    const updatedMovies = movies.map(m => m.id === id ? { ...m, watched: !currentStatus } : m);
    setMovies(updatedMovies);

    try {
      const movieDocRef = doc(db, 'movies', id);
      await updateDoc(movieDocRef, { watched: !currentStatus });
    } catch (err) {
      // Revert on Failure
      setMovies(originalMovies);
      console.error("Failed to update status:", err);
      throw new Error("Failed to update movie status.");
    }
  }, [movies]);

  const deleteMovie = useCallback(async (id) => {
    // Optimistic UI Update
    const originalMovies = [...movies];
    const updatedMovies = movies.filter(m => m.id !== id);
    setMovies(updatedMovies);

    try {
      const movieDocRef = doc(db, 'movies', id);
      await deleteDoc(movieDocRef);
    } catch (err) {
       // Revert on Failure
      setMovies(originalMovies);
      console.error("Failed to delete movie:", err);
      throw new Error("Failed to delete movie.");
    }
  }, [movies]);

  const updateMovieTitle = useCallback(async (id, newTitle) => {
    try {
      const movieDocRef = doc(db, 'movies', id);
      await updateDoc(movieDocRef, { title: newTitle });
    } catch (err) {
      console.error("Failed to update title:", err);
      throw new Error("Failed to update movie title.");
    }
  }, []);

  return { 
    movies, 
    loading, 
    error, 
    addMovie, 
    toggleWatched, 
    deleteMovie, 
    updateMovieTitle 
  };
};