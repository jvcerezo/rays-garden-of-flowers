import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import './Playbook.css';

function Playbook() {
  const [notes, setNotes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState({ 
    title: '', 
    description: '', 
    category: 'promise',
    mood: 'neutral',
    tags: []
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const categories = [
    { id: 'promise', label: 'Promise to You', icon: '💝', color: '#0ea5e9' },
    { id: 'reflection', label: 'Reflection', icon: '🤔', color: '#7c3aed' },
    { id: 'growth', label: 'Personal Growth', icon: '🌱', color: '#059669' },
    { id: 'gratitude', label: 'Gratitude', icon: '🙏', color: '#ea580c' },
    { id: 'memory', label: 'Special Memory', icon: '💭', color: '#e11d48' },
    { id: 'lesson', label: 'Lesson Learned', icon: '📚', color: '#8b5cf6' }
  ];

  const moods = [
    { id: 'happy', label: 'Happy', emoji: '😊', color: '#fbbf24' },
    { id: 'sad', label: 'Sad', emoji: '😢', color: '#3b82f6' },
    { id: 'grateful', label: 'Grateful', emoji: '🙏', color: '#10b981' },
    { id: 'hopeful', label: 'Hopeful', emoji: '🌟', color: '#8b5cf6' },
    { id: 'reflective', label: 'Reflective', emoji: '🤔', color: '#6b7280' },
    { id: 'determined', label: 'Determined', emoji: '💪', color: '#ef4444' },
    { id: 'peaceful', label: 'Peaceful', emoji: '😌', color: '#06b6d4' },
    { id: 'neutral', label: 'Neutral', emoji: '😐', color: '#9ca3af' }
  ];

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const notesQuery = query(
        collection(db, 'shared_playbook_notes'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(notesQuery);
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotes(notesData);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Filter by category
    if (activeFilter !== 'all') {
      filtered = filtered.filter(note => note.category === activeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    return filtered;
  }, [notes, activeFilter, searchTerm]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.title.trim() || !user) return;

    try {
      // Debug: Check authentication status
      console.log('User authenticated:', !!user);
      console.log('User ID:', user?.uid);
      console.log('User email:', user?.email);

      // Get user display name for attribution
      const getUserDisplayName = () => {
        if (!user || !user.email) return 'Anonymous';
        const email = user.email.toLowerCase();
        if (email === 'jetjetcerezo@gmail.com') return 'Tajie';
        else if (email === 'rheanamindo@gmail.com') return 'Ray';
        return email.split('@')[0];
      };

      await addDoc(collection(db, 'shared_playbook_notes'), {
        title: newNote.title.trim(),
        description: newNote.description.trim(),
        category: newNote.category,
        mood: newNote.mood,
        tags: newNote.tags.filter(tag => tag.trim() !== ''),
        authorId: user.uid,
        authorName: getUserDisplayName(),
        authorEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setNewNote({ 
        title: '', 
        description: '', 
        category: 'promise',
        mood: 'neutral',
        tags: []
      });
      setShowAddModal(false);
      fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const addTag = (tagText) => {
    if (tagText.trim() && !newNote.tags.includes(tagText.trim())) {
      setNewNote({
        ...newNote,
        tags: [...newNote.tags, tagText.trim()]
      });
    }
  };

  const removeTag = (tagToRemove) => {
    setNewNote({
      ...newNote,
      tags: newNote.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const getPlaceholderText = () => {
    const placeholders = {
      promise: "What promise are you making? How will you honor it? What steps will you take?",
      reflection: "What are you thinking about? What insights have you gained?",
      growth: "How are you growing? What are you learning about yourself?",
      gratitude: "What are you grateful for today? Who or what brought you joy?",
      memory: "Describe this special moment. How did it make you feel?",
      lesson: "What did you learn? How will this change your approach?"
    };
    return placeholders[newNote.category] || "Share your thoughts and feelings...";
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateDescription = (description, maxLength = 100) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  return (
    <div className="page-container playbook-page">
      <header className="tracker-header playbook-header">
        <Link to="/dashboard" className="back-button" title="Back to Dashboard">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <div className="header-title-container">
          <h1 className="header-title">Our Playbook</h1>
          <span className="header-subtitle">Thoughts & Dreams Together 📖</span>
        </div>
        <button 
          className="add-note-header-btn"
          onClick={() => setShowAddModal(true)}
          title="Create Entry"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </header>

      <div className="playbook-content">
        {loading ? (
          <LoadingSpinner text="Loading your journey..." />
        ) : (
          <>
            {/* Search and Filter Section */}
            <div className="controls-section">
              <div className="search-section">
                <div className="search-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search your journey..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-section">
                <div className="filter-tabs">
                  <button 
                    className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                  >
                    <span className="filter-icon">📖</span>
                    <span>All Entries</span>
                  </button>
                  {categories.map(category => (
                    <button 
                      key={category.id}
                      className={`filter-tab ${activeFilter === category.id ? 'active' : ''}`}
                      onClick={() => setActiveFilter(category.id)}
                      style={{ '--category-color': category.color }}
                    >
                      <span className="filter-icon">{category.icon}</span>
                      <span>{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredNotes.length === 0 ? (
              <div className="empty-state">
                <h3>No entries yet</h3>
                <p>Start creating your entries.</p>
                <button 
                  className="primary-button create-first-note"
                  onClick={() => setShowAddModal(true)}
                >
                  Create Entry
                </button>
              </div>
            ) : (
              <div className="notes-grid">{filteredNotes.map(note => {
                    const category = categories.find(cat => cat.id === note.category) || categories[0];
                    const mood = moods.find(m => m.id === note.mood) || moods[7];
                    
                    return (
                      <Link 
                        to={`/playbook/note/${note.id}`} 
                        key={note.id} 
                        className="note-card enhanced-note-card"
                        style={{ '--category-color': category.color }}
                      >
                        <div className="note-category-badge">
                          <span className="category-icon">{category.icon}</span>
                          <span className="category-label">{category.label}</span>
                        </div>
                        
                        <div className="note-header">
                          <h3 className="note-title">{note.title}</h3>
                          <div className="note-mood">
                            <span className="mood-emoji">{mood.emoji}</span>
                          </div>
                        </div>
                        
                        <div className="note-author">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>by {note.authorName || 'Unknown'}</span>
                          <span className="note-date">{formatDate(note.createdAt)}</span>
                        </div>
                        
                        {note.description && (
                          <p className="note-preview">
                            {truncateDescription(note.description)}
                          </p>
                        )}
                        
                        {note.tags && note.tags.length > 0 && (
                          <div className="note-tags">
                            {note.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="note-tag">#{tag}</span>
                            ))}
                            {note.tags.length > 3 && (
                              <span className="note-tag-more">+{note.tags.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </Link>
                    );
                  })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Enhanced Add Note Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Create New Note</h3>
              <p>Capture your thoughts and ideas</p>
              <button 
                className="close-button"
                onClick={() => setShowAddModal(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddNote} className="add-note-form enhanced-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Entry Title</label>
                  <input
                    type="text"
                    id="title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    placeholder="What's this about?"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <div className="category-selector">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        type="button"
                        className={`category-option ${newNote.category === category.id ? 'selected' : ''}`}
                        onClick={() => setNewNote({...newNote, category: category.id})}
                        style={{ '--category-color': category.color }}
                      >
                        <span className="category-icon">{category.icon}</span>
                        <span className="category-label">{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="mood">How are you feeling?</label>
                  <div className="mood-selector">
                    {moods.map(mood => (
                      <button
                        key={mood.id}
                        type="button"
                        className={`mood-option ${newNote.mood === mood.id ? 'selected' : ''}`}
                        onClick={() => setNewNote({...newNote, mood: mood.id})}
                        title={mood.label}
                      >
                        <span className="mood-emoji">{mood.emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="description">Your Thoughts</label>
                  <textarea
                    id="description"
                    value={newNote.description}
                    onChange={(e) => setNewNote({...newNote, description: e.target.value})}
                    placeholder={getPlaceholderText()}
                    rows="5"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tags">Tags (Press Enter to add)</label>
                  <div className="tags-input-container">
                    <div className="tags-display">
                      {newNote.tags.map((tag, index) => (
                        <span key={index} className="tag-pill">
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="tag-remove"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add tags... (healing, promise, growth)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="secondary-button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Create Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Playbook;
