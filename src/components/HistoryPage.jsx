import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Calendar, Layers, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HistoryPage() {
  const { authFetch } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch('/api/history');
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setHistory(data.history || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      const res = await authFetch(`/api/history/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setHistory(prev => prev.filter(h => h._id !== id));
    } catch (e) {
      alert('Delete error: ' + e.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-brand-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-indigo-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Layers className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">Learning History</h1>
            </div>
            <Link to="/multi" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
              New Session
            </Link>
          </div>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-100 text-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
          {!loading && !error && history.length === 0 && (
            <p className="text-center text-gray-600 py-12">No saved sessions yet. Start by processing sources!</p>
          )}
          {!loading && !error && history.length > 0 && (
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry._id} className="group p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-indigo-300 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(entry.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {entry.sources?.map((src, i) => (
                          <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                            {src.type === 'youtube' ? `📺 Video` : src.type === 'pdf' ? '📄 PDF' : '🌐 Blog'}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-2">{entry.summary?.substring(0, 200)}...</p>
                      {entry.quiz && entry.quiz.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">Quiz: {entry.quiz.length} questions</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition opacity-60 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
