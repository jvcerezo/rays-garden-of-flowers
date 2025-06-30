import React from 'react';
import { motion } from 'framer-motion';

const GoldIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" /></svg>);

export const ViewTaskModal = ({ task, onClose }) => {
    if (!task) return null;

    // Determine the correct text based on the task's completion status
    const rewardsTitle = task.isDone ? "Rewards Earned" : "Rewards you can earn!";

    return (
        <div className="reminders-modal-backdrop" onClick={onClose}>
            <motion.div
                className="reminders-modal-content"
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 35, stiffness: 400 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-handle-bar" />
                <h2 className="modal-title">{task.title}</h2>
                <div className="view-task-content">
                    <p className="task-description-preserved">{task.description}</p>
                    
                    {/* Check if there are any rewards to display the section */}
                    {(task.rewards?.gold > 0 || task.rewards?.exp > 0) && (
                        <div className="task-rewards-modal">
                            {/* Use the conditional title here */}
                            <h4>{rewardsTitle}</h4>
                            <div className="rewards-list">
                                {task.rewards?.gold > 0 && <span className="reward-gold"><GoldIcon />{task.rewards.gold}</span>}
                                {task.rewards?.exp > 0 && <span className="reward-exp">+{task.rewards.exp} EXP</span>}
                            </div>
                        </div>
                    )}
                </div>
                 <div className="modal-footer">
                    <button type="button" className="button primary full-width" onClick={onClose}>Close</button>
                </div>
            </motion.div>
        </div>
    );
};
