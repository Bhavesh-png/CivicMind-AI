import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Building2, ArrowLeft, Globe } from 'lucide-react';

interface LoginPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

type UserRole = 'Citizen' | 'Government' | 'Admin';

export const LoginPage: React.FC<LoginPageProps> = ({ onBack, onSuccess }) => {
  const { login, loginWithFirebaseGoogle } = useAuth();
  
  const [role, setRole] = useState<UserRole>('Citizen');
  const [email, setEmail] = useState('citizen@civicmind.gov');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto populate mock credentials when role switches
  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'Citizen') {
      setEmail('citizen@civicmind.gov');
    } else if (selectedRole === 'Government') {
      setEmail('officer@civicmind.gov');
    } else {
      setEmail('admin@civicmind.gov');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const success = await login(email, password, role);
    if (success) {
      onSuccess();
    } else {
      setError('Invalid login credentials. Please check connection and try again.');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const success = await loginWithFirebaseGoogle();
      if (success) onSuccess();
    } catch (e) {
      setError('Google Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center px-4 relative select-none">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
      >
        <ArrowLeft size={14} />
        Back to Landing Page
      </button>

      {/* Main card */}
      <div className="w-full max-w-md glass-card p-8 border border-slate-200 dark:border-slate-800/80 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Banner Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 gradient-primary rounded-2xl text-white shadow-md">
            <ShieldCheck size={28} />
          </div>
          <h2 className="font-extrabold text-2xl bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            CivicMind AI
          </h2>
          <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
            Login to access Decision Portal
          </span>
        </div>

        {/* Error alert */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Role Selectors */}
        <div className="grid grid-cols-3 gap-2.5">
          {(['Citizen', 'Government', 'Admin'] as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleChange(r)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                role === r 
                  ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400'
              }`}
            >
              {r === 'Citizen' && <User size={16} className="mb-1" />}
              {r === 'Government' && <Building2 size={16} className="mb-1" />}
              {r === 'Admin' && <ShieldCheck size={16} className="mb-1" />}
              {r}
            </button>
          ))}
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-blue-500/20 mt-2 flex items-center justify-center"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          <span className="text-[10px] font-bold text-slate-400 mx-3 uppercase">OR CONTINUE WITH</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
        </div>

        {/* Google / Firebase sign-in button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full py-3.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <Globe size={16} className="text-blue-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Sign In with Firebase Google Auth</span>
        </button>
      </div>
      
      {/* Bottom context hints */}
      <span className="text-[10px] text-slate-400 mt-6 max-w-xs text-center leading-relaxed">
        Tip: Firebase Authentication is fully simulated for fast hackathon validation. Use the Google Auth button for instant administrative clearance!
      </span>
    </div>
  );
};
