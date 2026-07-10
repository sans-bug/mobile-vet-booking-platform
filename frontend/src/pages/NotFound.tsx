import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, AlertOctagon } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 text-slate-800 dark:text-slate-200 font-sans">
      <div className="text-center space-y-6 max-w-md">
        <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto animate-float">
          <Compass className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black">404 - Page Not Found</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The page you are looking for has been moved, deleted, or does not exist. Please check the URL path or click below.
          </p>
        </div>
        <Link
          to="/"
          className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl text-xs shadow-md transition-all"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
};
