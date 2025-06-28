import React, { useState, useEffect, useRef } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase';

import { ReactComponent as TitleFlowerIcon } from '../assets/login-title.svg';
import { ReactComponent as EmailFlowerIcon } from '../assets/login-username.svg';
import { ReactComponent as PasswordFlowerIcon } from '../assets/login-password.svg';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // --- NEW: Function to get the correct error message ---
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
    setError('');

    if (!allowedEmails.includes(email.toLowerCase().trim())) {
      setError('This email address is not authorized.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      wrongPasswordCountRef.current = 0;
      console.log('Firebase login successful');
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
    }
  };

  return (
    <div className="page-container">
    <div className="card">
      <h1 className="title">
        <TitleFlowerIcon className="title-icon" width="28" height="28" />
        Welcome to Ray's Garden of Flowers
        <TitleFlowerIcon className="title-icon" width="28" height="28" />
      </h1>
      <form className="form" onSubmit={handleLogin}>
        {error && <p className="error-message">{error}</p>}

        <div className="input-wrapper">
          <EmailFlowerIcon className="input-icon" width="20" height="20" />
          <input
            type="email"
            placeholder="Email Address"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-wrapper">
          <PasswordFlowerIcon className="input-icon" width="20" height="20" />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="button">
          Log In
        </button>
      </form>
    </div>
  </div>
  );
}

export default Login;
