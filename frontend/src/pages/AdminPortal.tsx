import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Users,
  Calendar,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Trash2,
  Activity,
  ShieldCheck
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const AdminPortal: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  const [analytics, setAnalytics] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [vetsList, setVetsList] = useState<any[]>([]);
  const [sosList, setSosList] = useState<any[]>([]);

  const loadData = async () => {
    try {
      // 1. Load Analytics
      const analRes = await axios.get('/analytics/admin').catch(() => null);
      if (analRes && analRes.data.success) {
        setAnalytics(analRes.data);
      }

      // 2. Load Users
      const usersRes = await axios.get('/admin/users');
      if (usersRes.data.success) {
        setUsersList(usersRes.data.users);
      }

      // 3. Load Vets
      const vetsRes = await axios.get('/admin/vets');
      if (vetsRes.data.success) {
        setVetsList(vetsRes.data.veterinarians);
      }

      // 4. Load SOS requests
      const sosRes = await axios.get('/emergencies/requests');
      if (sosRes.data.success) {
        setSosList(sosRes.data.emergencies);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      const res = await axios.delete(`/admin/users/${id}`);
      if (res.data.success) {
        alert('User removed successfully.');
        loadData();
      }
    } catch (err) {
      console.error(err);
      alert('Delete failed.');
    }
  };

  const handleVerifyVet = async (id: string, status: string) => {
    try {
      const res = await axios.put(`/admin/vets/${id}/verify`, { status });
      if (res.data.success) {
        alert(`Veterinarian verification updated: ${status.toUpperCase()}`);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveSOS = async (id: string, status: string) => {
    try {
      const res = await axios.put(`/emergencies/requests/${id}/respond`, { status });
      if (res.data.success) {
        alert(`SOS emergency status updated: ${status}`);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Compile charts configurations
  const getRevenueChart = () => {
    if (!analytics || !analytics.charts || !analytics.charts.monthlyRevenue) return null;
    const data = analytics.charts.monthlyRevenue;
    return {
      labels: data.map((d: any) => d.label),
      datasets: [
        {
          label: 'Platform Revenue ($ USD)',
          data: data.map((d: any) => d.revenue),
          borderColor: '#2E8B57',
          backgroundColor: 'rgba(46, 139, 87, 0.1)',
          tension: 0.3,
          fill: true,
        }
      ]
    };
  };

  const getPetChart = () => {
    if (!analytics || !analytics.charts || !analytics.charts.petDistribution) return null;
    const data = analytics.charts.petDistribution;
    return {
      labels: data.map((d: any) => d.label),
      datasets: [
        {
          data: data.map((d: any) => d.count),
          backgroundColor: ['#2E8B57', '#50C878', '#FFB703', '#cbd5e1'],
          borderWidth: 0,
        }
      ]
    };
  };

  const getServicesChart = () => {
    if (!analytics || !analytics.charts || !analytics.charts.serviceDistribution) return null;
    const data = analytics.charts.serviceDistribution;
    return {
      labels: data.map((d: any) => d.label),
      datasets: [
        {
          label: 'Appointments',
          data: data.map((d: any) => d.count),
          backgroundColor: '#50C878',
          borderWidth: 0,
        }
      ]
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 min-h-[calc(100vh-4rem)] text-slate-800 dark:text-slate-200">
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 space-y-6">
        
        {/* TAB 1: Dashboard Analytics */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-2xl font-black font-sans leading-none">Admin Management Portal</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Hello, Administrator. Review global platform indices and audits.</p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="p-6 bg-white dark:bg-slate-900 border rounded-3xl flex items-center space-x-4">
                <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Users className="h-5 w-5" /></div>
                <div><span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wide">Total Users</span><span className="text-lg font-black">{analytics?.summary?.usersCount || 0} Registered</span></div>
              </div>
              <div className="p-6 bg-white dark:bg-slate-900 border rounded-3xl flex items-center space-x-4">
                <div className="h-10 w-10 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary"><DollarSign className="h-5 w-5" /></div>
                <div><span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wide">Total Revenues</span><span className="text-lg font-black">${analytics?.summary?.revenue || 0}</span></div>
              </div>
              <div className="p-6 bg-white dark:bg-slate-900 border rounded-3xl flex items-center space-x-4">
                <div className="h-10 w-10 bg-orange-100 dark:bg-orange-950/20 text-orange-500 rounded-2xl flex items-center justify-center"><Calendar className="h-5 w-5" /></div>
                <div><span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wide">Bookings Scheduled</span><span className="text-lg font-black">{analytics?.summary?.bookingsCount || 0} Visits</span></div>
              </div>
              <div className="p-6 bg-white dark:bg-slate-900 border rounded-3xl flex items-center space-x-4">
                <div className="h-10 w-10 bg-red-100 dark:bg-red-950/20 text-red-500 rounded-2xl flex items-center justify-center animate-pulse"><AlertTriangle className="h-5 w-5" /></div>
                <div><span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wide">Active SOS Dispatches</span><span className="text-lg font-black text-red-500">{analytics?.summary?.activeSOS || 0} Active</span></div>
              </div>
            </div>

            {/* Charts distributions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Monthly Revenues Trend</h4>
                <div className="h-56">
                  {getRevenueChart() ? <Line data={getRevenueChart()!} options={{ responsive: true, maintainAspectRatio: false }} /> : <div className="h-full flex items-center justify-center text-xs text-slate-400">No chart data</div>}
                </div>
              </div>
              
              {/* Pets Species */}
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-3xl border space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Pet Species Ratios</h4>
                <div className="h-56 flex items-center justify-center">
                  {getPetChart() ? <Doughnut data={getPetChart()!} options={{ responsive: true, maintainAspectRatio: false }} /> : <div className="h-full flex items-center justify-center text-xs text-slate-400">No data</div>}
                </div>
              </div>

              {/* Service Categories */}
              <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-3xl border space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Service Category Bookings</h4>
                <div className="h-56">
                  {getServicesChart() ? <Bar data={getServicesChart()!} options={{ responsive: true, maintainAspectRatio: false }} /> : <div className="h-full flex items-center justify-center text-xs text-slate-400">No data</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Users Administration */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border space-y-6 animate-fade-in">
            <h1 className="text-xl font-sans font-black leading-none">Registered Accounts</h1>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {usersList.map((usr) => (
                    <tr key={usr._id} className="text-slate-700 dark:text-slate-350">
                      <td className="py-3.5 font-bold">{usr.name}</td>
                      <td className="py-3.5">{usr.email}</td>
                      <td className="py-3.5 capitalize font-semibold">{usr.role.replace('_', ' ')}</td>
                      <td className="py-3.5">{usr.phone || 'N/A'}</td>
                      <td className="py-3.5 text-right">
                        {usr.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(usr._id)}
                            className="text-red-500 hover:text-red-600 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
                            title="Delete User Account"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Doctor Licensing Verifications */}
        {activeTab === 'vets' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border space-y-6 animate-fade-in">
            <h1 className="text-xl font-sans font-black leading-none">Veterinarians Verification Audit</h1>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase">
                    <th className="pb-3">Doctor</th>
                    <th className="pb-3">License Number</th>
                    <th className="pb-3">Clinic & Specialty</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Verify Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {vetsList.map((vet) => (
                    <tr key={vet._id} className="text-slate-700 dark:text-slate-350">
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={vet.userId?.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100'}
                            alt="avatar"
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-bold">{vet.userId?.name}</p>
                            <p className="text-[10px] text-slate-400">{vet.userId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-mono font-bold text-slate-600 dark:text-slate-400">{vet.licenseNumber}</td>
                      <td className="py-4">
                        <p className="font-semibold">{vet.specialization}</p>
                        <p className="text-[10px] text-slate-400 leading-tight">{vet.clinicName}</p>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          vet.verificationStatus === 'approved'
                            ? 'bg-secondary/15 text-secondary'
                            : vet.verificationStatus === 'rejected'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-orange-500/10 text-orange-500'
                        }`}>
                          {vet.verificationStatus}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {vet.verificationStatus === 'pending' && (
                          <div className="flex justify-end space-x-1.5">
                            <button
                              onClick={() => handleVerifyVet(vet._id, 'approved')}
                              className="bg-secondary text-white py-1 px-3 rounded-lg hover:bg-secondary/80 transition-all font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerifyVet(vet._id, 'rejected')}
                              className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition-all font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Emergency SOS Monitoring */}
        {activeTab === 'sos' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border space-y-6 animate-fade-in">
            <h1 className="text-xl font-sans font-black leading-none">Emergency SOS Log Feed</h1>

            <div className="space-y-4">
              {sosList.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">No active SOS dispatch signals logged.</div>
              ) : (
                sosList.map((sos) => (
                  <div key={sos._id} className="p-4 bg-red-500/5 dark:bg-red-950/10 border border-red-500/20 rounded-2xl text-xs space-y-3 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-red-500 text-white py-0.5 px-2 rounded-full font-bold uppercase tracking-wider text-[9px]">
                          SOS: {sos.status.toUpperCase()}
                        </span>
                        <h4 className="font-extrabold text-sm mt-2">Owner: {sos.ownerId?.name}</h4>
                        <p className="text-slate-400 mt-1">Phone: {sos.contactPhone} • Pet ID: {sos.petId?.name || 'N/A'}</p>
                        <p className="text-slate-400 mt-0.5">Coordinates: Lat {sos.location.lat}, Lng {sos.location.lng}</p>
                        <p className="text-red-600 dark:text-red-400 font-bold mt-1">Symptom Notes: {sos.notes || 'No description provided'}</p>
                      </div>
                      
                      {sos.status === 'pending' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleResolveSOS(sos._id, 'dispatched')}
                            className="bg-primary text-white py-1 px-3 rounded-lg font-bold"
                          >
                            Mark Dispatch
                          </button>
                          <button
                            onClick={() => handleResolveSOS(sos._id, 'resolved')}
                            className="bg-secondary text-white py-1 px-3 rounded-lg font-bold"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
