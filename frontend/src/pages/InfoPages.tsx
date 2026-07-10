import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, BadgeCheck, Clock3, Heart, Mail, MapPin, Phone, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react';

const pageClasses = 'min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950/20 px-4 py-16 sm:px-6 lg:px-8';
const cardClasses = 'glass-panel rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm';

const SectionHeader: React.FC<{ eyebrow: string; title: string; description: string }> = ({ eyebrow, title, description }) => (
  <div className="max-w-3xl text-center mx-auto space-y-3">
    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{eyebrow}</p>
    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
  </div>
);

export const AboutPage: React.FC = () => {
  return (
    <div className={pageClasses}>
      <div className="mx-auto max-w-7xl space-y-10">
        <SectionHeader
          eyebrow="About VetConnect"
          title="Modern veterinary care designed around busy pet parents"
          description="We combine trusted clinical workflows with thoughtful home-visit experiences so every pet gets care with less stress and more transparency."
        />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className={`${cardClasses} p-8 sm:p-10 space-y-6`}>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
              <Heart className="h-4 w-4" />
              <span>Built for pet-first experiences</span>
            </div>
            <div className="space-y-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
              <p>
                VetConnect brings together verified clinicians, digital health records, and rapid booking tools so you can move from concern to care without juggling calls, paper notes, or confusing portals.
              </p>
              <p>
                Whether your pet needs a routine wellness exam, vaccination reminder, or urgent home visit, the platform keeps every update visible to the owner and the care team in one place.
              </p>
            </div>
          </div>

          <div className={`${cardClasses} p-8 sm:p-10 space-y-4`}>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-secondary/10 p-3 text-secondary">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Why owners trust us</h2>
                <p className="text-sm text-slate-500">Transparent follow-up and professional support.</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-primary" /> Verified veterinary professionals and credential checks</li>
              <li className="flex gap-2"><Clock3 className="mt-0.5 h-4 w-4 text-primary" /> Fast booking and reminder delivery</li>
              <li className="flex gap-2"><Sparkles className="mt-0.5 h-4 w-4 text-primary" /> Digital health records and secure payments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ServicesPage: React.FC = () => {
  const services = [
    { title: 'General wellness', description: 'Routine examinations, preventive care, and lifestyle guidance for every stage of your pet’s life.', icon: Stethoscope },
    { title: 'Vaccination plans', description: 'Track boosters, upcoming reminders, and vaccine records in one secure dashboard.', icon: BadgeCheck },
    { title: 'Urgent at-home care', description: 'Dispatch a qualified clinician for emergencies, post-op checks, or same-day concerns.', icon: ShieldCheck },
    { title: 'Digital follow-up', description: 'Receive prescriptions, reports, and advice summaries directly in your inbox and portal.', icon: Sparkles },
  ];

  return (
    <div className={pageClasses}>
      <div className="mx-auto max-w-7xl space-y-10">
        <SectionHeader
          eyebrow="Our services"
          title="Care that fits the way modern pet owners live"
          description="From annual examinations to urgent home visits, every experience is designed to feel calm, clear, and convenient."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.title} className={`${cardClasses} p-8 space-y-4`}>
                <div className="rounded-2xl bg-primary/10 p-3 text-primary w-fit">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{service.title}</h2>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const EmergencyPage: React.FC = () => {
  return (
    <div className={pageClasses}>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className={`${cardClasses} overflow-hidden`}>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 sm:p-10 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 text-sm font-semibold text-red-600">
                <ShieldCheck className="h-4 w-4" />
                <span>24/7 care escalation</span>
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">Urgent support for unexpected pet emergencies</h1>
                <p className="text-sm sm:text-base leading-7 text-slate-600 dark:text-slate-400">
                  If your pet is in distress, use the SOS flow to notify nearby verified clinicians and share your current location quickly.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/book" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
                  Request urgent visit <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="inline-flex items-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                  Sign in to continue
                </Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-primary/10 p-8 sm:p-10">
              <div className="space-y-4 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">What happens next</h2>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-primary" /> Your alert is sent to the nearest available veterinarians</li>
                  <li className="flex gap-2"><Clock3 className="mt-0.5 h-4 w-4 text-primary" /> The response window is prioritised for urgent cases</li>
                  <li className="flex gap-2"><Activity className="mt-0.5 h-4 w-4 text-primary" /> You can track updates and confirm arrival from the app</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  return (
    <div className={pageClasses}>
      <div className="mx-auto max-w-6xl space-y-8">
        <SectionHeader
          eyebrow="Contact us"
          title="We’re here to help, whether you need support or a care plan"
          description="Reach our team for account questions, booking support, partnership inquiries, and everything in between."
        />

        <div className="grid gap-6 md:grid-cols-2">
          <div className={`${cardClasses} p-8 space-y-4`}>
            <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary" /><span className="font-semibold">sansray181@gmail.com</span></div>
            <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary" /><span className="font-semibold">7982819265</span></div>
            <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /><span className="font-semibold">23 VetConnect Plaza, Vellore, 632014</span></div>
          </div>
          <div className={`${cardClasses} p-8 space-y-4`}>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Need help choosing the right visit?</h2>
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">Our care coordinators can help you choose between a routine check-up, a vaccination visit, or an urgent home consultation.</p>
            <Link to="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">Create an account <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  return (
    <div className={pageClasses}>
      <div className="mx-auto max-w-4xl">
        <div className={`${cardClasses} p-8 sm:p-10 space-y-6`}>
          <SectionHeader eyebrow="Privacy policy" title="Your pet records stay protected" description="We use modern security conventions to protect account access, payment data, and medical history." />
          <div className="space-y-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
            <p>VetConnect collects only the information required to provide booking, authentication, and care coordination services.</p>
            <p>Profile details, appointment records, vaccination logs, and payment identifiers are handled with controlled access and encrypted transport in transit.</p>
            <p>For questions about data retention or deletion requests, contact our support team.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className={pageClasses}>
      <div className="mx-auto max-w-4xl">
        <div className={`${cardClasses} p-8 sm:p-10 space-y-6`}>
          <SectionHeader eyebrow="Terms of service" title="Use of the platform" description="By using VetConnect, you agree to the policies below for appointments, payments, and care communication." />
          <div className="space-y-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
            <p>Users are responsible for providing accurate pet health details and keeping account credentials secure.</p>
            <p>Appointments may be cancelled or rescheduled according to the provider’s availability and notice rules.</p>
            <p>Emergency services are intended for urgent situations and should be used alongside local emergency veterinary guidance when appropriate.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
