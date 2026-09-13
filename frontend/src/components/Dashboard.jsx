import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; 

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
    { title: 'Period Tracker', subtitle: 'Cycle insights & wellness', icon: <PeriodIcon />, path: '/period-tracker', theme: 'card-theme-rose' },
    { title: 'Movie Watch List', subtitle: 'Movies we have to watch together', icon: <MovieIcon />, path: '/movie-watch-list', theme: 'card-theme-purple' },
    { title: 'Date Ideas', subtitle: 'What should me and my favy do next?', icon: <DateIcon />, path: '/date-ideas', theme: 'card-theme-pink' },
    { title: 'Reminders', subtitle: 'Never miss our sweet moments', icon: <BellIcon />, path: '/reminders', theme: 'card-theme-amber' },
    { title: 'Calorie Tracker', subtitle: 'Caldef check & daily meals', icon: <CalorieIcon />, path: '/calorie-tracker', theme: 'card-theme-emerald' },
    { title: 'Current Goals', subtitle: 'Shared dreams we want to achieve!', icon: <GoalIcon />, path: '/current-goals', theme: 'card-theme-blue' },
    { title: 'Operation Ray-connect', subtitle: 'Whats our current quest?', icon: <SecretMissionIcon />, path: '/ray-connect', theme: 'card-theme-indigo' },
    { title: "Our Shared Playbook", subtitle: 'Memories & lessons together', icon: <PlaybookIcon />, path: '/playbook', theme: 'card-theme-violet' }
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

  const greeting = getGreeting();
  const userName = getUserDisplayName();

  return (
    <div className="page-container dashboard-page">
      <header className="dashboard-header">
        <div className="header-greeting-container">
          <span className="dashboard-greeting-tag">Ray's Garden 🌸</span>
          <h1 className="dashboard-greeting">
            {greeting.text} {greeting.icon}
          </h1>
          <h2 className="dashboard-username">{userName}</h2>
        </div>
        <div className="header-user-actions">
          <div className="user-avatar-badge" title={user?.email || 'User'}>
            <span>{userName.charAt(0)}</span>
          </div>
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </header>

      <div className="dashboard-grid">
        {dashboardItems.map((item, index) => (
          <Link to={item.path} key={index} className={`dashboard-card ${item.theme}`}>
            <div className="card-icon">{item.icon}</div>
            <div className="card-content">
              <h3 className="card-title">{item.title}</h3>
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