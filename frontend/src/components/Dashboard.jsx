import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; 
import { motion } from 'framer-motion';

import { ReactComponent as MovieIcon } from '../assets/movie-watch-list.svg';
import { ReactComponent as DateIcon } from '../assets/date-ideas.svg';
import { ReactComponent as PeriodIcon } from '../assets/period-tracker.svg';
import { ReactComponent as BellIcon } from '../assets/reminders.svg';
import { ReactComponent as CalorieIcon } from '../assets/calorie-tracker.svg';
import { ReactComponent as GoalIcon } from '../assets/current-goals.svg';
import { ReactComponent as SecretMissionIcon } from '../assets/secret-mission.svg';
import { ReactComponent as PlaybookIcon } from '../assets/playbook.svg';

function Dashboard() {
  const { user, logout } = useAuth();

  const dashboardItems = [
    { 
      title: 'Period Tracker', 
      subtitle: 'Cycle insights & predictions', 
      icon: <PeriodIcon />, 
      path: '/period-tracker',
      badge: 'Updated'
    },
    { 
      title: 'Movie Watch List', 
      subtitle: 'Movies we have to watch!!!', 
      icon: <MovieIcon />, 
      path: '/movie-watch-list' 
    },
    { 
      title: 'Date Ideas', 
      subtitle: 'What should me and my favy do next?', 
      icon: <DateIcon />, 
      path: '/date-ideas' 
    },
    { 
      title: 'Reminders', 
      subtitle: 'Never miss our sweet moments', 
      icon: <BellIcon />, 
      path: '/reminders' 
    },
    { 
      title: 'Calorie Tracker', 
      subtitle: 'Caldef check & daily meals', 
      icon: <CalorieIcon />, 
      path: '/calorie-tracker' 
    },
    { 
      title: 'Current Goals', 
      subtitle: 'Things we want to achieve!', 
      icon: <GoalIcon />, 
      path: '/current-goals' 
    },
    { 
      title: 'Operation Ray-connect', 
      subtitle: 'Whats our current quest?', 
      icon: <SecretMissionIcon />, 
      path: '/ray-connect' 
    },
    { 
      title: "Our Shared Playbook", 
      subtitle: 'So that we would never forget!', 
      icon: <PlaybookIcon />, 
      path: '/playbook' 
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserDisplayName = () => {
    if (!user || !user.email) {
      return 'Favy';
    }

    const email = user.email.toLowerCase();

    if (email === 'jetjetcerezo@gmail.com') {
      return 'Tajie';
    } else if (email === 'rheanamindo@gmail.com') {
      return 'Ray';
    }

    return email.split('@')[0];
  };

  const userName = getUserDisplayName();
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="page-container dashboard-page">
      <header className="dashboard-header">
        <div className="header-greeting-container">
          <span className="dashboard-greeting-tag">{todayFormatted} • Ray's Garden 🌸</span>
          <h1 className="dashboard-greeting">{getGreeting()},</h1>
          <h2 className="dashboard-username">{userName}</h2>
        </div>
        <button onClick={logout} className="logout-button" title="Sign out">
          Logout
        </button>
      </header>

      {/* Hero Welcome Pill */}
      <motion.div 
        className="garden-hero-pill"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="garden-hero-emoji">🌷</span>
        <div className="garden-hero-text">
          <span className="garden-hero-quote">You make every day blossom beautifully.</span>
        </div>
      </motion.div>

      <div className="dashboard-grid">
        {dashboardItems.map((item, index) => (
          <Link to={item.path} key={index} className="dashboard-card">
            <div className="card-icon">{item.icon}</div>
            <div className="card-content">
              <div className="card-title-row">
                <h3 className="card-title">{item.title}</h3>
                {item.badge && <span className="card-badge">{item.badge}</span>}
              </div>
              <p className="card-subtitle">{item.subtitle}</p>
            </div>
            <span className="card-arrow">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;