import React from 'react';
import { usePathname } from 'next/navigation';

interface PageHeaderProps {
  onAddNote: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ onAddNote }) => {
  const pathname = usePathname();
  return (
    <header className="hidden sticky top-0 z-10 w-full border-b border-gray-200 backdrop-blur-sm backdrop-saturate-200 p-[22px] bg-white/80 lg:block dark:border-gray-700 dark:bg-gray-800/90">
      <div className="flex justify-between items-center transition-all duration-300">
      <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
              {pathname === '/notes' ? 'Normal Notes' : pathname === '/stopped-students' ? 'Stopped Students' : pathname === '/permanent-notes' ? 'Permanent Notes' : 'Normal Notes'}
            </h1>
          
        <button
          onClick={onAddNote}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-teal-400 rounded-lg shadow-sm transition-all duration-200 hover:from-blue-600 hover:to-teal-500"
        >
          <svg
            className="mr-2 w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            ></path>
          </svg>
          Add Note
        </button>
      </div>
    </header>
  );
};

export default PageHeader;