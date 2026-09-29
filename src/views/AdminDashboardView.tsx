import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchAdminMemories,
  updateMemoryStatus,
  fetchReportedComments,
  deleteComment,
} from '../services/api';
import { MemoryContribution, CommentItem } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Trash2,
  Layers,
  Sparkles,
  MapPin,
  ExternalLink,
  Filter,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState<MemoryContribution[]>([]);
  const [reportedComments, setReportedComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'memories' | 'comments' | 'admins'>('memories');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  
  const [adminEmailsList, setAdminEmailsList] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminListLoading, setAdminListLoading] = useState(false);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [mems, comms] = await Promise.all([
        fetchAdminMemories(),
        fetchReportedComments(),
      ]);
      setMemories(mems);
      setReportedComments(comms);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminList = async () => {
    if (!user?.email) return;
    setAdminListLoading(true);
    try {
      const res = await fetch(`/api/admin/emails?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setAdminEmailsList(data.emails || []);
      }
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    } finally {
      setAdminListLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !user?.email) return;
    try {
      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: user.email, newEmail: newAdminEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdminEmailsList(data.emails || []);
        setNewAdminEmail('');
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to add admin');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while adding admin');
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleStatusChange = async (memoryId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await updateMemoryStatus(memoryId, status, user?.id || 'admin-curator');
      setMemories((prev) =>
        prev.map((m) => (m.id === memoryId ? { ...m, verificationStatus: status } : m))
      );
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDeleteReportedComment = async (commentId: string) => {
    if (!confirm('Permanently purge this inappropriate comment from the community layer?')) return;
    try {
      await deleteComment(commentId);
      setReportedComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  const pendingCount = memories.filter((m) => m.verificationStatus === 'PENDING').length;
  const verifiedCount = memories.filter((m) => m.verificationStatus === 'VERIFIED').length;

  const filteredMemories = memories.filter((m) => {
    if (filterStatus === 'ALL') return true;
    return m.verificationStatus === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Curator Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-stone-900 border border-stone-800 text-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            Curatorial Oversight & Moderation Suite
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heritage text-amber-100">
            National Memory Archival Desk
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-xl">
            Logged in as <strong>{user?.name}</strong> (Cultural Curator). Verify crowd-sourced oral
            histories, craft recordings, and purge inappropriate submissions.
          </p>
        </div>

        {/* Metric Badges */}
        <div className="flex gap-2.5">
          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 text-center min-w-[80px]">
            <div className="text-xl font-bold text-amber-400">{pendingCount}</div>
            <div className="text-[10px] text-stone-400 uppercase tracking-wider">Pending Review</div>
          </div>
          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 text-center min-w-[80px]">
            <div className="text-xl font-bold text-emerald-400">{verifiedCount}</div>
            <div className="text-[10px] text-stone-400 uppercase tracking-wider">Archived</div>
          </div>
          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 text-center min-w-[80px]">
            <div className="text-xl font-bold text-red-400">{reportedComments.length}</div>
            <div className="text-[10px] text-stone-400 uppercase tracking-wider">Flagged</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-3 gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('memories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'memories'
                ? 'bg-stone-900 text-amber-400 shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Memory Submissions ({memories.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'comments'
                ? 'bg-stone-900 text-amber-400 shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Flagged Comments ({reportedComments.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('admins');
              if (adminEmailsList.length === 0) fetchAdminList();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'admins'
                ? 'bg-stone-900 text-amber-400 shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Manage Admins
          </button>
        </div>

        {activeTab === 'memories' && (
          <div className="flex items-center gap-1 text-xs">
            {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterStatus === s
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-16 text-center text-xs text-stone-400 animate-pulse">
          Loading curatorial repository records...
        </div>
      ) : activeTab === 'memories' ? (
        filteredMemories.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-3xl border border-stone-200 p-6">
            <p className="text-sm font-semibold text-stone-700">No submissions under this filter.</p>
            <p className="text-xs text-stone-400 mt-1">
              New community or creator memories will appear here automatically for review.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMemories.map((mem) => (
              <div
                key={mem.id}
                className="p-6 rounded-[2rem] bg-white border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group overflow-hidden relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                      {mem.mediaType}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        mem.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : mem.verificationStatus === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {mem.verificationStatus}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-stone-900 font-heritage">{mem.title}</h4>

                  <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{mem.placeName}</span>
                    <span className="text-stone-300">•</span>
                    <span>by {mem.contributorName}</span>
                    <span className="text-[10px] text-stone-400">({mem.contributorRole})</span>
                  </div>

                  <p className="text-xs text-stone-600 mt-3 leading-relaxed bg-stone-50 p-3 rounded-xl">
                    "{mem.content}"
                  </p>

                  {/* AI Metadata Tags */}
                  <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
                    {mem.detectedLanguage && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                        Lang: {mem.detectedLanguage}
                      </span>
                    )}
                    {mem.traditionClassification && (
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">
                        Tradition: {mem.traditionClassification}
                      </span>
                    )}
                    {mem.preservationUrgency && (
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-medium">
                        Urgency: {mem.preservationUrgency}
                      </span>
                    )}
                  </div>
                </div>

                {/* Moderation Actions */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400">
                    {new Date(mem.timestamp).toLocaleString()}
                  </span>

                  <div className="flex items-center gap-2">
                    {mem.verificationStatus !== 'VERIFIED' && (
                      <button
                        onClick={() => handleStatusChange(mem.id, 'VERIFIED')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve & Inscribe
                      </button>
                    )}

                    {mem.verificationStatus !== 'REJECTED' && (
                      <button
                        onClick={() => handleStatusChange(mem.id, 'REJECTED')}
                        className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'comments' ? (
        /* Reported Comments Moderation */
        reportedComments.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-3xl border border-stone-200 p-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-700">Clean Community Stream</p>
            <p className="text-xs text-stone-400 mt-1">No flagged or reported comments at this time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reportedComments.map((comm) => (
              <div
                key={comm.id}
                className="p-4 rounded-2xl bg-white border border-red-200 shadow-xs flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-stone-900">{comm.userName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                      {comm.userRole}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Target: {comm.targetType} #{comm.targetId}
                    </span>
                  </div>

                  <p className="text-xs text-stone-800 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    "{comm.text}"
                  </p>

                  <div className="mt-2 text-xs text-red-700 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    <span>Report reason: {comm.reportReason || 'Flagged by community traveler'}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteReportedComment(comm.id)}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Purge Comment
                </button>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'admins' ? (
        <div className="max-w-xl py-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm mb-6">
            <h3 className="font-bold text-lg font-heritage text-stone-900 mb-2">Authorize New Admin</h3>
            <p className="text-xs text-stone-500 mb-4">
              Add the email address of a new Cultural Curator. They will be granted full admin permissions.
            </p>
            <form onSubmit={handleAddAdmin} className="flex gap-2">
              <input
                type="email"
                placeholder="curator@aarambh.gov.in"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Authorize
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
            <h3 className="font-bold text-lg font-heritage text-stone-900 mb-4">Active Authorized Curators</h3>
            {adminListLoading ? (
              <p className="text-xs text-stone-400 animate-pulse">Loading list...</p>
            ) : adminEmailsList.length > 0 ? (
              <ul className="space-y-3">
                {adminEmailsList.map((email) => (
                  <li key={email} className="flex items-center justify-between p-3 rounded-xl border border-stone-100 bg-stone-50">
                    <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      {email}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-400">No authorized emails found.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
