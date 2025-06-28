import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns';

// --- Icon Components for this file ---
const TrashIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg> );
const ChevronDownIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>);


const ReminderItem = ({ reminder, onDelete }) => {
    const isPastItem = isPast(reminder.scheduledAt) && !isToday(reminder.scheduledAt);

    const formatRelativeTime = (date) => {
        if (isToday(date)) return `at ${format(date, 'h:mm a')}`;
        if (isTomorrow(date)) return `Tomorrow at ${format(date, 'h:mm a')}`;
        return format(date, "MMM d 'at' h:mm a");
    };

    const timeText = isPastItem
        ? format(reminder.scheduledAt, "MMM d, yyyy")
        : formatRelativeTime(reminder.scheduledAt);
    
    const distanceText = !isPastItem && !isToday(reminder.scheduledAt) ? formatDistanceToNow(reminder.scheduledAt, { addSuffix: true }) : null;

    return (
        <motion.div
            className={`reminder-item ${isPastItem ? 'past' : ''} ${isToday(reminder.scheduledAt) ? 'today' : ''}`}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className="reminder-accent-bar" />
            <div className="reminder-info">
                <h4>{reminder.title}</h4>
                <p>{timeText}</p>
                {distanceText && <p className="due-soon">{distanceText}</p>}
            </div>
            <button className="delete-button" onClick={() => onDelete(reminder.id, reminder.title)}><TrashIcon /></button>
        </motion.div>
    );
};

const CollapsibleSection = ({ title, reminders, onDelete, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    if (reminders.length === 0) return null;

    return (
        <div className="list-section">
            <button className="section-header" onClick={() => setIsOpen(!isOpen)}>
                <h3>{title}</h3>
                <motion.div animate={{ rotate: isOpen ? 0 : -90 }}><ChevronDownIcon /></motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className="section-content">
                            {reminders.map(reminder => (
                                <ReminderItem key={reminder.id} reminder={reminder} onDelete={onDelete} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


export const ReminderList = ({ today, upcoming, past, onDelete }) => {
    return (
        <motion.div 
            className="reminders-list-container"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.07 }
                }
            }}
            initial="hidden"
            animate="visible"
        >
            {today.length > 0 && (
                <div className="list-section">
                    <div className="section-header static"><h3>Today</h3></div>
                    <div className="section-content">
                        {today.map(reminder => (
                            <ReminderItem key={reminder.id} reminder={reminder} onDelete={onDelete} />
                        ))}
                    </div>
                </div>
            )}
            <CollapsibleSection title="Upcoming" reminders={upcoming} onDelete={onDelete} defaultOpen={true} />
            <CollapsibleSection title="Past" reminders={past} onDelete={onDelete} />
        </motion.div>
    );
};