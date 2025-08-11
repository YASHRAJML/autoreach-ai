import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Save, Plus, X, Star, CheckCircle } from 'lucide-react';
import { CandidateProfile, ProfileAnalysis } from '../../types';
import { candidateApi } from '../../services/api';

interface ProfileSetupProps {
  profile: CandidateProfile | null;
  onProfileUpdate: (profile: CandidateProfile) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ profile, onProfileUpdate }) => {
  const [formData, setFormData] = useState<CandidateProfile>({
    name: '',
    currentRole: '',
    department: '',
    experience: 0,
    skills: [],
    keyAchievements: [],
    interests: '',
    email: '',
    phone: '',
    linkedIn: '',
    careerGoals: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({ ...profile });
    }
  }, [profile]);

  useEffect(() => {
    const analyzeProfile = async () => {
      if (formData.name && formData.currentRole && formData.department) {
        try {
          const profileAnalysis = await candidateApi.analyzeProfile(formData);
          setAnalysis(profileAnalysis);
        } catch (error) {
          console.error('Failed to analyze profile:', error);
        }
      }
    };

    const timeoutId = setTimeout(analyzeProfile, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData]);

  const handleInputChange = (field: keyof CandidateProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData(prev => ({
        ...prev,
        keyAchievements: [...prev.keyAchievements, newAchievement.trim()]
      }));
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyAchievements: prev.keyAchievements.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.currentRole || !formData.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const savedProfile = await candidateApi.saveProfile(formData);
      onProfileUpdate(savedProfile);
      toast.success('Profile saved successfully!');
    } catch (error) {
      toast.error('Failed to save profile');
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Setup</h1>
            <p className="text-gray-600 mt-1">
              Complete your profile to get personalized email suggestions
            </p>
          </div>
          {analysis && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {analysis.completenessPercentage}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          )}
        </div>
        
        {analysis && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Profile Completeness</span>
              <span>{analysis.score}/{analysis.maxScore}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  analysis.completenessPercentage >= 80 ? 'bg-green-500' : 
                  analysis.completenessPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${analysis.completenessPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            <p className="text-sm text-gray-600">Your core professional details</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input-field"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Role *
              </label>
              <input
                type="text"
                value={formData.currentRole}
                onChange={(e) => handleInputChange('currentRole', e.target.value)}
                className="input-field"
                placeholder="e.g., Software Engineer II"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="input-field"
                placeholder="e.g., Engineering"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                className="input-field"
                min="0"
                max="50"
                placeholder="Years"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="input-field"
                placeholder="your.email@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn Profile
              </label>
              <input
                type="url"
                value={formData.linkedIn || ''}
                onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                className="input-field"
                placeholder="linkedin.com/in/yourprofile"
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Technical Skills</h2>
            <p className="text-sm text-gray-600">List your technical competencies</p>
          </div>

          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="input-field flex-1"
                placeholder="Add a skill (e.g., JavaScript, Python, AWS)"
              />
              <button
                type="button"
                onClick={addSkill}
                className="btn-primary flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    <Star className="w-3 h-3 mr-1" />
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Key Achievements */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Key Achievements</h2>
            <p className="text-sm text-gray-600">Highlight your significant accomplishments</p>
          </div>

          <div className="space-y-4">
            <div className="flex space-x-2">
              <textarea
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                className="textarea-field flex-1"
                placeholder="Describe a key achievement (e.g., Led migration to microservices, reducing system downtime by 40%)"
                rows={2}
              />
              <button
                type="button"
                onClick={addAchievement}
                className="btn-primary flex items-center space-x-1 self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {formData.keyAchievements.length > 0 && (
              <div className="space-y-2">
                {formData.keyAchievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-800 flex-1">{achievement}</p>
                    <button
                      type="button"
                      onClick={() => removeAchievement(index)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
            <p className="text-sm text-gray-600">Help us personalize your experience</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Professional Interests
              </label>
              <input
                type="text"
                value={formData.interests || ''}
                onChange={(e) => handleInputChange('interests', e.target.value)}
                className="input-field"
                placeholder="e.g., machine learning, scalable systems, team leadership"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Career Goals
              </label>
              <textarea
                value={formData.careerGoals || ''}
                onChange={(e) => handleInputChange('careerGoals', e.target.value)}
                className="textarea-field"
                placeholder="Describe your career aspirations and what you're looking for in your next role..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {analysis && analysis.suggestions.length > 0 && (
          <div className="card bg-yellow-50 border-yellow-200">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-yellow-800">Suggestions</h2>
            </div>
            <ul className="space-y-2">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start text-sm text-yellow-700">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2 px-6 py-3"
          >
            {loading ? (
              <div className="loading-spinner" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{loading ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSetup; 