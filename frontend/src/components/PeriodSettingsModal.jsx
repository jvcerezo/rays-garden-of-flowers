import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export const PeriodSettingsModal = ({ currentSettings, onClose, onReset }) => {
    const [settings, setSettings] = useState(currentSettings);

    const handleSave = async (e) => {
        e.preventDefault();
        const settingsRef = doc(db, 'periodTracker', 'shared');
        const promise = setDoc(settingsRef, settings, { merge: true });
        
        toast.promise(promise, { loading: 'Saving settings...', success: <b>Settings saved!</b>, error: <b>Could not save settings.</b> });
        onClose();
    };

    return (
        <div className="reminders-modal-backdrop" onClick={onClose}>
            <motion.div
                className="reminders-modal-content"
                initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 35, stiffness: 400 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-handle-bar" />
                <h2 className="modal-title">Cycle Settings</h2>
                <form className="new-reminder-form" onSubmit={handleSave}>
                    <div className="form-group">
                        <label htmlFor="cycleLength">Average Cycle Length (days)</label>
                        <input id="cycleLength" type="number" value={settings.cycleLength} onChange={(e) => setSettings({...settings, cycleLength: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="periodLength">Average Period Length (days)</label>
                        <input id="periodLength" type="number" value={settings.periodLength} onChange={(e) => setSettings({...settings, periodLength: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="button primary">Save Changes</button>
                    </div>
                </form>

                <div className="danger-zone">
                    <h3 className="danger-zone-title">Danger Zone</h3>
                    <p>This will permanently delete all your logged cycles and reset your settings.</p>
                    <button type="button" className="button danger" onClick={onReset}>
                        Reset All Data
                    </button>
                </div>
            </motion.div>
        </div>
    );
};