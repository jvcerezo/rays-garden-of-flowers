// src/hooks/useGoals.js

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
  increment, // <-- Import Firestore's increment operator
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const goalsCollectionRef = collection(db, 'goals');

export const useGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(goalsCollectionRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedGoals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedGoals.sort((a, b) => a.isComplete - b.isComplete);
      setGoals(fetchedGoals);
      setLoading(false);
    }, (err) => {
      console.error("Firestore snapshot error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addGoal = useCallback(async (goalData) => {
    if (!user) throw new Error("Authentication required.");
    const newGoal = {
      ...goalData,
      currentAmount: 0,
      isComplete: false,
      createdAt: serverTimestamp(),
      addedBy: user.displayName || user.email,
      userId: user.uid,
    };
    await addDoc(goalsCollectionRef, newGoal);
  }, [user]);

  const updateGoal = useCallback(async (id, updatedData) => {
    const goalDocRef = doc(db, 'goals', id);
    await updateDoc(goalDocRef, updatedData);
  }, []);

  const addProgress = useCallback(async (id, amountToAdd) => {
    const goalDocRef = doc(db, 'goals', id);
    // Use Firestore's increment for safe, atomic updates
    await updateDoc(goalDocRef, {
        currentAmount: increment(amountToAdd)
    });
  }, []);

  const toggleComplete = useCallback(async (id, currentStatus) => {
    await updateGoal(id, { isComplete: !currentStatus });
  }, [updateGoal]);

  const deleteGoal = useCallback(async (id) => {
    const goalDocRef = doc(db, 'goals', id);
    await deleteDoc(goalDocRef);
  }, []);

  return { goals, loading, addGoal, updateGoal, addProgress, toggleComplete, deleteGoal };
};