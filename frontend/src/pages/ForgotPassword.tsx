import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Activity, ArrowLeft, Key } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setMessage(res.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to dispatch recovery instructions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950/20 relative overflow-hidden font-sans">
      <div className="absolute top-20 left-20 h-72 w-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 h-72 w-72 bg-secondary/10 rounded-full blur-3xl" />

      <div className="max-w-md w-full space-y-8 glass-panel p-8 rounded-3xl shadow-xl z-10 border border-slate-200/50 dark:border-slate-800/40 text-slate-800 dark:text-slate-200">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <Activity className="h-10 w-10 text-primary" />
            <span className="font-extrabold text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              VetConnect
            </span>
          </Link>
          <h2 className="text-2xl font-black tracking-tight">Recover Password</h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Enter your email address to receive password reset links
          </p>
        </div>

        {message && (
          <div className="bg-primary/5 border border-primary/20 text-primary text-xs p-3.5 rounded-xl text-center leading-relaxed">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-600 dark:text-red-400 text-xs p-3.5 rounded-xl text-center">
            {error}
          </div>
        )}

        {!message && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@vetconnect.com"
                  className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-800 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-primary-dark/20 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
            >
              <Key className="h-5 w-5" />
              <span>{loading ? 'Sending Link...' : 'Send Recovery Link'}</span>
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/login" className="inline-flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
