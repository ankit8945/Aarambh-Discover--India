import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchComments, addComment, reportComment, deleteComment } from '../services/api';
import { CommentItem } from '../types';
import { MessageSquare, Send, Trash2, Flag, ShieldAlert, CheckCircle2, User } from 'lucide-react';

interface CommentSectionProps {
  targetType: 'place' | 'memory' | 'craft' | 'story';
  targetId: string;
  title?: string;
  placeTitle?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  targetType,
  targetId,
  title = 'Community Cultural Reflections',
  placeTitle,
}) => {
  const { user, openAuthModal } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reportSuccessId, setReportSuccessId] = useState<string | null>(null);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await fetchComments(targetType, targetId);
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [targetType, targetId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || submitting) return;

    if (!user) {
      openAuthModal();
      return;
    }

    setSubmitting(true);
    try {
      const added = await addComment({
        targetType,
        targetId,
        text: newCommentText.trim(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
      });
      setComments((prev) => [...prev, added]);
      setNewCommentText('');
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async (commentId: string) => {
    const reason = prompt('Please specify why this comment is inappropriate (e.g. misleading, abusive, off-topic):');
    if (!reason) return;

    try {
      await reportComment(commentId, reason);
      setReportSuccessId(commentId);
      setTimeout(() => setReportSuccessId(null), 3000);
      loadComments();
    } catch (err) {
      console.error('Failed to report comment', err);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/90 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-600" />
          <h4 className="text-sm font-bold text-stone-900 font-heritage">{title}</h4>
        </div>
        <span className="text-xs text-stone-400">
          {comments.length} {comments.length === 1 ? 'reflection' : 'reflections'}
        </span>
      </div>

      {/* Input box */}
      <form onSubmit={handleAddComment} className="mb-6">
        <div className="relative">
          <textarea
            rows={2}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Share your personal memory, family connection, or oral tradition about this place..."
            className="w-full px-4 py-3 pr-24 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!newCommentText.trim() || submitting}
            className="absolute right-2.5 bottom-3.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Reflect</span>
          </button>
        </div>
      </form>

      {/* Comment list - genuinely empty if no user has commented yet */}
      {loading ? (
        <div className="py-6 text-center text-xs text-stone-400 animate-pulse">
          Retrieving community memories...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
          <p className="text-xs text-stone-500 font-medium">No community reflections yet.</p>
          <p className="text-[11px] text-stone-400 mt-1">
            Be the first traveler or local resident to contribute a memory to this site.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const isOwn = user?.id === comment.userId;
            const isAdmin = user?.role === 'ADMIN';

            return (
              <div
                key={comment.id}
                className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 flex flex-col justify-between transition-colors hover:border-stone-200"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center">
                      {comment.userName ? comment.userName[0].toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-semibold text-stone-900">{comment.userName}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                        comment.userRole === 'ADMIN'
                          ? 'bg-red-100 text-red-700'
                          : comment.userRole === 'CULTURAL_CREATOR'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {comment.userRole}
                    </span>
                  </div>

                  <span className="text-[10px] text-stone-400">
                    {new Date(comment.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed pl-8">{comment.text}</p>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-2 pt-1 border-t border-stone-100/80 text-[11px] text-stone-400">
                  {reportSuccessId === comment.id ? (
                    <span className="text-amber-600 flex items-center gap-1 text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> Flagged for Curator Review
                    </span>
                  ) : (
                    <button
                      onClick={() => handleReport(comment.id)}
                      className="hover:text-amber-700 flex items-center gap-1 transition-colors"
                      title="Report comment"
                    >
                      <Flag className="w-3 h-3" /> Report
                    </button>
                  )}

                  {(isOwn || isAdmin) && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="hover:text-red-600 flex items-center gap-1 text-red-500 transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
