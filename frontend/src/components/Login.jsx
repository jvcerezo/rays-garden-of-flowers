import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase';

import { ReactComponent as TitleFlowerIcon } from '../assets/login-title.svg';
import { ReactComponent as EmailFlowerIcon } from '../assets/login-username.svg';
import { ReactComponent as PasswordFlowerIcon } from '../assets/login-password.svg';

// Simple Eye & EyeOff icons
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
    <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.375l1.091 1.091a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
    <path d="M10.748 13.93l2.523 2.524a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 016.1 5.922l2.39 2.39a4 4 0 004.258 5.618z" />
  </svg>
);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const wrongPasswordCountRef = useRef(0);

  const allowedEmails = [
    'jetjetcerezo@gmail.com',
    'rheanamindo@gmail.com'
  ];

  // Reset the counter if the email changes
  useEffect(() => {
    if (email.toLowerCase().trim() !== 'rheanamindo@gmail.com') {
      wrongPasswordCountRef.current = 0;
    }
  }, [email]);

  // Function to get the correct error message
  const getHintErrorMessage = (count) => {
    switch (count) {
      case 2:
        return 'sure ka ba?';
      case 3:
        return 'alam mo ba yung password?';
      case 4:
        return 'malay mo nasa ibang URL';
      case 5:
        return 'clue: MD5';
      case 6:
        return 'the-url/hash';
      default:
        return 'Invalid email or password.';
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setError('');

    if (!allowedEmails.includes(email.toLowerCase().trim())) {
      setError('This email address is not authorized.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      wrongPasswordCountRef.current = 0;
    } catch (err) {
      if (err.code === 'auth/invalid-credentials' || err.code === 'auth/too-many-requests') {
        if (email.toLowerCase().trim() === 'rheanamindo@gmail.com') {
          wrongPasswordCountRef.current += 1;
          setError(getHintErrorMessage(wrongPasswordCountRef.current));
        } else {
          setError('Invalid email or password.');
        }
      } else if (err.code === 'auth/invalid-email' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password.');
      } else {
        setError('Failed to log in. Please try again.');
      }
      console.error('Firebase login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container login-page-container">
      <div className="login-decor-blob"></div>
      <div className="card login-card">
        <div className="login-header-section">
          <div className="login-flower-icon-wrap">
            <TitleFlowerIcon className="title-icon" width="32" height="32" />
          </div>
          <h1 className="title">Ray's Garden</h1>
          <p className="login-subtitle">A special sanctuary for Ray & Tajie 🌸</p>
        </div>

        <form className="form" onSubmit={handleLogin}>
          {error && (
            <div className="error-message" role="alert">
              <span>{error}</span>
            </div>
          )}

          <div className="input-wrapper">
            <EmailFlowerIcon className="input-icon" width="20" height="20" />
            <input
              type="email"
              placeholder="Email Address"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              required
            />
          </div>

          <div className="input-wrapper password-input-wrapper">
            <PasswordFlowerIcon className="input-icon" width="20" height="20" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <button 
            type="submit" 
            className="button login-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-loading-flex">
                <span className="btn-spinner"></span>
                <span>Opening Garden...</span>
              </span>
            ) : (
              'Enter Garden 🌷'
            )}
          </button>
        </form>

        <div className="login-footer-links">
          <Link to="/hash" className="secret-door-link">
            🗝️ Secret Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
