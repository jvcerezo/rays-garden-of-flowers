import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './HashPage.css'; // We will create this CSS file next

// A simple lock icon for the title
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="24" height="24">
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
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
        // Clear error and message when user starts typing again
        if (error) setError('');
        if (isUnlocked) setIsUnlocked(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Check the input against the correct hash (case-insensitive and trimmed)
        if (input.trim().toLowerCase() === correctHash) {
            setIsUnlocked(true);
            setError('');
        } else {
            setIsUnlocked(false);
            setError('Incorrect code. Please try again.');
        }
    };

    return (
        <div className="page-container hash-page-container">
            <motion.div 
                className="hash-card"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="hash-card-header">
                    <LockIcon />
                    <h1>Enter The Secret Code</h1>
                </div>
                
                <form className="hash-form" onSubmit={handleSubmit}>
                    <input 
                        type="text"
                        className="hash-input"
                        placeholder="Enter hash code here..."
                        value={input}
                        onChange={handleInputChange}
                    />
                    <button type="submit" className="hash-button">
                        Unlock Message
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
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                        >
                            <h2>Happy 1st Anniversary</h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

export default HashPage;
