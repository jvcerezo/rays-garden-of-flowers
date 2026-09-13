import React, { useState } from 'react';
import './HashPage.css';

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="24" height="24">
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
);

function HashPage() {
    const [input, setInput] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [error, setError] = useState('');

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
        } else {
            setIsUnlocked(false);
            setError('Incorrect code. Please try again.');
        }
    };

    return (
        <div className="page-container hash-page-container">
            <div className="hash-card">
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

                {error && (
                    <p className="hash-error">
                        {error}
                    </p>
                )}

                {isUnlocked && (
                    <div className="hash-success">
                        <h2>Happy 1st Anniversary</h2>
                        <p>Here's to many more years of love and happiness!</p>
                        <p>The password is: YouWillNeverGuessThis</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HashPage;
