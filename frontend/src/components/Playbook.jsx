import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import './Playbook.css';

const CATEGORIES = [
  { id: 'promise', label: 'Promise to You', icon: '💝', theme: 'card-theme-rose', badge: 'garden-badge-rose', color: '#f43f5e' },
  { id: 'reflection', label: 'Reflection', icon: '🤔', theme: 'card-theme-purple', badge: 'garden-badge-purple', color: '#8b5cf6' },
  { id: 'growth', label: 'Personal Growth', icon: '🌱', theme: 'card-theme-emerald', badge: 'garden-badge-emerald', color: '#10b981' },
  { id: 'gratitude', label: 'Gratitude', icon: '🙏', theme: 'card-theme-amber', badge: 'garden-badge-amber', color: '#f59e0b' },
  { id: 'memory', label: 'Special Memory', icon: '💭', theme: 'card-theme-pink', badge: 'garden-badge-pink', color: '#ec4899' },
  { id: 'lesson', label: 'Lesson Learned', icon: '📚', theme: 'card-theme-blue', badge: 'garden-badge-blue', color: '#3b82f6' }
];

const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'grateful', label: 'Grateful', emoji: '🙏' },
  { id: 'peaceful', label: 'Peaceful', emoji: '😌' },
  { id: 'hopeful', label: 'Hopeful', emoji: '🌟' },
  { id: 'reflective', label: 'Reflective', emoji: '🤔' },
  { id: 'determined', label: 'Determined', emoji: '💪' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'neutral', label: 'Neutral', emoji: '🌸' }
];

function Playbook() {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState({ 
    title: '', 
    description: '', 
    category: 'promise',
    mood: 'neutral',
    tags: []
  });
  const [currentTagInput, setCurrentTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    filterNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, activeFilter, searchTerm]);

  const fetchNotes = async () => {
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
  };

  const filterNotes = () => {
    let filtered = notes;

    if (activeFilter !== 'all') {
      filtered = filtered.filter(note => note.category === activeFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(note => 
        note.title?.toLowerCase().includes(term) ||
        note.description?.toLowerCase().includes(term) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    setFilteredNotes(filtered);
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.title.trim() || !user) return;

    try {
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
      setCurrentTagInput('');
      setShowAddModal(false);
      fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const addTag = (tagText) => {
    const cleaned = tagText.trim().replace(/^#/, '');
    if (cleaned && !newNote.tags.includes(cleaned)) {
      setNewNote({
        ...newNote,
        tags: [...newNote.tags, cleaned]
      });
      setCurrentTagInput('');
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
      promise: "What promise are you making to us? How will you honor it?",
      reflection: "What has been on your mind lately? What insights have you felt?",
      growth: "How are we growing together? What are you learning?",
      gratitude: "What are you especially grateful for with each other today?",
      memory: "Describe this special moment so we remember it forever...",
      lesson: "What did this moment teach you about love, patience, or life?"
    };
    return placeholders[newNote.category] || "Share your heart and thoughts...";
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateDescription = (description, maxLength = 120) => {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  return (
    <div className="page-container playbook-page">
      {/* Header */}
      <header className="tracker-header">
        <Link to="/dashboard" className="back-button" aria-label="Back to Dashboard">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19L5 12L12 5"/>
          </svg>
        </Link>
        <div className="header-title-container">
          <h1 className="header-title">Our Shared Playbook 📖</h1>
          <span className="header-subtitle">Thoughts, promises & sweet memories</span>
        </div>
        <div className="header-right-actions">
          <button 
            className="header-icon-button"
            onClick={() => setShowAddModal(true)}
            title="Write Note"
            aria-label="Write Note"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="playbook-main">
        {loading ? (
          <LoadingSpinner text="Opening our playbook..." />
        ) : (
          <>
            {/* Search Box */}
            <div className="playbook-search-wrap">
              <div className="playbook-search-box">
                <svg className="playbook-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search thoughts, memories, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search entries"
                />
                {searchTerm && (
                  <button 
                    type="button" 
                    className="playbook-search-clear" 
                    onClick={() => setSearchTerm('')}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills */}
            <div className="garden-filter-bar">
              <button 
                className={`garden-filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                <span>📖 All ({notes.length})</span>
              </button>
              {CATEGORIES.map(category => {
                const count = notes.filter(n => n.category === category.id).length;
                return (
                  <button 
                    key={category.id}
                    className={`garden-filter-pill ${activeFilter === category.id ? 'active' : ''}`}
                    onClick={() => setActiveFilter(category.id)}
                  >
                    <span>{category.icon} {category.label} {count > 0 && `(${count})`}</span>
                  </button>
                );
              })}
            </div>

            {/* Notes List / Grid */}
            {filteredNotes.length === 0 ? (
              <div className="playbook-empty-state">
                <div className="empty-icon-bubble">🌸</div>
                <h3>No entries found</h3>
                <p>
                  {searchTerm 
                    ? `No memories match "${searchTerm}". Try another search!`
                    : "Start writing promises, reflections, or favorite memories together."}
                </p>
                <button 
                  className="playbook-btn-primary"
                  onClick={() => setShowAddModal(true)}
                >
                  Write Our First Note ✨
                </button>
              </div>
            ) : (
              <div className="playbook-cards-grid">
                {filteredNotes.map(note => {
                  const catConfig = CATEGORIES.find(c => c.id === note.category) || CATEGORIES[0];
                  const moodConfig = MOODS.find(m => m.id === note.mood) || MOODS[7];
                  const isRay = note.authorName?.toLowerCase().includes('ray');

                  return (
                    <Link 
                      to={`/playbook/note/${note.id}`} 
                      key={note.id} 
                      className={`playbook-note-card ${catConfig.theme}`}
                    >
                      {/* Top Row: Category + Mood */}
                      <div className="playbook-card-top">
                        <span className={`garden-badge ${catConfig.badge}`}>
                          {catConfig.icon} {catConfig.label}
                        </span>
                        <span className="playbook-mood-chip" title={moodConfig.label}>
                          {moodConfig.emoji} {moodConfig.label}
                        </span>
                      </div>
                      
                      {/* Title */}
                      <h2 className="playbook-card-title">{note.title}</h2>
                      
                      {/* Snippet Preview */}
                      {note.description && (
                        <p className="playbook-card-snippet">
                          {truncateDescription(note.description, 130)}
                        </p>
                      )}
                      
                      {/* Tags */}
                      {note.tags && note.tags.length > 0 && (
                        <div className="playbook-tags-row">
                          {note.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="playbook-tag-pill">#{tag}</span>
                          ))}
                          {note.tags.length > 3 && (
                            <span className="playbook-tag-more">+{note.tags.length - 3}</span>
                          )}
                        </div>
                      )}

                      {/* Footer Row: Author + Date + Read indicator */}
                      <div className="playbook-card-footer">
                        <div className="playbook-author-meta">
                          <span className="playbook-author-badge">
                            {isRay ? '🌸 Ray' : '🌿 Tajie'}
                          </span>
                          <span className="playbook-date-chip">
                            {formatDate(note.createdAt)}
                          </span>
                        </div>
                        <span className="playbook-read-arrow">
                          Read <span>→</span>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="playbook-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="playbook-modal-header">
              <div className="playbook-modal-icon">✍️</div>
              <div>
                <h2 className="modal-title">Write a New Entry</h2>
                <p className="modal-subtitle">Capture a promise, reflection, or sweet memory</p>
              </div>
              <button 
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNote} className="playbook-form">
              {/* Title */}
              <div className="form-group">
                <label htmlFor="note-title">Title</label>
                <input
                  type="text"
                  id="note-title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  placeholder="What's on your heart?"
                  required
                  autoFocus
                />
              </div>

              {/* Category Selector */}
              <div className="form-group">
                <label>Category</label>
                <div className="playbook-category-grid">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`playbook-cat-option ${newNote.category === cat.id ? 'selected' : ''}`}
                      onClick={() => setNewNote({...newNote, category: cat.id})}
                    >
                      <span className="cat-icon">{cat.icon}</span>
                      <span className="cat-text">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood Selector */}
              <div className="form-group">
                <label>Current Mood</label>
                <div className="playbook-mood-row">
                  {MOODS.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      className={`playbook-mood-btn ${newNote.mood === m.id ? 'selected' : ''}`}
                      onClick={() => setNewNote({...newNote, mood: m.id})}
                      title={m.label}
                    >
                      <span className="mood-emoji">{m.emoji}</span>
                      <span className="mood-name">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="note-description">Your Thoughts</label>
                <textarea
                  id="note-description"
                  value={newNote.description}
                  onChange={(e) => setNewNote({...newNote, description: e.target.value})}
                  placeholder={getPlaceholderText()}
                  rows="5"
                />
              </div>

              {/* Tags Input */}
              <div className="form-group">
                <label htmlFor="note-tags">Tags</label>
                <div className="playbook-tags-input-box">
                  {newNote.tags.map((tag, idx) => (
                    <span key={idx} className="playbook-tag-pill active">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="playbook-tag-remove"
                        aria-label={`Remove tag ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    id="note-tags"
                    type="text"
                    placeholder={newNote.tags.length === 0 ? "Type a tag & press Enter (e.g. promise, date)" : "Add more..."}
                    value={currentTagInput}
                    onChange={(e) => setCurrentTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        if (currentTagInput.trim()) {
                          addTag(currentTagInput);
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="playbook-modal-actions">
                <button 
                  type="button" 
                  className="playbook-btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="playbook-btn-primary">
                  Save Note ✨
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
