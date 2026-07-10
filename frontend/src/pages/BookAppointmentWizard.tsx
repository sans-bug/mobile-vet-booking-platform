import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, Compass, CreditCard, CheckCircle, ArrowRight, ArrowLeft, Loader2, Sparkles, Plus, Dog } from 'lucide-react';

interface VetProfile {
  _id: string;
  userId: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  specialization: string;
  clinicName: string;
  consultingFee: number;
  services: string[];
  availability: Array<{ day: string; slots: string[] }>;
}

interface PetItem {
  _id: string;
  name: string;
  species: string;
  breed: string;
  imageUrl?: string;
}

export const BookAppointmentWizard: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Booking details
  const [selectedService, setSelectedService] = useState('');
  const [vets, setVets] = useState<VetProfile[]>([]);
  const [selectedVet, setSelectedVet] = useState<VetProfile | null>(null);
  
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [visitType, setVisitType] = useState<'clinic' | 'home_visit' | 'online'>('clinic');
  
  const [pets, setPets] = useState<PetItem[]>([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  
  // Quick Add Pet states
  const [showAddPet, setShowAddPet] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState('Dog');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetBirthDate, setNewPetBirthDate] = useState('');
  const [newPetWeight, setNewPetWeight] = useState('');

  // Stripe Sandbox states
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('***');
  const [clientSecret, setClientSecret] = useState('');
  const [appointmentId, setAppointmentId] = useState('');

  const servicesList = [
    'General Check-up',
    'Vaccination',
    'Surgery Consultation',
    'Emergency Visit',
    'Grooming',
    'Dental Care',
    'Pet Nutrition',
    'Online Consultation',
    'Pet Adoption Consultation',
    'Pet Health Certificate'
  ];

  // Protect route
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Load pets and vets
  useEffect(() => {
    if (!token) return;

    const loadInitialData = async () => {
      try {
        const petRes = await axios.get('/pets');
        if (petRes.data.success) {
          setPets(petRes.data.pets);
          if (petRes.data.pets.length > 0) {
            setSelectedPetId(petRes.data.pets[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load initial data', err);
      }
    };

    loadInitialData();
  }, [token]);

  // Load vets when service is chosen
  const loadVetsForService = async (serviceName: string) => {
    setSelectedService(serviceName);
    setLoading(true);
    try {
      const res = await axios.get(`/bookings/vets?service=${encodeURIComponent(serviceName)}`);
      if (res.data.success) {
        setVets(res.data.veterinarians);
      }
      setStep(2);
    } catch (err) {
      console.error(err);
      alert('Could not locate veterinarians offering this service.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVet = (vet: VetProfile) => {
    setSelectedVet(vet);
    setStep(3);
  };

  // Get available slots for the selected date
  const getAvailableSlots = (): string[] => {
    if (!selectedVet || !date) return [];
    
    // Determine day of the week
    const dateObj = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDayName = days[dateObj.getDay()];

    const avail = selectedVet.availability.find(a => a.day === selectedDayName);
    return avail ? avail.slots : [];
  };

  const handleCreatePet = async () => {
    if (!newPetName || !newPetBreed || !newPetBirthDate) {
      alert('Please fill out pet details.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post('/pets', {
        name: newPetName,
        species: newPetSpecies,
        breed: newPetBreed,
        birthDate: newPetBirthDate,
        weight: newPetWeight ? Number(newPetWeight) : undefined,
      });

      if (res.data.success) {
        setPets(prev => [...prev, res.data.pet]);
        setSelectedPetId(res.data.pet._id);
        setShowAddPet(false);
        // Clear
        setNewPetName('');
        setNewPetBreed('');
        setNewPetBirthDate('');
        setNewPetWeight('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to register pet.');
    } finally {
      setLoading(false);
    }
  };

  const handleInitBooking = async () => {
    if (!date || !timeSlot || !selectedPetId) {
      alert('Please select a Date, Time Slot, and Pet.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/bookings', {
        vetId: selectedVet?._id,
        petId: selectedPetId,
        service: selectedService,
        date,
        timeSlot,
        visitType,
        reason,
      });

      if (res.data.success) {
        setAppointmentId(res.data.appointment._id);
        setClientSecret(res.data.clientSecret);
        setStep(5); // Proceed to Sandbox Stripe Payment
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit appointment booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/bookings/confirm-payment', {
        appointmentId,
        paymentIntentId: clientSecret.split('_secret_')[0],
      });

      if (res.data.success) {
        setStep(6); // Confirmation
      }
    } catch (err) {
      console.error(err);
      alert('Stripe mock payment confirmation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-sans text-slate-800 dark:text-slate-200 min-h-[calc(100vh-4rem)]">
      {/* Progress indicators */}
      <div className="flex items-center justify-between mb-12">
        {[
          { label: 'Service', step: 1, icon: Compass },
          { label: 'Veterinarian', step: 2, icon: User },
          { label: 'Schedule', step: 3, icon: Calendar },
          { label: 'Pet Details', step: 4, icon: Dog },
          { label: 'Checkout', step: 5, icon: CreditCard },
          { label: 'Confirm', step: 6, icon: CheckCircle }
        ].map((item, i) => {
          const Icon = item.icon;
          const isActive = step >= item.step;
          const isCurrent = step === item.step;
          return (
            <div key={i} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-primary text-white ring-4 ring-primary/20 scale-105'
                    : isActive
                    ? 'bg-secondary text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-[10px] mt-2 font-bold tracking-wide transition-colors ${
                  isCurrent ? 'text-primary' : isActive ? 'text-secondary' : 'text-slate-400'
                }`}>
                  {item.label}
                </span>
              </div>
              {i < 5 && (
                <div className={`h-[2px] flex-1 mx-2 transition-colors ${
                  step > item.step ? 'bg-secondary' : 'bg-slate-200 dark:bg-slate-800'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="glass-panel p-8 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-850">
        
        {/* STEP 1: Choose Service */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black font-sans">Choose a Service</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Select the healthcare specialty required for your pet.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {servicesList.map((service, idx) => (
                <button
                  key={idx}
                  onClick={() => loadVetsForService(service)}
                  disabled={loading}
                  className="p-5 text-left rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-primary/5 dark:hover:bg-primary/5 hover:ring-2 hover:ring-primary/20 border border-slate-100 dark:border-slate-850 flex justify-between items-center group transition-all"
                >
                  <span className="font-bold text-sm">{service}</span>
                  {loading && selectedService === service ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Choose Veterinarian */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black font-sans">Select Veterinarian</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Doctors qualified to perform: {selectedService}</p>
              </div>
              <button onClick={() => setStep(1)} className="text-xs text-primary font-bold hover:underline flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </button>
            </div>

            {vets.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <User className="h-12 w-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-500">No doctors currently available for this service.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vets.map((v) => (
                  <div key={v._id} className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-850 rounded-3xl flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <img
                        src={v.userId.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'}
                        alt={v.userId.name}
                        className="h-14 w-14 rounded-full object-cover border border-primary/20"
                      />
                      <div>
                        <h4 className="font-bold text-base leading-snug">{v.userId.name}</h4>
                        <p className="text-xs text-primary font-semibold">{v.specialization}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1">{v.clinicName}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Consulting Fee</span>
                        <span className="font-bold text-sm text-slate-800 dark:text-white">${v.consultingFee}</span>
                      </div>
                      <button
                        onClick={() => handleSelectVet(v)}
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-5 rounded-xl text-xs transition-all"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Select Schedule */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black font-sans">Choose Date & Time</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Schedule with {selectedVet?.userId.name}</p>
              </div>
              <button onClick={() => setStep(2)} className="text-xs text-primary font-bold hover:underline flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Consultation Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setTimeSlot('');
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:outline-none text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Visit Type</label>
                  <select
                    value={visitType}
                    onChange={(e: any) => setVisitType(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:outline-none text-slate-800 dark:text-slate-100"
                  >
                    <option value="clinic">Clinic Consultation</option>
                    <option value="home_visit">Emergency Home Visit</option>
                    <option value="online">Online Video Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Appointment Notes / Symptoms</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Annual vaccine booster, scratchings ears..."
                    rows={3}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3 text-sm focus:outline-none text-slate-800 dark:text-slate-100 resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2">Available Slots</label>
                {!date ? (
                  <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    Please select a date to pull available slots.
                  </div>
                ) : getAvailableSlots().length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    No doctor availability found on this weekday. Please select another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {getAvailableSlots().map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTimeSlot(slot)}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                          timeSlot === slot
                            ? 'bg-primary border-primary text-white shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                disabled={!date || !timeSlot}
                onClick={() => setStep(4)}
                className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Select/Add Pet */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black font-sans">Patient Profile</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Select or register the pet receiving the treatment.</p>
              </div>
              <button onClick={() => setStep(3)} className="text-xs text-primary font-bold hover:underline flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </button>
            </div>

            {!showAddPet ? (
              <div className="space-y-6">
                {pets.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                    <Dog className="h-10 w-10 text-slate-350 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-500 mb-4">No registered pets found on your account.</p>
                    <button
                      onClick={() => setShowAddPet(true)}
                      className="bg-primary text-white font-bold py-2 px-5 rounded-xl text-xs hover:bg-primary-dark transition-all"
                    >
                      Quick Add Pet
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {pets.map((p) => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => setSelectedPetId(p._id)}
                          className={`p-4 text-left border rounded-2xl flex items-center space-x-4 transition-all ${
                            selectedPetId === p._id
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                          }`}
                        >
                          <img
                            src={p.imageUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100'}
                            alt={p.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-bold text-sm leading-tight">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{p.breed} ({p.species})</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setShowAddPet(true)}
                      className="text-xs text-primary font-bold hover:underline flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Register another pet</span>
                    </button>

                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={handleInitBooking}
                        disabled={loading || !selectedPetId}
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl text-sm transition-all flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <span>Proceed to Payment</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-850 rounded-3xl space-y-4 animate-fade-in">
                <h3 className="font-extrabold text-sm text-primary">Quick Add Pet</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold mb-1">Pet Name</label>
                    <input
                      type="text"
                      value={newPetName}
                      onChange={(e) => setNewPetName(e.target.value)}
                      placeholder="e.g. Milo"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold mb-1">Pet Species</label>
                    <select
                      value={newPetSpecies}
                      onChange={(e) => setNewPetSpecies(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    >
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Rabbit">Rabbit</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold mb-1">Breed</label>
                    <input
                      type="text"
                      value={newPetBreed}
                      onChange={(e) => setNewPetBreed(e.target.value)}
                      placeholder="e.g. Golden Retriever"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold mb-1">Birth Date</label>
                    <input
                      type="date"
                      value={newPetBirthDate}
                      onChange={(e) => setNewPetBirthDate(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={newPetWeight}
                      onChange={(e) => setNewPetWeight(e.target.value)}
                      placeholder="e.g. 12.5"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setShowAddPet(false)}
                    className="py-2 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePet}
                    disabled={loading}
                    className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-xl text-xs shadow transition-all"
                  >
                    Save Pet Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Stripe Sandbox Payment */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black font-sans">Payment Checkout</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Simulated Stripe Payment Sandbox. No real money required.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-2xl space-y-3">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Order Summary</h4>
                  <div className="flex justify-between text-xs">
                    <span>{selectedService}</span>
                    <span className="font-bold">${selectedVet?.consultingFee}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Service Fee</span>
                    <span className="font-bold">$0.00</span>
                  </div>
                  <div className="h-[1px] bg-slate-200 dark:bg-slate-700 my-2" />
                  <div className="flex justify-between text-sm font-black">
                    <span>Total Amount</span>
                    <span className="text-primary">${selectedVet?.consultingFee}</span>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 text-[11px] text-slate-500 dark:text-slate-400 flex items-start space-x-2 leading-relaxed">
                  <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <span>The platform is running in development sandbox billing mode. Enter any standard card details or leave as-is to complete the simulation.</span>
                </div>
              </div>

              {/* Credit Card Input */}
              <div className="space-y-4 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl bg-white dark:bg-slate-900/50 shadow-sm">
                <div>
                  <label className="block text-[10px] font-bold mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold mb-1">CVC Code</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-primary-dark/20 transition-all flex items-center justify-center space-x-2 text-sm"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      <span>PAY AND SECURE BOOKING</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Confirmation */}
        {step === 6 && (
          <div className="text-center py-12 space-y-6">
            <div className="h-16 w-16 bg-secondary/15 rounded-full flex items-center justify-center mx-auto text-secondary animate-bounce">
              <CheckCircle className="h-10 w-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black font-sans">Booking Successful!</h2>
              <p className="text-slate-550 dark:text-slate-400 text-xs leading-relaxed max-w-md mx-auto">
                Your appointment has been confirmed. A receipt and calendar alert have been dispatched to your email address.
              </p>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-3xl max-w-md mx-auto text-xs space-y-2 border border-slate-200/50 dark:border-slate-800/40">
              <div className="flex justify-between">
                <span className="opacity-75">Service:</span>
                <span className="font-bold">{selectedService}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Doctor:</span>
                <span className="font-bold">{selectedVet?.userId.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Date & Time:</span>
                <span className="font-bold">{date} at {timeSlot}</span>
              </div>
            </div>

            <div className="pt-6 space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl text-xs transition-all shadow-md"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => alert('Downloading invoice PDF receipt...')}
                className="py-3 px-6 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-all"
              >
                Download Invoice
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
