import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase'; // Make sure this path is correct

// Import your local SVG files
import { ReactComponent as TitleFlowerIcon } from '../assets/login-title.svg';
import { ReactComponent as EmailFlowerIcon } from '../assets/login-username.svg';
import { ReactComponent as PasswordFlowerIcon } from '../assets/login-password.svg';

// The component no longer needs the onLogin prop because AuthContext handles the state
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const allowedEmails = [
    'jetjetcerezo@gmail.com',
    'rheanamindo@gmail.com'
  ];

  // The login handler is now an async function to work with Firebase
  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    // 1. First, check if the email is in the allowed list
    if (!allowedEmails.includes(email.toLowerCase().trim())) {
      setError('This email address is not authorized.');
      return; // Stop the function if not allowed
    }

    // 2. If allowed, try to sign in with Firebase
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // If login is successful, the onAuthStateChanged listener in your AuthContext will do the rest.
      console.log('Firebase login successful:', userCredential.user);
    } catch (err) {
      // Handle specific Firebase errors for a better user experience
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Invalid email or password.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        default:
          setError('Failed to log in. Please try again.');
          break;
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
