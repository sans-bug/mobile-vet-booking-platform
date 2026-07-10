import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Bell, Menu, X, LogOut, User, Activity, AlertOctagon, MessageCircle } from 'lucide-react';
import axios from 'axios';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const Navbar: React.FC = () => {
  const { user, logout, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);


  useEffect(() => {
    if (!token) return;

    const loadNotifs = async () => {
      try {
        const res = await axios.get('/notifications');
        if (res.data.success) {
          setNotifications(res.data.notifications);
          setUnreadCount(res.data.notifications.filter((n: NotificationItem) => !n.isRead).length);
        }
      } catch (err) {
        // Silently fail — notifications are non-critical
      }
    };

    loadNotifs();
    const interval = setInterval(loadNotifs, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [token]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'veterinarian') return '/vet';
    return '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-primary" />
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-sans">
                VetConnect
              </span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-secondary font-medium transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-secondary font-medium transition-colors">
              About
            </Link>
            <Link to="/services" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-secondary font-medium transition-colors">
              Services
            </Link>
            <Link to="/vets" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-secondary font-medium transition-colors">
              Veterinarians
            </Link>
            <Link to="/contact" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-secondary font-medium transition-colors">
              Contact
            </Link>
          </div>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-accent" /> : <Moon className="h-5 w-5" />}
            </button>

            {token && (
              <div className="relative">
                {/* Notifications Bell */}
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl shadow-lg py-2 z-50 animate-float text-slate-800 dark:text-slate-200">
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <span className="font-bold text-sm">Notifications</span>
                      <button onClick={markAllRead} className="text-xs text-primary font-semibold hover:underline">
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-slate-400">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n._id} className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800/50 ${!n.isRead ? 'bg-primary/5' : ''}`}>
                            <div className="font-semibold text-xs flex justify-between">
                              <span>{n.title}</span>
                              <span className="text-[9px] text-slate-400">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile or Login */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={getDashboardLink()}
                  className="flex items-center space-x-2 py-1.5 px-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt="avatar"
                    className="h-8 w-8 rounded-full border border-primary/20 object-cover"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold leading-tight">{user.name}</p>
                    <p className="text-[9px] text-slate-400 capitalize leading-none">{user.role.replace('_', ' ')}</p>
                  </div>
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-primary font-medium text-sm">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-5 rounded-full text-sm shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-accent" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-slate-200 dark:border-slate-800 animate-fade-in py-2 px-4 space-y-2">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block py-2 px-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setIsOpen(false)}
            className="block py-2 px-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
          >
            About
          </Link>
          <Link
            to="/services"
            onClick={() => setIsOpen(false)}
            className="block py-2 px-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
          >
            Services
          </Link>
          <Link
            to="/vets"
            onClick={() => setIsOpen(false)}
            className="block py-2 px-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
          >
            Veterinarians
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className="block py-2 px-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
          >
            Contact
          </Link>
          {user ? (
            <>
              <Link
                to={getDashboardLink()}
                onClick={() => setIsOpen(false)}
                className="block py-2 px-3 rounded-lg text-primary font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Dashboard Portal
              </Link>
              <button
                onClick={() => { logout(); setIsOpen(false); navigate('/'); }}
                className="w-full text-left py-2 px-3 rounded-lg text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center space-x-2"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="pt-4 pb-2 border-t border-slate-100 dark:border-slate-850 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="text-center py-2 rounded-lg font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="text-center py-2 rounded-lg font-bold bg-primary hover:bg-primary-dark text-white"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
