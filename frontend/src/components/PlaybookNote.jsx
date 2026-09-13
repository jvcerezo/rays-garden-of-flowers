import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LoadingSpinner } from './LoadingSpinner';
import './PlaybookNote.css';

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

function PlaybookNote() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [note, setNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState({ title: '', description: '', category: 'promise', mood: 'neutral' });
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, user]);

  const fetchNote = async () => {
    if (!user || !noteId) return;
    
    try {
      setLoading(true);
      const noteDoc = await getDoc(doc(db, 'shared_playbook_notes', noteId));
      
      if (noteDoc.exists()) {
        const noteData = { id: noteDoc.id, ...noteDoc.data() };
        setNote(noteData);
        setEditedNote({
          title: noteData.title || '',
          description: noteData.description || '',
          category: noteData.category || 'promise',
          mood: noteData.mood || 'neutral'
        });
      } else {
        toast.error('Note not found');
        navigate('/playbook');
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      toast.error('Failed to load note');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedNote.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (note.authorId !== user.uid) {
      toast.error('You can only edit your own notes');
      return;
    }

    try {
      await updateDoc(doc(db, 'shared_playbook_notes', noteId), {
        title: editedNote.title.trim(),
        description: editedNote.description.trim(),
        category: editedNote.category,
        mood: editedNote.mood,
        updatedAt: serverTimestamp()
      });
      
      setNote({
        ...note,
        title: editedNote.title.trim(),
        description: editedNote.description.trim(),
        category: editedNote.category,
        mood: editedNote.mood
      });
      setIsEditing(false);
      toast.success('Note updated ✨');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const handleDelete = async () => {
    if (note.authorId !== user.uid) {
      toast.error('You can only delete your own notes');
      return;
    }

    try {
      await deleteDoc(doc(db, 'shared_playbook_notes', noteId));
      toast.success('Note deleted');
      navigate('/playbook');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleCancel = () => {
    setEditedNote({
      title: note.title,
      description: note.description || '',
      category: note.category || 'promise',
      mood: note.mood || 'neutral'
    });
    setIsEditing(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  const getReadingTime = (text) => {
    if (!text) return '1 min read';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 180);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="page-container playbook-note-page">
        <LoadingSpinner text="Reading note..." />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="page-container playbook-note-page">
        <div className="playbook-note-notfound">
          <p>Note not found</p>
          <Link to="/playbook" className="playbook-btn-primary">Back to Playbook</Link>
        </div>
      </div>
    );
  }

  const catConfig = CATEGORIES.find(cat => cat.id === (isEditing ? editedNote.category : note.category)) || CATEGORIES[0];
  const moodConfig = MOODS.find(m => m.id === (isEditing ? editedNote.mood : note.mood)) || MOODS[7];
  const isAuthor = note?.authorId === user?.uid;
  const isRay = note?.authorName?.toLowerCase().includes('ray');

  return (
    <div className="page-container playbook-note-page">
      {/* Header */}
      <header className="tracker-header">
        <Link to="/playbook" className="back-button" aria-label="Back to Playbook">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19L5 12L12 5"/>
          </svg>
        </Link>
        <div className="header-title-container">
          <h1 className="header-title">{isEditing ? 'Editing Entry ✍️' : 'Journal Entry 📖'}</h1>
          <span className="header-subtitle">{catConfig.label}</span>
        </div>
        <div className="header-right-actions">
          {isEditing ? (
            <>
              <button 
                className="header-icon-button check" 
                onClick={handleSave} 
                title="Save Changes" 
                aria-label="Save"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </button>
              <button 
                className="header-icon-button" 
                onClick={handleCancel} 
                title="Cancel" 
                aria-label="Cancel"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </>
          ) : (
            isAuthor && (
              <>
                <button 
                  className="header-icon-button" 
                  onClick={() => setIsEditing(true)} 
                  title="Edit Note" 
                  aria-label="Edit Note"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                  </svg>
                </button>
                <button 
                  className="header-icon-button danger" 
                  onClick={() => setShowDeleteConfirm(true)} 
                  title="Delete Note" 
                  aria-label="Delete Note"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </>
            )
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="playbook-note-main">
        {isEditing ? (
          <div className="playbook-edit-card">
            <div className="form-group">
              <label htmlFor="edit-title">Title</label>
              <input
                type="text"
                id="edit-title"
                value={editedNote.title}
                onChange={(e) => setEditedNote({...editedNote, title: e.target.value})}
                placeholder="Entry title..."
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <div className="playbook-category-grid">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`playbook-cat-option ${editedNote.category === cat.id ? 'selected' : ''}`}
                    onClick={() => setEditedNote({...editedNote, category: cat.id})}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Mood</label>
              <div className="playbook-mood-row">
                {MOODS.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    className={`playbook-mood-btn ${editedNote.mood === m.id ? 'selected' : ''}`}
                    onClick={() => setEditedNote({...editedNote, mood: m.id})}
                    title={m.label}
                  >
                    <span className="mood-emoji">{m.emoji}</span>
                    <span className="mood-name">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="edit-description">Your Thoughts</label>
              <textarea
                id="edit-description"
                value={editedNote.description}
                onChange={(e) => setEditedNote({...editedNote, description: e.target.value})}
                placeholder="Pour your heart out..."
                rows="10"
              />
            </div>

            <div className="playbook-edit-actions">
              <button 
                type="button" 
                className="playbook-btn-secondary" 
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="playbook-btn-primary" 
                onClick={handleSave}
              >
                Save Changes ✨
              </button>
            </div>
          </div>
        ) : (
          <article className={`playbook-entry-display ${catConfig.theme}`}>
            {/* Top Badges */}
            <div className="playbook-card-top">
              <span className={`garden-badge ${catConfig.badge}`}>
                {catConfig.icon} {catConfig.label}
              </span>
              <span className="playbook-mood-chip">
                {moodConfig.emoji} {moodConfig.label}
              </span>
            </div>

            {/* Note Title */}
            <h1 className="playbook-entry-title">{note.title}</h1>

            {/* Meta Row */}
            <div className="playbook-entry-meta">
              <span className="playbook-author-badge">
                {isRay ? '🌸 Ray' : '🌿 Tajie'}
              </span>
              <span className="playbook-date-chip">
                {formatDate(note.createdAt)}
              </span>
              <span className="playbook-readtime-chip">
                ⏱️ {getReadingTime(note.description)}
              </span>
            </div>

            {/* Description / Content Body */}
            <div className="playbook-entry-body">
              {note.description ? (
                <div className="playbook-entry-text">
                  {note.description}
                </div>
              ) : (
                <div className="playbook-no-content">
                  <p>This note is waiting for your thoughts...</p>
                  {isAuthor && (
                    <button 
                      className="playbook-btn-secondary"
                      onClick={() => setIsEditing(true)}
                    >
                      Add Content ✍️
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="playbook-tags-row" style={{ marginTop: '16px' }}>
                {note.tags.map((tag, index) => (
                  <span key={index} className="playbook-tag-pill">#{tag}</span>
                ))}
              </div>
            )}
          </article>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="playbook-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">🗑️</div>
            <h3 className="delete-modal-title">Delete Entry?</h3>
            <p className="delete-modal-text">
              Are you sure you want to delete "<strong>{note.title}</strong>"? This action cannot be undone.
            </p>
            <div className="delete-modal-actions">
              <button 
                className="playbook-btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Keep Entry
              </button>
              <button 
                className="playbook-btn-danger"
                onClick={handleDelete}
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaybookNote;
