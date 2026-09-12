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
      id: 'period',
      title: 'Period Tracker', 
      subtitle: 'Cycle insights & predictions', 
      icon: <PeriodIcon />, 
      path: '/period-tracker',
      badge: 'Smart Avg',
      theme: 'card-theme-rose'
    },
    { 
      id: 'movies',
      title: 'Movie Watch List', 
      subtitle: 'Movies we have to watch together', 
      icon: <MovieIcon />, 
      path: '/movie-watch-list',
      theme: 'card-theme-purple'
    },
    { 
      id: 'dates',
      title: 'Date Ideas', 
      subtitle: 'What should me and my favy do next?', 
      icon: <DateIcon />, 
      path: '/date-ideas',
      theme: 'card-theme-pink'
    },
    { 
      id: 'reminders',
      title: 'Reminders', 
      subtitle: 'Never miss our sweet moments', 
      icon: <BellIcon />, 
      path: '/reminders',
      theme: 'card-theme-amber'
    },
    { 
      id: 'calories',
      title: 'Calorie Tracker', 
      subtitle: 'Caldef check & daily meals', 
      icon: <CalorieIcon />, 
      path: '/calorie-tracker',
      theme: 'card-theme-emerald'
    },
    { 
      id: 'goals',
      title: 'Current Goals', 
      subtitle: 'Shared dreams we want to achieve!', 
      icon: <GoalIcon />, 
      path: '/current-goals',
      theme: 'card-theme-blue'
    },
    { 
      id: 'quests',
      title: 'Operation Ray-connect', 
      subtitle: 'What is our current quest?', 
      icon: <SecretMissionIcon />, 
      path: '/ray-connect',
      theme: 'card-theme-indigo'
    },
    { 
      id: 'playbook',
      title: "Our Shared Playbook", 
      subtitle: 'Memories and lessons together', 
      icon: <PlaybookIcon />, 
      path: '/playbook',
      theme: 'card-theme-violet'
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: '☀️' };
    if (hour < 18) return { text: 'Good Afternoon', icon: '🌤️' };
    return { text: 'Good Evening', icon: '🌙' };
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

  const greetingInfo = getGreeting();
  const userName = getUserDisplayName();
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  return (
    <div className="page-container dashboard-page">
      <header className="dashboard-header">
        <div className="header-greeting-container">
          <span className="dashboard-greeting-tag">{todayFormatted} • Ray's Garden 🌸</span>
          <h1 className="dashboard-greeting">
            <span>{greetingInfo.text},</span>
            <span className="greeting-emoji">{greetingInfo.icon}</span>
          </h1>
          <h2 className="dashboard-username">{userName}</h2>
        </div>
        <div className="header-user-actions">
          <div className="user-avatar-badge" title={user?.email || 'Logged in'}>
            <span>{userName.charAt(0)}</span>
          </div>
          <button onClick={logout} className="logout-button" title="Sign out">
            Logout
          </button>
        </div>
      </header>

      {/* Hero Welcome Pill */}
      <motion.div 
        className="garden-hero-pill"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <span className="garden-hero-emoji">🌷</span>
        <div className="garden-hero-text">
          <span className="garden-hero-quote">You make every day blossom beautifully.</span>
        </div>
      </motion.div>

      {/* Modern Staggered Cards List */}
      <motion.div 
        className="dashboard-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {dashboardItems.map((item) => (
          <motion.div
            key={item.id}
            variants={cardVariants}
            whileTap={{ scale: 0.98 }}
            className="dashboard-card-wrap"
          >
            <Link to={item.path} className={`dashboard-card ${item.theme}`}>
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
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default Dashboard;