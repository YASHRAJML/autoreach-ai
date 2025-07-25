import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  FileText, 
  Mail, 
  TrendingUp, 
  Clock,
  Star,
  ArrowRight,
  Zap
} from 'lucide-react';
import { CandidateProfile, ProfileAnalysis } from '../../types';
import { candidateApi } from '../../services/api';

interface DashboardProps {
  profile: CandidateProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const [profileAnalysis, setProfileAnalysis] = useState<ProfileAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeProfile = async () => {
      try {
        const analysis = await candidateApi.analyzeProfile(profile);
        setProfileAnalysis(analysis);
      } catch (error) {
        console.error('Failed to analyze profile:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeProfile();
  }, [profile]);

  const quickActions = [
    {
      title: 'Update Profile',
      description: 'Keep your information current',
      icon: User,
      link: '/profile',
      color: 'bg-blue-500',
      urgent: (profileAnalysis?.completenessPercentage ?? 0) < 70
    },
    {
      title: 'Analyze Job',
      description: 'Parse a new job posting',
      icon: FileText,
      link: '/jobs',
      color: 'bg-green-500',
      urgent: false
    },
    {
      title: 'Generate Email',
      description: 'Create personalized outreach',
      icon: Mail,
      link: '/email-generator',
      color: 'bg-purple-500',
      urgent: false
    }
  ];

  const recentActivity = [
    {
      action: 'Profile updated',
      time: '2 hours ago',
      icon: User,
      color: 'text-blue-600'
    },
    {
      action: 'Email generated for Senior Engineer role',
      time: '1 day ago',
      icon: Mail,
      color: 'text-purple-600'
    },
    {
      action: 'Job posting analyzed',
      time: '2 days ago',
      icon: FileText,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {profile.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Ready to accelerate your internal career growth?
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-2 text-primary-600">
            <Zap className="w-5 h-5" />
            <span className="font-medium">AutoReach AI</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Completeness */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profile Completeness</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : `${profileAnalysis?.completenessPercentage ?? 0}%`}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${
              (profileAnalysis?.completenessPercentage ?? 0) >= 80 ? 'bg-green-100' : 
              (profileAnalysis?.completenessPercentage ?? 0) >= 60 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <TrendingUp className={`w-6 h-6 ${
                (profileAnalysis?.completenessPercentage ?? 0) >= 80 ? 'text-green-600' : 
                (profileAnalysis?.completenessPercentage ?? 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
          </div>
          
          {!loading && profileAnalysis && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{profileAnalysis.score}/{profileAnalysis.maxScore}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    profileAnalysis.completenessPercentage >= 80 ? 'bg-green-500' : 
                    profileAnalysis.completenessPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${profileAnalysis.completenessPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Skills Count */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Technical Skills</p>
              <p className="text-2xl font-bold text-gray-900">
                {profile.skills?.length || 0}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Across {new Set(profile.skills?.map(s => s.split(/[^a-zA-Z]/).filter(Boolean)[0])).size || 0} categories
          </p>
        </div>

        {/* Experience */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Experience</p>
              <p className="text-2xl font-bold text-gray-900">
                {profile.experience} years
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            In {profile.department}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-600">Jump into your workflow</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.link}
                className={`
                  group relative p-4 rounded-lg border-2 border-gray-200 hover:border-primary-300 
                  transition-all duration-200 hover:shadow-md
                  ${action.urgent ? 'ring-2 ring-yellow-200 bg-yellow-50' : 'hover:bg-gray-50'}
                `}
              >
                {action.urgent && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
                )}
                
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${action.color} bg-opacity-10`}>
                    <Icon className={`w-5 h-5 ${action.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 group-hover:text-primary-700">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Profile Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="p-1.5 bg-gray-100 rounded-lg">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.action}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile Insights */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Profile Insights</h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner"></div>
            </div>
          ) : profileAnalysis ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <span className={`badge ${
                  profileAnalysis.status === 'excellent' ? 'badge-success' :
                  profileAnalysis.status === 'good' ? 'badge-primary' :
                  'badge-warning'
                }`}>
                  {profileAnalysis.status.replace('_', ' ')}
                </span>
              </div>
              
              {profileAnalysis.suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Suggestions</h4>
                  <ul className="space-y-1">
                    {profileAnalysis.suggestions.slice(0, 3).map((suggestion, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-4">Unable to load insights</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 