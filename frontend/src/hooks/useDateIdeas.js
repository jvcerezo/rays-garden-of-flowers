// src/hooks/useDateIdeas.js

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

// NEW: Point to a top-level collection for shared data
const dateIdeasCollectionRef = collection(db, 'dateIdeas');

export const useDateIdeas = () => {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setIdeas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(dateIdeasCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedIdeas = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort client-side to keep finished items at the bottom
        fetchedIdeas.sort((a, b) => a.finished - b.finished);
        setIdeas(fetchedIdeas);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore snapshot error:", err);
        setError('Failed to connect to the date ideas list.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addIdea = useCallback(async (ideaData) => {
    if (!user) throw new Error("Authentication required.");
    const newIdea = {
      ...ideaData,
      finished: false,
      createdAt: serverTimestamp(),
      addedBy: user.displayName || user.email,
      userId: user.uid,
    };
    await addDoc(dateIdeasCollectionRef, newIdea);
  }, [user]);

  const updateIdea = useCallback(async (id, updatedData) => {
    try {
      const ideaDocRef = doc(db, 'dateIdeas', id);
      await updateDoc(ideaDocRef, updatedData);
    } catch (err) {
      console.error("Failed to update idea:", err);
      throw new Error("Failed to update date idea.");
    }
  }, []);

  const toggleFinished = useCallback(async (id, currentStatus) => {
    const originalIdeas = [...ideas];
    const optimisticIdeas = ideas.map(idea => idea.id === id ? { ...idea, finished: !currentStatus } : idea);
    optimisticIdeas.sort((a, b) => a.finished - b.finished);
    setIdeas(optimisticIdeas);

    try {
      await updateIdea(id, { finished: !currentStatus });
    } catch (err) {
      setIdeas(originalIdeas);
      console.error("Failed to update status:", err);
      throw new Error("Failed to update status.");
    }
  }, [ideas, updateIdea]);

  const deleteIdea = useCallback(async (id) => {
    const originalIdeas = [...ideas];
    const updatedIdeas = ideas.filter(m => m.id !== id);
    setIdeas(updatedIdeas);

    try {
      const ideaDocRef = doc(db, 'dateIdeas', id);
      await deleteDoc(ideaDocRef);
    } catch (err) {
      setIdeas(originalIdeas);
      console.error("Failed to delete idea:", err);
      throw new Error("Failed to delete idea.");
    }
  }, [ideas]);

  return { ideas, loading, error, addIdea, updateIdea, toggleFinished, deleteIdea };
};