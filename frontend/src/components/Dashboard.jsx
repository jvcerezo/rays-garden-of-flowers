import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; // Import Link for navigation

// --- SVG Icon Components for Dashboard Cards ---
const MovieIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 14H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const DateIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.44 3.10156C14.63 3.10156 13.01 4.21156 12.44 5.84156C12.31 6.22156 12.11 6.58156 11.89 6.90156C11.45 7.51156 10.96 8.00156 10.42 8.35156C9.28 9.10156 8.27 9.19156 7.33 8.64156C5.52 7.59156 4.63 5.49156 5.61 3.73156C6.59 1.98156 8.79 1.23156 10.59 2.21156C10.85 2.35156 11.08 2.52156 11.29 2.70156" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.29 2.70156C11.66 2.24156 12.34 2.11156 12.91 2.37156L16.27 3.78156C17.99 4.58156 18.37 6.83156 17.16 8.33156L10.38 16.6416C9.17 18.1416 6.95 18.5116 5.18 17.7516L2.31 16.5416C0.54 15.7816 0.06 13.5916 1.18 11.9316L4.01 7.29156" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.8691 5.63086C20.4291 5.63086 21.7091 6.91086 21.7091 8.47086C21.7091 9.39086 21.1691 10.2109 20.3791 10.6409" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.2891 10.1582L19.4691 14.1582" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const PeriodIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12C2 7.28599 2 4.92898 3.46447 3.46447C4.92898 2 7.28599 2 12 2C16.714 2 19.071 2 20.5355 3.46447C22 4.92898 22 7.28599 22 12C22 16.714 22 19.071 20.5355 20.5355C19.071 22 16.714 22 12 22C7.28599 22 4.92898 22 3.46447 20.5355C2 19.071 2 16.714 2 12Z" stroke="currentColor" strokeWidth="2" />
    <path d="M7 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.5 10H21.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.9999 14.5H12.0089" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.49994 14.5H8.50888" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.4999 14.5H15.5088" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.9999 18H12.0089" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.49994 18H8.50888" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.4999 18H15.5088" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8.5C18 12.108 17.595 14.831 16.516 16.534C15.402 18.297 14.062 19.333 12.003 19.333C9.943 19.333 8.603 18.297 7.488 16.534C6.41 14.831 6 12.108 6 8.5C6 4.892 8.686 2 12 2C15.314 2 18 4.892 18 8.5Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M9 20C9 21.6569 10.3431 23 12 23C13.6569 23 15 21.6569 15 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const CalorieIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 3L16.4882 3.23351C17.5463 3.71536 18.2846 4.45372 18.7665 5.51184L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 21H7C4.79086 21 3 19.2091 3 17V7C3 4.79086 4.79086 3 7 3H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const GoalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function Dashboard() {
  const { user, logout } = useAuth();

  const dashboardItems = [
    { title: 'Movie Watch List', icon: <MovieIcon />, path: '/movie-watchlist' },
    { title: 'Date Ideas', icon: <DateIcon />, path: '#' },
    { title: 'Period Tracker', icon: <PeriodIcon />, path: '#' },
    { title: 'Reminders', icon: <BellIcon />, path: '#' },
    { title: 'Calorie Tracker', icon: <CalorieIcon />, path: '#' },
    { title: 'Current Goals', icon: <GoalIcon />, path: '#' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = user ? user.email.split('@')[0] : '';

  return (
    // Use the generic page-container for layout, with a specific dashboard class for custom styling
    <div className="page-container dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">{getGreeting()},</h1>
          <h2 className="dashboard-username">{userName}</h2>
        </div>
        <button onClick={logout} className="logout-button">Logout</button>
      </header>

      <div className="dashboard-grid">
        {dashboardItems.map((item, index) => (
          <Link to={item.path} key={index} className="dashboard-card">
            <div className="card-icon">{item.icon}</div>
            <h3 className="card-title">{item.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
