import React, { useState } from 'react';
import axios from 'axios';
import { AlertOctagon, Phone, ShieldAlert, X, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SOSButton: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [urgency, setUrgency] = useState<'high' | 'critical'>('high');
  const [loading, setLoading] = useState(false);
  const [activeSOS, setActiveSOS] = useState<any>(null);

  const triggerEmergency = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please contact support via phone.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const res = await axios.post('/emergencies/sos', {
            lat: latitude,
            lng: longitude,
            address: 'GPS Checked Coordinates',
            contactPhone,
            notes,
            urgency,
          });

          if (res.data.success) {
            setActiveSOS(res.data.emergency);
            setShowModal(false);
          }
        } catch (error: any) {
          console.error(error);
          alert('Emergency SOS dispatch failed. Please dial standard phone support.');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error(error);
        alert('Could not access current location coordinates. Please enable GPS permissions.');
        setLoading(false);
      }
    );
  };

  return (
    <>
      {/* Floating SOS Trigger Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 left-6 z-40 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 flex items-center justify-center shadow-lg hover:shadow-red-500/50 hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group font-bold"
      >
        <ShieldAlert className="h-6 w-6 animate-pulse group-hover:rotate-12 transition-transform duration-200" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out whitespace-nowrap ml-0 group-hover:ml-2 text-sm uppercase font-sans">
          SOS Emergency
        </span>
      </button>

      {/* SOS Booking Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl p-6 relative border border-red-500/20 animate-fade-in text-slate-800 dark:text-slate-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <AlertOctagon className="h-8 w-8 animate-bounce" />
              <h2 className="text-xl font-black font-sans uppercase tracking-tight">SOS Vet Dispatch</h2>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Pings all online verified veterinarians in your proximity. Standard emergency visit fees will apply.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Emergency Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Urgency Level</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUrgency('high')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      urgency === 'high'
                        ? 'border-orange-500 bg-orange-500/10 text-orange-600'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    High Distress
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('critical')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      urgency === 'critical'
                        ? 'border-red-500 bg-red-500/10 text-red-600 animate-pulse'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Critical Danger
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Incident Symptoms / Details</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Pet is choking, unconscious, bleeding heavily..."
                  rows={3}
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-slate-100 resize-none"
                />
              </div>

              <button
                onClick={triggerEmergency}
                disabled={loading || !contactPhone}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-red-600/30 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <span>Requesting Location...</span>
                ) : (
                  <>
                    <ShieldAlert className="h-5 w-5" />
                    <span>BROADCAST EMERGENCY VET SIGNAL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOS Active Tracking Banner */}
      {activeSOS && (
        <div className="fixed bottom-6 left-6 z-40 bg-red-600 text-white rounded-2xl shadow-2xl p-5 border border-white/20 animate-float max-w-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 animate-pulse" />
              <span className="font-extrabold text-sm uppercase tracking-wide">SOS Dispatched</span>
            </div>
            <button
              onClick={() => setActiveSOS(null)}
              className="p-0.5 hover:bg-red-700 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs opacity-90 leading-relaxed mb-3">
            A critical alert has been dispatched. Please stand by. Responding veterinarians are checking coordinates.
          </p>
          <div className="bg-red-700/60 rounded-xl p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="opacity-75">Status:</span>
              <span className="font-bold capitalize">{activeSOS.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-75">Urgency:</span>
              <span className="font-bold text-orange-300 capitalize">{activeSOS.urgency}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
