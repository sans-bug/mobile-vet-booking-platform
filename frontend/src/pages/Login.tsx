import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Activity, LogIn, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleMock = async () => {
    setLoading(true);
    try {
      await googleLogin({
        email: 'google_user@vetconnect.com',
        name: 'Alex Rivera',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        googleId: 'g_mock_99218201',
      });
      navigate('/');
    } catch (err: any) {
      setError('Google Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950/20 relative overflow-hidden font-sans">
      {/* Decorative Blur Spheres */}
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
          <h2 className="text-2xl font-black tracking-tight">Welcome Back!</h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Sign in to manage your pets and appointments
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-600 dark:text-red-400 text-xs p-3.5 rounded-xl text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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

            <div>
              <label className="block text-xs font-bold mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-800 dark:text-slate-100"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-500 dark:text-slate-400">
              <input type="checkbox" className="rounded text-primary focus:ring-primary h-4 w-4" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-primary font-bold hover:underline">
              Forgot Password?
            </Link>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-primary-dark/20 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
            >
              <LogIn className="h-5 w-5" />
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            </button>

            {/* Google Authentication Selector */}
            <button
              type="button"
              onClick={handleGoogleMock}
              disabled={loading}
              className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-200 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50 shadow-sm"
            >
              <Sparkles className="h-5 w-5 text-accent animate-pulse" />
              <span>Continue with Google</span>
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          New to VetConnect?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Create an account
          </Link>
        </p>

        {/* Demo Credentials Alert Helper */}
        <div className="mt-6 bg-primary/5 rounded-2xl p-4 border border-primary/10 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <p className="font-bold text-primary mb-1">💡 Demo Test Accounts:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li><strong>Admin</strong>: admin@vetconnect.com / admin123</li>
            <li><strong>Pet Owner</strong>: user@vetconnect.com / user123</li>
            <li><strong>Doctor</strong>: vet1@vetconnect.com / vet123</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
