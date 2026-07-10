import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin, Heart, ChevronRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-primary" />
              <span className="font-extrabold text-2xl tracking-tight text-white">
                VetConnect
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Premium, responsive on-demand healthcare platform connecting pet owners with verified veterinary professionals for clinical appointments, online guidance, and emergency home care.
            </p>
            <div className="flex space-x-3 text-slate-400">
              <a href="#" className="hover:text-primary transition-colors"><Heart className="h-5 w-5 fill-current text-red-500" /></a>
              <span className="text-xs">Proudly serving pets globally.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wide mb-4">Quick Links</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" /> About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" /> Our Services
                </Link>
              </li>
              <li>
                <Link to="/vets" className="hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" /> Veterinarians
                </Link>
              </li>
              <li>
                <Link to="/emergency" className="hover:text-primary transition-colors flex items-center text-red-400 hover:text-red-300">
                  <ChevronRight className="h-3 w-3 mr-1 text-red-400" /> Emergency SOS
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-3 w-3 mr-1" /> Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wide mb-4">Contact</h3>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>23 VetConnect Plaza, Vellore, 632014</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>7982819265</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>sansray181@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter signup */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wide mb-4">Stay Updated</h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Subscribe to our monthly newsletter for professional pet wellness tips and vaccine reminders.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Enter email address"
                className="bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                required
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white font-bold py-2 rounded-lg text-xs shadow-sm transition-all"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} VetConnect Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
