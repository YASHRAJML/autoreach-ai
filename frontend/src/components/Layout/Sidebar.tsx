import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  X, 
  Home, 
  User, 
  FileText, 
  Mail, 
  BarChart3,
  Zap,
  Brain,
  Bookmark
} from 'lucide-react';
import { CandidateProfile } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CandidateProfile | null;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, profile }) => {
  const [bucketCount, setBucketCount] = useState(0);
  useEffect(() => {
    const refreshCount = () => {
      try {
        const saved = localStorage.getItem('jobBucket');
        const parsed = saved ? JSON.parse(saved) : [];
        setBucketCount(parsed.length || 0);
      } catch {
        setBucketCount(0);
      }
    };
    refreshCount();
    window.addEventListener('jobBucketUpdated', refreshCount);
    window.addEventListener('storage', refreshCount);
    return () => {
      window.removeEventListener('jobBucketUpdated', refreshCount);
      window.removeEventListener('storage', refreshCount);
    };
  }, []);
  const menuItems = [
    {
      to: '/',
      icon: Home,
      label: 'Dashboard',
      description: 'Overview and quick actions'
    },
    {
      to: '/profile',
      icon: User,
      label: 'Profile Setup',
      description: 'Manage your candidate profile'
    },
    {
      to: '/jobs',
      icon: FileText,
      label: 'Job Analysis',
      description: 'Analyze job postings'
    },
    {
      to: '/email-generator',
      icon: Mail,
      label: 'Email Generator',
      description: 'Generate outreach emails'
    },
    {
      to: '/cv-agent',
      icon: Brain,
      label: 'CV Agent',
      description: 'AI-powered CV analysis & tips'
    },
    {
      to: '/job-bucket',
      icon: Bookmark,
      label: 'Job Bucket',
      description: 'Saved jobs & analysis'
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">AutoReach AI</h1>
              <p className="text-xs text-gray-500">Smart Outreach Assistant</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Summary */}
        {profile && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profile.currentRole} • {profile.department}
                </p>
                <p className="text-xs text-gray-400">
                  {profile.experience} years experience
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isBucket = item.to === '/job-bucket';
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => `
                  group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                  ${isActive 
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <div>{item.label}</div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-600">
                      {item.description}
                    </div>
                  </div>
                  {isBucket && (
                    <span className="ml-3 inline-flex items-center justify-center text-xs font-medium bg-primary-100 text-primary-700 rounded-full h-5 min-w-5 px-2">
                      {bucketCount}
                    </span>
                  )}
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 px-4 py-2">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            <div className="text-xs text-gray-500">
              {profile ? (
                <span>Profile {Math.round((profile.skills?.length || 0) * 10 + 40)}% complete</span>
              ) : (
                <span>Setup your profile to get started</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 