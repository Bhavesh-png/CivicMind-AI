import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Send, Check } from 'lucide-react';
import { api } from '../utils/api';

export const Feedback: React.FC = () => {

  
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Utilities');
  const [zone, setZone] = useState('Zone 1');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchComplaints = async () => {
    try {
      const list = await api.listComplaints();
      setComplaints(list);
    } catch (e) {
      console.error("Failed to load feedback list", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    
    setSubmitting(true);
    setSuccessMsg('');
    try {
      await api.submitComplaint(title, description, category, zone);
      setSuccessMsg('Complaint registered! AI has analyzed priority and sentiment.');
      setTitle('');
      setDescription('');
      
      // Reload complaints
      await fetchComplaints();
      
      // Clear success notification after 5s
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (error) {
      console.error("Failed to file complaint", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Badge stylings
  const getPriorityStyle = (priority: string) => {
    if (priority === 'High') return 'bg-red-500/10 text-red-500 border border-red-500/20';
    if (priority === 'Medium') return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    return 'bg-green-500/10 text-green-500 border border-green-500/20';
  };

  const getStatusStyle = (status: string) => {
    if (status === 'Resolved') return 'bg-green-500 text-white';
    if (status === 'In Progress') return 'bg-blue-600 text-white';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
  };

  const getSentimentStyle = (sentiment: string) => {
    if (sentiment === 'Positive') return 'text-green-500 font-bold';
    if (sentiment === 'Negative') return 'text-red-500 font-bold';
    return 'text-slate-400 font-medium';
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      
      {/* Header */}
      <div>
        <h2 className="font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <MessageSquare className="text-blue-500" />
          Citizen Feedback & Complaint Center
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          File municipal complaints. AI automatically classifies category, priority, sentiment, and drafts briefs for dispatch teams
        </p>
      </div>

      {/* Main Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Submission Intake Form */}
        <div className="glass-card p-6 border border-slate-200 dark:border-slate-800/80 shadow-md space-y-4">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-blue-500" />
            <h3 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              File New Incident Report
            </h3>
          </div>

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-semibold flex items-center gap-2">
              <Check size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Issue Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken pipe leakage on Main Road"
                className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Detailed Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the incident in detail, including street marks, duration, and safety issues..."
                className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100 resize-none"
              />
            </div>

            {/* Grid selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                >
                  <option>Utilities</option>
                  <option>Traffic</option>
                  <option>Environment</option>
                  <option>Healthcare</option>
                  <option>Public Services</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Zone Area</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                >
                  <option>Zone 1</option>
                  <option>Zone 2</option>
                  <option>Zone 3</option>
                  <option>Zone 4</option>
                  <option>Zone 5</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20"
            >
              <Send size={14} />
              <span>{submitting ? 'Running NLP Tagging...' : 'File Official Complaint'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Complaints Registry */}
        <div className="lg:col-span-2 glass-card p-6 border border-slate-200 dark:border-slate-800/80 shadow-md flex flex-col justify-between min-h-[400px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Active Complaints Database
              </span>
              <span className="text-[10px] text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full font-bold">
                Synced to BigQuery
              </span>
            </div>

            <div className="overflow-x-auto w-full">
              {loading ? (
                <div className="py-16 text-center text-xs font-semibold text-slate-400">
                  <span className="animate-pulse">Loading citizen registry...</span>
                </div>
              ) : complaints.length === 0 ? (
                <div className="py-16 text-center text-xs font-semibold text-slate-400">
                  No citizen complaints logged.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                      <th className="py-3 px-2">ID</th>
                      <th className="py-3 px-2">Complaint Info</th>
                      <th className="py-3 px-2 text-center">Category</th>
                      <th className="py-3 px-2 text-center">Urgency</th>
                      <th className="py-3 px-2 text-center">Sentiment</th>
                      <th className="py-3 px-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((c) => (
                      <tr 
                        key={c.id} 
                        className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 text-xs transition"
                      >
                        <td className="py-3 px-2 font-bold text-slate-400">{c.id}</td>
                        <td className="py-3 px-2 max-w-[200px]">
                          <div className="font-semibold truncate">{c.title}</div>
                          <div className="text-[10px] text-slate-400 italic mt-0.5 line-clamp-1">
                            {c.ai_summary}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {c.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${getPriorityStyle(c.priority)}`}>
                            {c.priority}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`text-[10px] ${getSentimentStyle(c.sentiment)}`}>
                            {c.sentiment}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${getStatusStyle(c.status)}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[9px] text-slate-400 font-semibold italic text-center">
            NLP analysis processes user descriptions within 200ms of submission.
          </div>
        </div>

      </div>
    </div>
  );
};
