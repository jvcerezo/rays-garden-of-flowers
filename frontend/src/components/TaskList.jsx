import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" /></svg>);
const GoldIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" /></svg>);

export const TaskList = ({ tasks, onMarkDone, canComplete, onViewTask }) => {
    const pendingTasks = tasks.filter(t => !t.isDone);
    const completedTasks = tasks.filter(t => t.isDone);

    return (
        <div className="task-list-container">
            <AnimatePresence>
                {pendingTasks.map((task, index) => (
                    <motion.div 
                        key={task.id}
                        className="task-card"
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        {/* Make the main content area clickable to view details */}
                        <div className="task-content-clickable" onClick={() => onViewTask(task)}>
                            <div className="task-content">
                                <h3>{task.title}</h3>
                                <p className="task-description-preserved">{task.description}</p>
                                <div className="task-rewards">
                                    {task.rewards?.gold > 0 && <span className="reward-gold"><GoldIcon />{task.rewards.gold}</span>}
                                    {task.rewards?.exp > 0 && <span className="reward-exp">+{task.rewards.exp} EXP</span>}
                                </div>
                            </div>
                        </div>
                        {canComplete && (
                            <button className="complete-button" onClick={() => onMarkDone(task.id, task.rewards)}>
                                <CheckIcon />
                            </button>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>

            {completedTasks.length > 0 && (
                <div className="completed-tasks-section">
                    <h4>Completed Quests</h4>
                    {completedTasks.map(task => (
                        <motion.div 
                            key={task.id} 
                            className="task-card completed"
                            onClick={() => onViewTask(task)}
                            layout
                        >
                            <div className="task-content">
                                <h3>{task.title}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
