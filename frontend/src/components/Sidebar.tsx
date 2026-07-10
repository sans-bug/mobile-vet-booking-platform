import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Dog,
  Calendar,
  MessageSquare,
  Settings,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  if (!user) return null;

  const renderNavItems = () => {
    switch (user.role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'users', label: 'Manage Users', icon: Users },
          { id: 'vets', label: 'Verify Doctors', icon: UserCheck },
          { id: 'sos', label: 'Emergency SOS', icon: AlertTriangle },
          { id: 'settings', label: 'Profile Settings', icon: Settings },
        ];
      case 'veterinarian':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'appointments', label: 'Appointments', icon: Calendar },
          { id: 'availability', label: 'My Availability', icon: Clock },
          { id: 'chat', label: 'Live Chat', icon: MessageSquare },
          { id: 'settings', label: 'Vet Profile', icon: Settings },
        ];
      case 'pet_owner':
      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'pets', label: 'My Pets', icon: Dog },
          { id: 'appointments', label: 'Bookings', icon: Calendar },
          { id: 'chat', label: 'Live Chat', icon: MessageSquare },
          { id: 'settings', label: 'Account Details', icon: Settings },
        ];
    }
  };

  const navItems = renderNavItems();

  return (
    <aside className="w-full md:w-64 glass-panel md:min-h-[calc(100vh-4rem)] p-6 md:sticky md:top-16 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation Portal
          </h3>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="hidden md:block pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
            alt="user-avatar"
            className="h-9 w-9 rounded-full object-cover border border-primary/20"
          />
          <div className="truncate">
            <p className="text-xs font-bold truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
