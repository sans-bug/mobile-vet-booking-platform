import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ShieldAlert, Award, Star, Compass, Smile, ArrowRight, BookOpen, Heart, Activity } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const services = [
    { title: 'General Check-up', icon: Compass, description: 'Comprehensive physical exams, health profiles and standard clinical evaluations.' },
    { title: 'Vaccination Programs', icon: Award, description: 'Required shots and boosters tracked inside automated pet record cards.' },
    { title: 'Surgery Consultations', icon: Heart, description: 'Soft-tissue surgery advice, biopsy discussions and orthopedics reviews.' },
    { title: 'Emergency Home Visits', icon: ShieldAlert, description: 'On-demand urgent care dispatch of proximate verified practitioners.' },
  ];

  const stats = [
    { value: '15k+', label: 'Happy Pets Served' },
    { value: '450+', label: 'Verified Doctors' },
    { value: '4.9★', label: 'Average App Rating' },
    { value: '99%', label: 'SOS Alert Resolution' },
  ];

  const testimonials = [
    { name: 'Sarah Miller', pet: 'Milo (Golden Retriever)', text: 'The home visit service saved my day. Milo had an ear infection and Dr. Jenkins diagnosed and treated him right in our living room! Highly recommended.', rating: 5 },
    { name: 'David Cho', pet: 'Luna (Siamese)', text: 'Scheduling vaccination boosters was a breeze. I love the digital vaccine card and reminder logs. Everything is stored in one place.', rating: 5 }
  ];

  const faqs = [
    { q: 'How does the Emergency SOS button work?', a: 'Clicking the SOS button requests your location coordinates and immediately broadcasts an alert notification to all online verified veterinarians in your area, details like contact phone are shared to speed up dispatch.' },
    { q: 'Can I test payments without real credentials?', a: 'Yes! The platform is configured in sandboxed mock mode by default. You can simulate Stripe checkouts immediately without entering real credit cards.' },
    { q: 'What is the digital health tracker?', a: 'It allows pet owners to record pet weight entries (growth charts), upload medical PDF prescription logs, and inspect vaccination schedules dynamically.' }
  ];

  return (
    <div className="overflow-hidden font-sans">
      {/* 1. Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-slate-100 to-primary/10 dark:from-slate-950 dark:via-slate-900 dark:to-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 text-slate-800 dark:text-slate-100"
          >
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary py-1.5 px-4 rounded-full text-xs font-bold dark:bg-primary/20">
              <Activity className="h-4 w-4" />
              <span>Smart On-Demand Pet Healthcare</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none">
              Compassionate Care for Your{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Best Friends
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              VetConnect links pet owners with certified veterinary professionals for clinic consultations, online video guidance, and rapid home visit dispatches.
            </p>

            {/* Quick search input */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-md border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center flex-1 px-3">
                <Search className="h-5 w-5 text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search specialization (e.g. Feline, Avian)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none text-sm w-full focus:outline-none text-slate-800 dark:text-slate-100"
                />
              </div>
              <button
                onClick={() => navigate(`/vets?query=${searchTerm}`)}
                className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl text-sm transition-all flex items-center justify-center space-x-2"
              >
                <span>Find Vets</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          {/* Hero Pet Image Mock */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="relative w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-gradient-to-tr from-primary/30 to-secondary/20 flex items-center justify-center animate-float">
              <img
                src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500"
                alt="Pet Hero"
                className="w-[90%] h-[90%] object-cover rounded-full shadow-2xl border-4 border-white dark:border-slate-800"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary">{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Services Grid */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black tracking-tight">Our Professional Services</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
              All treatments are handled by licensed, pre-screened veterinary care teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <div key={idx} className="glass-panel p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/40 hover:-translate-y-1 transition-all duration-300">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-base mb-2">{srv.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{srv.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. SOS Promo Section */}
      <section className="py-16 bg-red-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 h-64 w-64 bg-white/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h2 className="text-3xl font-black uppercase tracking-tight flex items-center justify-center md:justify-start gap-2">
              <ShieldAlert className="h-8 w-8 animate-pulse text-white" /> Emergency SOS Assistance
            </h2>
            <p className="text-xs opacity-90 leading-relaxed">
              If your pet is in severe danger, get immediate help. Clicking the SOS button pings coordinates to near active veterinarians instantly. Available 24/7.
            </p>
          </div>
          <Link
            to="/emergency"
            className="bg-white hover:bg-slate-100 text-red-600 font-extrabold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all text-sm uppercase font-sans shrink-0"
          >
            Report SOS Request
          </Link>
        </div>
      </section>

      {/* 5. Testimonials */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black tracking-tight">Testimonials</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">What pet parents have to say about VetConnect.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl space-y-4 border border-slate-100 dark:border-slate-700/50">
                <div className="flex space-x-1">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current text-accent" />)}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed italic">"{t.text}"</p>
                <div>
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{t.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{t.pet}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ Accordion */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">Find quick answers to common questions.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="glass-panel rounded-2xl overflow-hidden shadow-sm border border-slate-200/50 dark:border-slate-800/40">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full text-left p-5 font-bold text-sm flex justify-between items-center"
                  >
                    <span>{faq.q}</span>
                    <span className="text-primary text-lg">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/50 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <BookOpen className="h-10 w-10 mx-auto text-white animate-float" />
          <h2 className="text-3xl font-black tracking-tight">Never Miss a Vaccination Reminder</h2>
          <p className="text-xs opacity-90 leading-relaxed max-w-lg mx-auto">
            Subscribe to our newsletters and wellness guides. We will send you checklists to track vaccine booster dates for dogs and cats.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-4">
            <input
              type="email"
              placeholder="Enter email address"
              className="bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-xs text-white placeholder-white/60 focus:outline-none focus:bg-white/20 flex-1"
              required
            />
            <button
              type="submit"
              className="bg-white hover:bg-slate-100 text-primary font-extrabold py-3 px-6 rounded-xl text-xs transition-all shadow"
            >
              Sign Up
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
