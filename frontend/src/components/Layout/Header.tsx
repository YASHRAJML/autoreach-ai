import React from 'react';
import { Menu, User, Bell, Settings } from 'lucide-react';
import { CandidateProfile } from '../../types';

interface HeaderProps {
  onMenuClick: () => void;
  profile: CandidateProfile | null;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, profile }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button (mobile) */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="lg:hidden ml-2">
            <h1 className="text-xl font-bold text-gray-900">AutoReach AI</h1>
          </div>
        </div>

        {/* Right side - Profile and actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
            <Bell className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* Profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {profile?.name || 'Guest User'}
              </p>
              <p className="text-xs text-gray-500">
                {profile?.currentRole || 'No role set'}
              </p>
            </div>
            
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              {profile?.name ? (
                <span className="text-white text-sm font-medium">
                  {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 