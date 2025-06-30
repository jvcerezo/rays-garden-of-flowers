import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { doc, onSnapshot, collection, query, orderBy, addDoc, updateDoc, increment, writeBatch, getDoc, setDoc } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

import { PlayerStats } from './PlayerStats';
import { TaskList } from './TaskList';
import { AddTaskModal } from './AddTaskModal';
import { ViewTaskModal } from './ViewTaskModal';
import './RayConnect.css';

// --- Icon Components ---
const BackIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg> );
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H5a1 1 0 110-2h6V5a1 1 0 011-1z" /></svg> );

const PLAYER_IDS = {
    rheanamindo: 'rheanamindo',
    jetjetcerezo: 'jetjetcerezo'
};

const DEFAULT_STATS = {
    level: 1,
    gold: 0,
    exp: 0,
    nextLevelExp: 1000,
    maxHp: 100,
    maxMp: 50,
};

function RayConnect() {
    const { user } = useAuth();
    const [viewingPlayer, setViewingPlayer] = useState(PLAYER_IDS.rheanamindo);
    const [playerData, setPlayerData] = useState({ rheanamindo: null, jetjetcerezo: null });
    const [tasks, setTasks] = useState({ rheanamindo: [], jetjetcerezo: [] });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewingTask, setViewingTask] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loggedInPlayerId = useMemo(() => {
        if (!user || !user.email) return null;
        if (user.email === 'rheanamindo@gmail.com') return PLAYER_IDS.rheanamindo;
        if (user.email === 'jetjetcerezo@gmail.com') return PLAYER_IDS.jetjetcerezo;
        return null;
    }, [user]);

    useEffect(() => {
        if (!user) return;
        const initializeSelf = async () => {
            if (!loggedInPlayerId) return;
            const playerRef = doc(db, 'rayConnect', loggedInPlayerId);
            const docSnap = await getDoc(playerRef);
            if (!docSnap.exists()) {
                await setDoc(playerRef, DEFAULT_STATS);
            }
        };
        initializeSelf();

        const unsubRheana = onSnapshot(doc(db, 'rayConnect', PLAYER_IDS.rheanamindo), (doc) => setPlayerData(prev => ({ ...prev, rheanamindo: doc.data() })));
        const unsubJet = onSnapshot(doc(db, 'rayConnect', PLAYER_IDS.jetjetcerezo), (doc) => setPlayerData(prev => ({ ...prev, jetjetcerezo: doc.data() })));
        const qRheana = query(collection(db, 'rayConnect', PLAYER_IDS.rheanamindo, 'tasks'), orderBy('createdAt', 'desc'));
        const unsubTasksRheana = onSnapshot(qRheana, (snapshot) => setTasks(prev => ({ ...prev, rheanamindo: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) })));
        const qJet = query(collection(db, 'rayConnect', PLAYER_IDS.jetjetcerezo, 'tasks'), orderBy('createdAt', 'desc'));
        const unsubTasksJet = onSnapshot(qJet, (snapshot) => {
            setTasks(prev => ({ ...prev, jetjetcerezo: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) }));
            setIsLoading(false);
        });

        return () => { unsubRheana(); unsubJet(); unsubTasksRheana(); unsubTasksJet(); };
    }, [user, loggedInPlayerId]);

    const handleAddTask = async (taskData) => {
        if (!loggedInPlayerId || loggedInPlayerId === viewingPlayer) return;
        const promise = addDoc(collection(db, 'rayConnect', viewingPlayer, 'tasks'), {
            ...taskData,
            isDone: false,
            createdAt: new Date(),
        });
        toast.promise(promise, {
            loading: `Assigning quest to ${viewingPlayer === 'rheanamindo' ? 'Ray' : 'Taj'}...`,
            success: <b>Quest assigned!</b>,
            error: <b>Could not assign quest.</b>,
        });
        setIsAddModalOpen(false);
    };

    const handleMarkAsDone = async (taskId, rewards) => {
        if (loggedInPlayerId !== viewingPlayer) return;

        const currentPlayerStats = playerData[viewingPlayer];
        if (!currentPlayerStats) {
            toast.error("Player data is still loading, please wait.");
            return;
        }

        const promise = new Promise(async (resolve, reject) => {
            try {
                const taskRef = doc(db, 'rayConnect', viewingPlayer, 'tasks', taskId);
                const playerRef = doc(db, 'rayConnect', viewingPlayer);

                let { level = 1, exp = 0, nextLevelExp = 1000 } = currentPlayerStats;
                const newExp = exp + (rewards.exp || 0);

                const playerUpdates = {
                    gold: increment(rewards.gold || 0),
                };

                if (newExp >= nextLevelExp) {
                    playerUpdates.level = level + 1;
                    playerUpdates.exp = newExp - nextLevelExp;
                    playerUpdates.nextLevelExp = Math.floor(nextLevelExp * 1.5);
                    toast.success(`LEVEL UP! You are now Level ${playerUpdates.level}!`, { duration: 4000, icon: '🎉' });
                } else {
                    playerUpdates.exp = newExp;
                }

                const batch = writeBatch(db);
                batch.update(taskRef, { isDone: true });
                batch.update(playerRef, playerUpdates);
                
                await batch.commit();
                resolve();
            } catch (error) {
                console.error("Error completing quest:", error);
                reject(error);
            }
        });

        toast.promise(promise, {
            loading: 'Completing quest...',
            success: <b>Quest Complete! Rewards gained!</b>,
            error: <b>Could not complete quest.</b>,
        });
    };
    
    const canAddTask = loggedInPlayerId && loggedInPlayerId !== viewingPlayer;

    return (
        <>
            <div className="page-container ray-connect-page">
                <header className="tracker-header">
                    <Link to="/dashboard" className="back-button"><BackIcon /></Link>
                    <h1 className="header-title">Ray-Connect</h1>
                    <div style={{ width: '40px' }} />
                </header>

                {isLoading ? (
                    <div className="loading-state">Loading Connect...</div>
                ) : (
                    <>
                        <div className="player-switcher">
                            <button className={viewingPlayer === PLAYER_IDS.rheanamindo ? 'active' : ''} onClick={() => setViewingPlayer(PLAYER_IDS.rheanamindo)}>
                                Ray's Quests
                            </button>
                            <button className={viewingPlayer === PLAYER_IDS.jetjetcerezo ? 'active' : ''} onClick={() => setViewingPlayer(PLAYER_IDS.jetjetcerezo)}>
                                Taj's Quests
                            </button>
                        </div>

                        <PlayerStats 
                            data={playerData[viewingPlayer]} 
                            playerName={viewingPlayer === PLAYER_IDS.rheanamindo ? 'Ray' : 'Taj'}
                        />
                        <TaskList 
                            tasks={tasks[viewingPlayer]} 
                            onMarkDone={handleMarkAsDone}
                            canComplete={loggedInPlayerId === viewingPlayer}
                            onViewTask={setViewingTask}
                        />
                    </>
                )}
            </div>

            {canAddTask && (
                 <motion.button className="fab" onClick={() => setIsAddModalOpen(true)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <PlusIcon />
                </motion.button>
            )}

            <AnimatePresence>
                {isAddModalOpen && (
                    <AddTaskModal 
                        onClose={() => setIsAddModalOpen(false)}
                        onAdd={handleAddTask}
                    />
                )}
                {viewingTask && (
                    <ViewTaskModal 
                        task={viewingTask}
                        onClose={() => setViewingTask(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

export default RayConnect;
