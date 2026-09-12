import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import './HashPage.css';

// A simple lock icon for the title
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="28" height="28">
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
);

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
        <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
    </svg>
);

function HashPage() {
    const [input, setInput] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [error, setError] = useState('');

    // The secret hash code
    const correctHash = 'f7bc64045c2688f7f8e8067bfd3320e1';

    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (error) setError('');
        if (isUnlocked) setIsUnlocked(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (input.trim().toLowerCase() === correctHash) {
            setIsUnlocked(true);
            setError('');
            toast.success('Anniversary vault unlocked! 💖');
        } else {
            setIsUnlocked(false);
            setError('Incorrect code. Please try again.');
        }
    };

    const handleCopyPassword = () => {
        navigator.clipboard.writeText('YouWillNeverGuessThis');
        toast.success('Password copied to clipboard! 📋');
    };

    return (
        <div className="page-container hash-page-container">
            <header className="tracker-header hash-header">
                <Link to="/login" className="back-button" title="Back to Login">
                    <BackIcon />
                </Link>
                <div className="header-title-container">
                    <h1 className="header-title">Secret Portal</h1>
                    <span className="header-subtitle">Anniversary Vault 🗝️</span>
                </div>
                <div style={{ width: '38px' }} />
            </header>

            <motion.div 
                className="hash-card"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="hash-card-header">
                    <div className="lock-icon-wrap">
                        <LockIcon />
                    </div>
                    <h2>Enter Secret Key</h2>
                    <p className="hash-hint">Provide the special key to unlock your note</p>
                </div>
                
                <form className="hash-form" onSubmit={handleSubmit}>
                    <input 
                        type="text"
                        className="hash-input"
                        placeholder="Enter hash code here..."
                        value={input}
                        onChange={handleInputChange}
                        autoFocus
                    />
                    <button type="submit" className="hash-button">
                        Unlock Message ✨
                    </button>
                </form>

                <AnimatePresence>
                    {error && (
                        <motion.p 
                            className="hash-error"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isUnlocked && (
                        <motion.div 
                            className="hash-success"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                        >
                            <span className="anniversary-badge">🎉 Happy 1st Anniversary!</span>
                            <h3>Here is to forever together!</h3>
                            <p>Here's to many more years of endless love, growth, and happiness.</p>
                            <div className="password-reveal-box">
                                <span className="password-label">Special Password:</span>
                                <code className="revealed-code">YouWillNeverGuessThis</code>
                                <button 
                                    type="button" 
                                    className="copy-password-button" 
                                    onClick={handleCopyPassword}
                                >
                                    Copy Password 📋
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

export default HashPage;
