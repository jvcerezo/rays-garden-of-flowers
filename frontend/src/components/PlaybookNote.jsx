import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './PlaybookNote.css';

function PlaybookNote() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [note, setNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  // Helper functions
  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  const getMoodInfo = (moodId) => {
    return moods.find(mood => mood.id === moodId) || moods[7]; // default to neutral
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
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

  useEffect(() => {
    fetchNote();
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
          title: noteData.title,
          description: noteData.description || ''
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

    // Check if current user is the author
    if (note.authorId !== user.uid) {
      toast.error('You can only edit your own notes');
      return;
    }

    try {
      await updateDoc(doc(db, 'shared_playbook_notes', noteId), {
        title: editedNote.title.trim(),
        description: editedNote.description.trim(),
        updatedAt: serverTimestamp()
      });
      
      setNote({
        ...note,
        title: editedNote.title.trim(),
        description: editedNote.description.trim()
      });
      setIsEditing(false);
      toast.success('Note updated successfully');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const handleDelete = async () => {
    // Check if current user is the author
    if (note.authorId !== user.uid) {
      toast.error('You can only delete your own notes');
      return;
    }

    try {
      await deleteDoc(doc(db, 'shared_playbook_notes', noteId));
      toast.success('Note deleted successfully');
      navigate('/playbook');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleCancel = () => {
    setEditedNote({
      title: note.title,
      description: note.description || ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="page-container playbook-note-page">
        <div className="loading-state">Loading note...</div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="page-container playbook-note-page">
        <div className="error-state">Note not found</div>
      </div>
    );
  }

  return (
    <div className="playbook-note-page">
      <header className="page-header">
        <Link to="/playbook" className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <div className="header-title">
          {isEditing ? 'Editing Note' : 'Your Note'}
        </div>
        <div className="header-actions">
          {isEditing ? (
            <>
              <button className="save-button" onClick={handleSave}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Save
              </button>
              <button className="cancel-button" onClick={handleCancel}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          ) : (
            <>
              {note?.authorId === user?.uid && (
                <>
                  <button className="edit-button" onClick={() => setIsEditing(true)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Edit
                  </button>
                  <button 
                    className="delete-button" 
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </header>

      <div className="note-content">
        {isEditing ? (
          <div className="edit-form">
            <div className="form-group">
              <label htmlFor="edit-title">Note Title</label>
              <input
                type="text"
                id="edit-title"
                value={editedNote.title}
                onChange={(e) => setEditedNote({...editedNote, title: e.target.value})}
                className="title-input"
                placeholder="Enter your note title..."
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-description">Your Thoughts</label>
              <textarea
                id="edit-description"
                value={editedNote.description}
                onChange={(e) => setEditedNote({...editedNote, description: e.target.value})}
                className="description-input"
                placeholder="Pour your heart out here..."
                rows="15"
              />
            </div>
          </div>
        ) : (
          <div className="note-display">
            <div 
              className="note-card-display"
              style={{ '--category-color': getCategoryInfo(note.category).color }}
            >
              <div className="note-header-section">
                <div className="category-header">
                  <span className="category-icon">{getCategoryInfo(note.category).icon}</span>
                  <span className="category-label">{getCategoryInfo(note.category).label}</span>
                </div>
                {note.mood && (
                  <div className="note-mood">
                    <span className="mood-emoji">{getMoodInfo(note.mood).emoji}</span>
                  </div>
                )}
              </div>
              
              <div className="note-content-section">
                <div className="note-title-row">
                  <h3 className="note-title">{note.title}</h3>
                  <div className="note-meta-info">
                    <div className="note-author">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>by {note.authorName || 'Unknown'}</span>
                    </div>
                    <div className="note-date">
                      <span>{formatDate(note.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="note-description">
                {note.description ? (
                  <div className="description-content">
                    <pre className="description-text">{note.description}</pre>
                  </div>
                ) : (
                  <div className="no-description">
                    <p>This note is waiting for your thoughts...</p>
                    {note?.authorId === user?.uid && (
                      <button 
                        className="add-content-button"
                        onClick={() => setIsEditing(true)}
                      >
                        Add Content
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="delete-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Delete Note</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete "<strong>{note.title}</strong>"?</p>
              <p>This action cannot be undone and your note will be permanently removed.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="secondary-button"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Keep Note
              </button>
              <button 
                className="danger-button"
                onClick={handleDelete}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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
