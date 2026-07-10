import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Star, Award, Compass, Heart, Loader2 } from 'lucide-react';

interface VetProfile {
  _id: string;
  userId: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  specialization: string;
  experience: number;
  clinicName: string;
  clinicAddress: string;
  consultingFee: number;
  rating: number;
  reviewsCount: number;
  services: string[];
}

export const Veterinarians: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [vets, setVets] = useState<VetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [specializationQuery, setSpecializationQuery] = useState(searchParams.get('query') || '');
  const [selectedService, setSelectedService] = useState('');

  const servicesList = [
    'General Check-up',
    'Vaccination',
    'Surgery Consultation',
    'Emergency Visit',
    'Grooming',
    'Dental Care',
    'Pet Nutrition',
    'Online Consultation',
  ];

  const fetchVets = async () => {
    setLoading(true);
    try {
      let url = '/bookings/vets?isVerified=approved';
      if (specializationQuery) {
        url += `&specialization=${encodeURIComponent(specializationQuery)}`;
      }
      if (selectedService) {
        url += `&service=${encodeURIComponent(selectedService)}`;
      }
      
      const res = await axios.get(url);
      if (res.data.success) {
        setVets(res.data.veterinarians);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVets();
  }, [specializationQuery, selectedService]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans text-slate-800 dark:text-slate-200 min-h-[calc(100vh-4rem)]">
      
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <h1 className="text-3xl font-black font-sans leading-none">Find Verified Veterinarians</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Search and filter specialized medical practitioners offering clinic, online, or home consults.</p>
      </div>

      {/* Filter panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border shadow-sm mb-10 items-center">
        
        {/* Name/Specialization Input */}
        <div className="relative flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
          <Search className="h-4 w-4 text-slate-400 mr-2" />
          <input
            type="text"
            value={specializationQuery}
            onChange={(e) => setSpecializationQuery(e.target.value)}
            placeholder="Specialization..."
            className="bg-transparent border-none text-xs w-full focus:outline-none"
          />
        </div>

        {/* Service selection dropdown */}
        <div className="relative flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
          <Compass className="h-4 w-4 text-slate-400 mr-2" />
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="bg-transparent border-none text-xs w-full focus:outline-none"
          >
            <option value="">All Services</option>
            {servicesList.map((s, idx) => (
              <option key={idx} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={() => { setSpecializationQuery(''); setSelectedService(''); }}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold text-center"
        >
          Reset Filters
        </button>
      </div>

      {/* Vets list grid */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-xs text-slate-400 mt-2">Loading veterinarian catalog...</p>
        </div>
      ) : vets.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border">
          <Compass className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-500">No doctors match your query filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vets.map((v) => (
            <div key={v._id} className="bg-white dark:bg-slate-900 border border-slate-250/10 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={v.userId.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'}
                    alt={v.userId.name}
                    className="h-14 w-14 rounded-full object-cover border border-primary/20"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm">{v.userId.name}</h3>
                    <p className="text-xs text-primary font-semibold">{v.specialization}</p>
                    <div className="flex items-center text-[10px] text-accent font-bold mt-1">
                      <Star className="h-3.5 w-3.5 fill-current mr-0.5" />
                      <span>{v.rating || 4.8} ({v.reviewsCount || 0} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 text-slate-500 dark:text-slate-400 pt-2 border-t">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-primary mr-2" />
                    <span>{v.experience} years experience</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-primary mr-2 shrink-0" />
                    <span className="truncate">{v.clinicName}</span>
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 text-primary mr-2" />
                    <span>Consulting Fee: <strong>${v.consultingFee}</strong></span>
                  </div>
                </div>

                {/* Services list */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {v.services.slice(0, 3).map((s, idx) => (
                    <span key={idx} className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[9px] font-bold">
                      {s}
                    </span>
                  ))}
                  {v.services.length > 3 && (
                    <span className="text-[9px] text-slate-400 font-bold self-center">+{v.services.length - 3} more</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => navigate('/book')}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm"
              >
                Schedule Appointment
              </button>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
