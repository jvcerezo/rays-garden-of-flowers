import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export const PeriodSettingsModal = ({ currentSettings, stats, onClose, onReset, onOpenHistory }) => {
    const [settings, setSettings] = useState({
        cycleLength: currentSettings.cycleLength || 28,
        periodLength: currentSettings.periodLength || 5,
        useSmartPredictions: currentSettings.useSmartPredictions !== false
    });

    const handleSave = async (e) => {
        e.preventDefault();
        const settingsRef = doc(db, 'periodTracker', 'shared');
        const promise = setDoc(settingsRef, settings, { merge: true });
        
        toast.promise(promise, {
            loading: 'Saving cycle settings...',
            success: <b>Settings updated successfully!</b>,
            error: <b>Could not save settings.</b>
        });
        onClose();
    };

    return (
        <div className="reminders-modal-backdrop" onClick={onClose}>
            <motion.div
                className="reminders-modal-content period-settings-sheet"
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 32, stiffness: 350 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-handle-bar" />
                <div className="modal-header-row">
                    <h2 className="modal-title">Cycle Settings</h2>
                    <button type="button" className="close-sheet-btn" onClick={onClose}>✕</button>
                </div>

                {/* Smart Prediction Toggle Card */}
                <div className="smart-prediction-card">
                    <div className="smart-card-info">
                        <div className="smart-card-title-row">
                            <span className="sparkle-icon">✨</span>
                            <h4>Smart Predictions</h4>
                        </div>
                        <p>
                            Automatically calculate cycle & period lengths using your actual logged history.
                        </p>
                        {stats && (
                            <div className="smart-history-pill">
                                <span>Detected: <strong>{stats.avgCycleLength}d</strong> cycle • <strong>{stats.avgPeriodLength}d</strong> period ({stats.totalCycles} logs)</span>
                            </div>
                        )}
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={settings.useSmartPredictions}
                            onChange={(e) => setSettings({ ...settings, useSmartPredictions: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <form className="new-reminder-form" onSubmit={handleSave}>
                    <div className="form-group">
                        <label htmlFor="cycleLength">
                            {settings.useSmartPredictions ? 'Fallback / Baseline Cycle Length (days)' : 'Cycle Length (days)'}
                        </label>
                        <input
                            id="cycleLength"
                            type="number"
                            min="15"
                            max="60"
                            value={settings.cycleLength}
                            onChange={(e) => setSettings({ ...settings, cycleLength: parseInt(e.target.value, 10) || 28 })}
                        />
                        <span className="input-hint">Typical range is 24 to 35 days.</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="periodLength">
                            {settings.useSmartPredictions ? 'Fallback / Baseline Period Length (days)' : 'Period Length (days)'}
                        </label>
                        <input
                            id="periodLength"
                            type="number"
                            min="2"
                            max="14"
                            value={settings.periodLength}
                            onChange={(e) => setSettings({ ...settings, periodLength: parseInt(e.target.value, 10) || 5 })}
                        />
                        <span className="input-hint">Typical period lasts 3 to 7 days.</span>
                    </div>

                    <div className="quick-action-row">
                        <button
                            type="button"
                            className="button secondary outline"
                            onClick={() => {
                                onClose();
                                if (onOpenHistory) onOpenHistory();
                            }}
                        >
                            📋 View & Edit Past Cycles
                        </button>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="button primary">Save Settings</button>
                    </div>
                </form>

                <div className="danger-zone">
                    <h3 className="danger-zone-title">Danger Zone</h3>
                    <p>Permanently erase all logged cycle history and reset back to defaults.</p>
                    <button type="button" className="button danger" onClick={onReset}>
                        Reset All Data
                    </button>
                </div>
            </motion.div>
        </div>
    );
};