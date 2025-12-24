import React, { useState, useEffect } from 'react';
import { MessageCircle, Trash2, Send, Edit2, X, Check, Flag, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import { TurnstileWidget } from '../TurnstileWidget';
import type { BlogComment } from '../../types/blog';

interface BlogCommentsProps {
  postSlug: string;
}

export const BlogComments: React.FC<BlogCommentsProps> = ({ postSlug }) => {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editError, setEditError] = useState('');
  
  // Report state
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDescription, setReportDescription] = useState('');
  const [reportError, setReportError] = useState('');
  
  // Staff deletion state
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [deletionReason, setDeletionReason] = useState('');
  const [deletionError, setDeletionError] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postSlug]);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = {};
      
      // Include auth token if user is authenticated
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(API_ENDPOINTS.blogComments(postSlug), {
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(data.results || data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (newComment.length > 2000) {
      setError('Comment is too long. Maximum 2000 characters allowed.');
      return;
    }

    if (!turnstileToken) {
      setError('Please complete the CAPTCHA verification');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(API_ENDPOINTS.blogCommentCreate(postSlug), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newComment.trim(),
          turnstile_token: turnstileToken,
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments([newCommentData, ...comments]);
        setNewComment('');
        setTurnstileToken(null); // Reset turnstile token
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to post comment');
      }
    } catch (err) {
      setError('An error occurred while posting your comment');
      console.error('Error posting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (comment: BlogComment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setEditError('');
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
    setEditError('');
  };

  const handleSaveEdit = async (commentId: number) => {
    if (!editContent.trim()) {
      setEditError('Comment cannot be empty');
      return;
    }

    if (editContent.length > 2000) {
      setEditError('Comment is too long. Maximum 2000 characters allowed.');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(API_ENDPOINTS.blogCommentUpdate(commentId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editContent.trim(),
        }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(comments.map(c => c.id === commentId ? updatedComment : c));
        setEditingCommentId(null);
        setEditContent('');
        setEditError('');
      } else {
        const errorData = await response.json();
        setEditError(errorData.error || 'Failed to update comment');
      }
    } catch (err) {
      setEditError('An error occurred while updating the comment');
      console.error('Error updating comment:', err);
    }
  };

  const isStaff = user?.is_staff || user?.is_superuser;
  const canDeleteAnyComment = isStaff; // You can check specific permission here

  const handleDeleteComment = async (commentId: number, isOwner: boolean) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    if (isOwner) {
      // Owner hard delete
      if (!confirm('Are you sure you want to permanently delete this comment?')) {
        return;
      }

      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(API_ENDPOINTS.blogCommentDelete(commentId), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setComments(comments.filter(c => c.id !== commentId));
        } else {
          alert('Failed to delete comment');
        }
      } catch (err) {
        console.error('Error deleting comment:', err);
        alert('An error occurred while deleting the comment');
      }
    } else if (canDeleteAnyComment) {
      // Staff soft delete - show reason dialog
      setDeletingCommentId(commentId);
      setDeletionReason('');
      setDeletionError('');
    }
  };

  const handleStaffDelete = async () => {
    if (!deletionReason.trim()) {
      setDeletionError('Deletion reason is required');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(API_ENDPOINTS.blogCommentDelete(deletingCommentId!), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          deletion_reason: deletionReason.trim(),
        }),
      });

      if (response.ok) {
        setComments(comments.filter(c => c.id !== deletingCommentId));
        setDeletingCommentId(null);
        setDeletionReason('');
      } else {
        const errorData = await response.json();
        setDeletionError(errorData.error || 'Failed to delete comment');
      }
    } catch (err) {
      setDeletionError('An error occurred while deleting the comment');
      console.error('Error deleting comment:', err);
    }
  };

  const handleReportComment = (commentId: number) => {
    setReportingCommentId(commentId);
    setReportReason('spam');
    setReportDescription('');
    setReportError('');
  };

  const handleSubmitReport = async () => {
    if (!reportDescription.trim()) {
      setReportError('Please provide a description of the issue');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(API_ENDPOINTS.blogCommentReport(reportingCommentId!), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          comment: reportingCommentId,
          reason: reportReason,
          description: reportDescription.trim(),
        }),
      });

      if (response.ok) {
        setReportingCommentId(null);
        setReportDescription('');
        alert('Thank you for your report. Our team will review it shortly.');
      } else {
        const errorData = await response.json();
        setReportError(errorData.error || 'Failed to submit report');
      }
    } catch (err) {
      setReportError('An error occurred while submitting the report');
      console.error('Error reporting comment:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        Comments ({comments.length})
      </h2>

      {/* Comment Form - Only for authenticated users */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              rows={4}
              disabled={submitting}
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {newComment.length}/2000 characters
              </span>
            </div>
            
            {/* Turnstile CAPTCHA Widget */}
            <div className="mt-4">
              <TurnstileWidget
                onVerify={(token) => setTurnstileToken(token)}
                onError={() => setTurnstileToken(null)}
                onExpire={() => setTurnstileToken(null)}
                theme="auto"
                size="normal"
              />
            </div>
            
            <div className="mt-4 flex items-center justify-end">
              <button
                type="submit"
                disabled={submitting || !newComment.trim() || !turnstileToken}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
        </form>
      ) : (
        <div className="mb-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            You must be signed in to leave a comment.
          </p>
          <a
            href="/signin"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-600 dark:text-gray-400">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {comment.user_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{comment.user_username} · {formatDate(comment.created_at)}
                    {comment.updated_at !== comment.created_at && ' (edited)'}
                  </p>
                </div>
                {editingCommentId !== comment.id && (
                  <div className="flex gap-2">
                    {comment.is_owner && (
                      <>
                        <button
                          onClick={() => handleEditComment(comment)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Edit comment"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id, true)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete comment"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {!comment.is_owner && isAuthenticated && (
                      <button
                        onClick={() => handleReportComment(comment.id)}
                        className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                        title="Report comment"
                      >
                        <Flag className="w-5 h-5" />
                      </button>
                    )}
                    {!comment.is_owner && canDeleteAnyComment && (
                      <button
                        onClick={() => handleDeleteComment(comment.id, false)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete comment (Staff)"
                      >
                        <AlertTriangle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {editingCommentId === comment.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                    rows={4}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {editContent.length}/2000 characters
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(comment.id)}
                        disabled={!editContent.trim()}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Save
                      </button>
                    </div>
                  </div>
                  {editError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{editError}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Report Modal */}
      {reportingCommentId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Report Comment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="spam">Spam or Advertisement</option>
                  <option value="harassment">Harassment or Bullying</option>
                  <option value="hate_speech">Hate Speech</option>
                  <option value="misinformation">Misinformation</option>
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="off_topic">Off Topic</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Please provide details about why you're reporting this comment..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                  rows={4}
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {reportDescription.length}/1000 characters
                </span>
              </div>
              {reportError && (
                <p className="text-sm text-red-600 dark:text-red-400">{reportError}</p>
              )}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setReportingCommentId(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={!reportDescription.trim()}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Deletion Modal */}
      {deletingCommentId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              Delete Comment (Staff)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This action will soft-delete the comment. It will be hidden from users but preserved in the database for moderation review.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deletion Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  placeholder="Provide a reason for deleting this comment (required)..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                  rows={4}
                />
              </div>
              {deletionError && (
                <p className="text-sm text-red-600 dark:text-red-400">{deletionError}</p>
              )}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeletingCommentId(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStaffDelete}
                  disabled={!deletionReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Delete Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};