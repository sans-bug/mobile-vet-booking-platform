import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  Dog,
  Plus,
  Trash2,
  Calendar,
  FileText,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Award,
  Sparkles
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const PetOwnerPortal: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Pets states
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  
  // Weight & Vaccines additions
  const [weightValue, setWeightValue] = useState('');
  const [vaccineName, setVaccineName] = useState('');
  const [vaccineAdmin, setVaccineAdmin] = useState('');
  const [vaccineNext, setVaccineNext] = useState('');

  // Bookings state
  const [bookings, setBookings] = useState<any[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Chat states
  const [vets, setVets] = useState<any[]>([]);
  const [selectedVetId, setSelectedVetId] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Profile Edit states
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editStreet, setEditStreet] = useState(user?.address?.street || '');
  const [editCity, setEditCity] = useState(user?.address?.city || '');

  const loadData = async () => {
    try {
      // Load Pets
      const petRes = await axios.get('/pets');
      if (petRes.data.success) {
        setPets(petRes.data.pets);
        if (petRes.data.pets.length > 0 && !selectedPet) {
          setSelectedPet(petRes.data.pets[0]);
        }
      }

      // Load Bookings
      const bookRes = await axios.get('/bookings');
      if (bookRes.data.success) {
        setBookings(bookRes.data.bookings);
      }

      // Load Vets for Chat
      const vetsRes = await axios.get('/bookings/vets');
      if (vetsRes.data.success) {
        setVets(vetsRes.data.veterinarians);
        if (vetsRes.data.veterinarians.length > 0) {
          setSelectedVetId(vetsRes.data.veterinarians[0].userId._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Poll chat messages
  useEffect(() => {
    if (activeTab !== 'chat' || !selectedVetId) return;

    const loadMessages = async () => {
      try {
        const res = await axios.get(`/chat/messages/${selectedVetId}`);
        if (res.data.success) {
          setChatMessages(res.data.messages);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [activeTab, selectedVetId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      const res = await axios.post('/chat/messages', {
        receiverId: selectedVetId,
        text: chatInput,
      });
      if (res.data.success) {
        setChatMessages(prev => [...prev, res.data.message]);
        setChatInput('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddWeight = async () => {
    if (!weightValue || !selectedPet) return;
    try {
      const res = await axios.post(`/pets/${selectedPet._id}/weight`, { weight: Number(weightValue) });
      if (res.data.success) {
        const updatedPet = { ...selectedPet, weightHistory: res.data.weightHistory };
        setSelectedPet(updatedPet);
        setPets(prev => prev.map(p => p._id === selectedPet._id ? updatedPet : p));
        setWeightValue('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddVaccine = async () => {
    if (!vaccineName || !vaccineAdmin || !vaccineNext || !selectedPet) return;
    try {
      const res = await axios.post(`/pets/${selectedPet._id}/vaccination`, {
        vaccineName,
        dateAdministered: vaccineAdmin,
        nextDueDate: vaccineNext
      });
      if (res.data.success) {
        const updatedPet = { ...selectedPet, vaccinationRecords: res.data.vaccinationRecords };
        setSelectedPet(updatedPet);
        setPets(prev => prev.map(p => p._id === selectedPet._id ? updatedPet : p));
        setVaccineName('');
        setVaccineAdmin('');
        setVaccineNext('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        name: editName,
        phone: editPhone,
        address: { street: editStreet, city: editCity }
      });
      alert('Profile updated successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      const res = await axios.post('/reviews', {
        appointmentId: selectedApptId,
        rating,
        reviewText
      });
      if (res.data.success) {
        alert('Thank you for your feedback!');
        setShowReviewModal(false);
        setReviewText('');
        loadData();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to post review. You might have already reviewed it.');
    }
  };

  // Compile growth data for chart
  const getChartData = () => {
    if (!selectedPet || !selectedPet.weightHistory || selectedPet.weightHistory.length === 0) return null;
    
    const sorted = [...selectedPet.weightHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return {
      labels: sorted.map(item => new Date(item.date).toLocaleDateString([], { month: 'short', year: '2-digit' })),
      datasets: [
        {
          label: 'Weight (kg)',
          data: sorted.map(item => item.weight),
          borderColor: '#2E8B57',
          backgroundColor: 'rgba(46, 139, 87, 0.1)',
          tension: 0.3,
          fill: true,
        }
      ]
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 min-h-[calc(100vh-4rem)] text-slate-800 dark:text-slate-200">
      
      {/* Portals Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Portal Main View Area */}
      <main className="flex-1 space-y-6">
        
        {/* TAB 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-black font-sans leading-none">Pet Owner Portal</h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Hello, {user?.name}. Monitor physical parameters and scheduler logs.</p>
              </div>
              <button
                onClick={() => navigate('/book')}
                className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition-all"
              >
                Book Appointment
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-250/10 dark:border-slate-800 rounded-3xl flex items-center space-x-4">
                <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Dog className="h-5 w-5" /></div>
                <div><span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wide">My Pets</span><span className="text-xl font-black">{pets.length} Registered</span></div>
              </div>
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-250/10 dark:border-slate-800 rounded-3xl flex items-center space-x-4">
                <div className="h-10 w-10 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary"><Calendar className="h-5 w-5" /></div>
                <div><span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wide">Upcoming Visits</span><span className="text-xl font-black">{bookings.filter(b => b.status === 'confirmed').length} Active</span></div>
              </div>
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-250/10 dark:border-slate-800 rounded-3xl flex items-center space-x-4">
                <div className="h-10 w-10 bg-red-100 dark:bg-red-950/20 text-red-500 rounded-2xl flex items-center justify-center"><AlertTriangle className="h-5 w-5" /></div>
                <div><span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wide">Emergency Services</span><span className="text-xs font-bold block text-red-500">SOS Location Activated</span></div>
              </div>
            </div>

            {/* Active booking cards */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500">Upcoming Appointments</h3>
              {bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800 text-xs text-slate-400">
                  No active bookings. Use the button above to schedule a visit.
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').map((b) => (
                    <div key={b._id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl flex justify-between items-center text-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${b.status === 'confirmed' ? 'bg-secondary' : 'bg-orange-500'}`} />
                          <h4 className="font-bold text-sm">{b.service}</h4>
                        </div>
                        <p className="text-slate-450 dark:text-slate-400 mt-1">Doctor: {b.vetId.userId.name} ({b.vetId.clinicName})</p>
                        <p className="text-slate-400 mt-0.5">Pet: {b.petId.name} • {new Date(b.date).toDateString()} at {b.timeSlot}</p>
                      </div>
                      <span className="font-extrabold text-primary text-sm">${b.consultingFee} Paid</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Manage Pets */}
        {activeTab === 'pets' && (
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-2xl font-black font-sans leading-none">Pet Growth & Health Tracker</h1>
            
            {pets.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl text-xs text-slate-400">
                No registered pets. Go to the booking flow or add one.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Pets Sidebar selector */}
                <div className="lg:col-span-1 space-y-3">
                  {pets.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => setSelectedPet(p)}
                      className={`w-full text-left p-4 rounded-2xl border flex items-center space-x-3 transition-all ${
                        selectedPet?._id === p._id
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/30'
                      }`}
                    >
                      <img
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100'}
                        alt={p.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="truncate">
                        <p className="font-bold text-sm leading-tight">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{p.breed}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Pet physical records */}
                {selectedPet && (
                  <div className="lg:col-span-2 space-y-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <img
                          src={selectedPet.imageUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150'}
                          alt={selectedPet.name}
                          className="h-14 w-14 rounded-full object-cover border"
                        />
                        <div>
                          <h2 className="text-lg font-black leading-tight">{selectedPet.name}</h2>
                          <p className="text-xs text-primary font-semibold">{selectedPet.breed} • {selectedPet.species}</p>
                        </div>
                      </div>
                    </div>

                    {/* Growth Weight Tracker Chart */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-455">Weight Growth Chart</h4>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            value={weightValue}
                            onChange={(e) => setWeightValue(e.target.value)}
                            placeholder="kg"
                            className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-1 px-3 text-xs w-16"
                          />
                          <button onClick={handleAddWeight} className="bg-primary text-white rounded-xl py-1 px-3 text-xs font-bold flex items-center space-x-1">
                            <Plus className="h-3 w-3" /> <span>Log</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="h-48 bg-slate-50 dark:bg-slate-950/20 rounded-2xl p-4 flex items-center justify-center">
                        {getChartData() ? (
                          <Line data={getChartData()!} options={{ responsive: true, maintainAspectRatio: false }} />
                        ) : (
                          <p className="text-[10px] text-slate-400">Add weight logs to plot the growth tracker.</p>
                        )}
                      </div>
                    </div>

                    {/* Vaccines card */}
                    <div className="space-y-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-455 flex items-center space-x-1.5">
                        <Award className="h-4 w-4 text-primary" /> <span>Vaccination Record Card</span>
                      </h4>

                      <div className="space-y-2">
                        {selectedPet.vaccinationRecords.map((vac: any, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950/25 rounded-2xl flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-sm text-slate-800 dark:text-white">{vac.vaccineName}</p>
                              <p className="text-slate-400 text-[10px] mt-0.5">Administered: {new Date(vac.dateAdministered).toLocaleDateString()}</p>
                            </div>
                            <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full text-[9px] font-bold">
                              Due: {new Date(vac.nextDueDate).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Log vaccine */}
                      <div className="p-4 bg-slate-100/50 dark:bg-slate-950/20 rounded-2xl space-y-3">
                        <p className="text-[10px] font-bold text-primary uppercase">Manual Immunization Entry</p>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={vaccineName}
                            onChange={(e) => setVaccineName(e.target.value)}
                            placeholder="Vaccine (e.g. Rabies)"
                            className="bg-white dark:bg-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                          />
                          <input
                            type="date"
                            value={vaccineAdmin}
                            onChange={(e) => setVaccineAdmin(e.target.value)}
                            placeholder="Date"
                            className="bg-white dark:bg-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                          />
                          <input
                            type="date"
                            value={vaccineNext}
                            onChange={(e) => setVaccineNext(e.target.value)}
                            placeholder="Due Date"
                            className="bg-white dark:bg-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                          />
                        </div>
                        <button onClick={handleAddVaccine} className="w-full bg-primary text-white py-1.5 rounded-xl text-xs font-bold shadow hover:bg-primary-dark transition-all">
                          Record Vaccination
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Booking History */}
        {activeTab === 'appointments' && (
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-2xl font-black font-sans leading-none">Appointment Log Book</h1>

            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl text-xs text-slate-400">
                  No appointments registered.
                </div>
              ) : (
                bookings.map((b) => (
                  <div key={b._id} className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl text-xs space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          b.status === 'completed' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                        }`}>
                          {b.status}
                        </span>
                        <h3 className="font-extrabold text-sm mt-2">{b.service}</h3>
                        <p className="text-slate-400 mt-1">Doctor: {b.vetId.userId.name} • Pet: {b.petId.name}</p>
                        <p className="text-[10px] text-slate-450 mt-0.5">{new Date(b.date).toDateString()} at {b.timeSlot}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm block">${b.consultingFee}</span>
                        <span className="text-[10px] text-slate-400 capitalize">Paid via {b.visitType.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {/* Prescription and Reports */}
                    {b.status === 'completed' && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl space-y-3 border border-slate-100 dark:border-slate-850">
                        {b.prescription?.notes && (
                          <div>
                            <p className="font-extrabold text-[10px] text-primary uppercase">Prescription Issued:</p>
                            <p className="text-slate-600 dark:text-slate-350 mt-1">{b.prescription.notes}</p>
                            {b.prescription.medicines.map((m: any, idx: number) => (
                              <p key={idx} className="text-[10px] text-slate-500 font-bold ml-2 mt-0.5">• {m.name} - {m.dosage} ({m.frequency} for {m.duration})</p>
                            ))}
                          </div>
                        )}
                        {b.medicalReports.length > 0 && (
                          <div className="pt-2 border-t border-slate-200/30 dark:border-slate-800/30 flex flex-wrap gap-2">
                            {b.medicalReports.map((rep: any, idx: number) => (
                              <a
                                key={idx}
                                href={`http://localhost:5000${rep.url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center text-xs text-primary font-bold hover:underline"
                              >
                                <FileText className="h-4 w-4 mr-1" /> {rep.name}
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Submit Review trigger */}
                        {!b.isReviewed && (
                          <button
                            onClick={() => { setSelectedApptId(b._id); setShowReviewModal(true); }}
                            className="bg-primary text-white py-1 px-3 rounded-lg font-bold text-[10px]"
                          >
                            Submit Review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Live Chat */}
        {activeTab === 'chat' && (
          <div className="h-[550px] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl overflow-hidden flex animate-fade-in">
            {/* Sidebar list of doctors */}
            <div className="w-1/3 border-r border-slate-100 dark:border-slate-800 flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Available Doctors</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {vets.map((v) => (
                  <button
                    key={v._id}
                    onClick={() => { setSelectedVetId(v.userId._id); setChatMessages([]); }}
                    className={`w-full text-left p-3 rounded-2xl flex items-center space-x-3 transition-all ${
                      selectedVetId === v.userId._id
                        ? 'bg-primary/5'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <img
                      src={v.userId.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'}
                      alt="avatar"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="truncate">
                      <p className="font-bold text-xs truncate leading-tight">{v.userId.name}</p>
                      <p className="text-[9px] text-slate-400 truncate">{v.specialization}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Pane */}
            <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-950/10">
              {selectedVetId ? (
                <>
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-3">
                    <span className="font-bold text-xs text-slate-800 dark:text-white">Active Chat Feed</span>
                  </div>
                  
                  {/* Messages list */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
                    {chatMessages.length === 0 ? (
                      <p className="text-center text-xs text-slate-450 pt-20">Send a greeting message to start consulting.</p>
                    ) : (
                      chatMessages.map((m, idx) => {
                        const isMine = m.senderId === user?._id;
                        return (
                          <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-2xl text-xs max-w-[70%] leading-relaxed ${
                              isMine ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border rounded-tl-none border-slate-100 dark:border-slate-850'
                            }`}>
                              <p>{m.text}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Consult veterinarian..."
                      className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                    <button type="submit" className="bg-primary hover:bg-primary-dark text-white rounded-xl p-2">
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-24 text-xs text-slate-400">
                  Select a veterinarian from the sidebar to open messages.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: Profile Settings */}
        {activeTab === 'settings' && (
          <div className="glass-panel p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-850 space-y-6 animate-fade-in">
            <h1 className="text-xl font-black font-sans leading-none">Account Configuration</h1>

            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2.5 px-4 text-xs opacity-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2.5 px-4 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Street Address</label>
                  <input
                    type="text"
                    value={editStreet}
                    onChange={(e) => setEditStreet(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2.5 px-4 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2.5 px-4 text-xs"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary-dark text-white py-2.5 px-6 rounded-xl text-xs font-bold transition-all shadow"
              >
                {loading ? 'Saving...' : 'Save Profile details'}
              </button>
            </form>
          </div>
        )}

      </main>

      {/* Submit Review Modal dialog */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl p-6 relative border animate-fade-in text-slate-800 dark:text-slate-200">
            <h3 className="text-base font-black font-sans mb-3">Review Consultation</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Rating Score (1-5 Stars)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-2 text-xs text-center border-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Comments</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details of the consult visit..."
                  rows={3}
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 text-xs resize-none"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="w-1/2 py-2 border rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="w-1/2 bg-primary text-white py-2 rounded-xl font-bold text-xs shadow hover:bg-primary-dark"
                >
                  Post Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
