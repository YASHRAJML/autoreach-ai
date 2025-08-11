import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, Zap, Copy, RefreshCw, Send, FileText } from 'lucide-react';
import { CandidateProfile, JobDetails, GeneratedEmail, EmailType, EmailTone } from '../../types';
import { emailApi, jobsApi } from '../../services/api';

interface EmailGeneratorProps {
  profile: CandidateProfile;
}

const EmailGenerator: React.FC<EmailGeneratorProps> = ({ profile }) => {
  const [jobDetails, setJobDetails] = useState<JobDetails>({
    title: '',
    department: '',
    hiringManager: '',
    recruiter: '',
    description: '',
    requirements: ''
  });
  
  const [emailType, setEmailType] = useState<EmailType>('hiring_manager');
  const [tone, setTone] = useState<EmailTone>('professional');
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const emailTypes = [
    { value: 'hiring_manager', label: 'Hiring Manager', description: 'Direct outreach to the hiring manager' },
    { value: 'recruiter', label: 'Recruiter', description: 'Introduction to the recruiting team' },
    { value: 'team_member', label: 'Team Member', description: 'Networking with current team members' }
  ];

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'formal', label: 'Formal' },
    { value: 'casual', label: 'Casual' }
  ];

  const loadSampleJob = async () => {
    try {
      const sampleJob = await jobsApi.getSampleJob();
      setJobDetails(sampleJob);
      toast.success('Sample job loaded!');
    } catch (error) {
      toast.error('Failed to load sample job');
    }
  };

  const generateEmail = async () => {
    if (!jobDetails.title || !jobDetails.department) {
      toast.error('Please fill in at least the job title and department');
      return;
    }

    setLoading(true);
    try {
      const email = await emailApi.generateEmail(profile, jobDetails, emailType, tone);
      setGeneratedEmail(email);
      setShowPreview(true);
      toast.success('Email generated successfully!');
    } catch (error) {
      toast.error('Failed to generate email');
      console.error('Error generating email:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const copyFullEmail = () => {
    if (generatedEmail) {
      const fullEmail = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
      copyToClipboard(fullEmail);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Email Generator</h1>
            <p className="text-gray-600 mt-1">
              Create personalized outreach emails powered by AI
            </p>
          </div>
          <div className="flex items-center space-x-2 text-primary-600">
            <Zap className="w-5 h-5" />
            <span className="font-medium">AI-Powered</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Job Details */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Job Details</h2>
                  <p className="text-sm text-gray-600">Enter the job information</p>
                </div>
                <button
                  onClick={loadSampleJob}
                  className="btn-outline text-sm flex items-center space-x-1"
                >
                  <FileText className="w-4 h-4" />
                  <span>Load Sample</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={jobDetails.title}
                    onChange={(e) => setJobDetails(prev => ({ ...prev, title: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    value={jobDetails.department}
                    onChange={(e) => setJobDetails(prev => ({ ...prev, department: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., Engineering"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hiring Manager
                  </label>
                  <input
                    type="text"
                    value={jobDetails.hiringManager || ''}
                    onChange={(e) => setJobDetails(prev => ({ ...prev, hiringManager: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., Sarah Chen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recruiter
                  </label>
                  <input
                    type="text"
                    value={jobDetails.recruiter || ''}
                    onChange={(e) => setJobDetails(prev => ({ ...prev, recruiter: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., Mike Rodriguez"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description
                </label>
                <textarea
                  value={jobDetails.description}
                  onChange={(e) => setJobDetails(prev => ({ ...prev, description: e.target.value }))}
                  className="textarea-field"
                  rows={3}
                  placeholder="Paste the job description here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements
                </label>
                <textarea
                  value={jobDetails.requirements}
                  onChange={(e) => setJobDetails(prev => ({ ...prev, requirements: e.target.value }))}
                  className="textarea-field"
                  rows={3}
                  placeholder="List the key requirements..."
                />
              </div>
            </div>
          </div>

          {/* Email Preferences */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Email Preferences</h2>
              <p className="text-sm text-gray-600">Customize your email style</p>
            </div>

            <div className="space-y-4">
              {/* Email Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Type
                </label>
                <div className="space-y-2">
                  {emailTypes.map((type) => (
                    <label key={type.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="emailType"
                        value={type.value}
                        checked={emailType === type.value}
                        onChange={(e) => setEmailType(e.target.value as EmailType)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{type.label}</div>
                        <div className="text-sm text-gray-600">{type.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {tones.map((toneOption) => (
                    <button
                      key={toneOption.value}
                      onClick={() => setTone(toneOption.value as EmailTone)}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        tone === toneOption.value
                          ? 'bg-primary-50 border-primary-300 text-primary-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {toneOption.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateEmail}
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
          >
            {loading ? (
              <div className="loading-spinner" />
            ) : (
              <Zap className="w-5 h-5" />
            )}
            <span>{loading ? 'Generating...' : 'Generate Email'}</span>
          </button>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          {/* Email Preview */}
          {showPreview && generatedEmail ? (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Generated Email</h2>
                    <p className="text-sm text-gray-600">
                      Created {new Date(generatedEmail.generatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={generateEmail}
                      className="btn-outline text-sm flex items-center space-x-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Regenerate</span>
                    </button>
                    <button
                      onClick={copyFullEmail}
                      className="btn-primary text-sm flex items-center space-x-1"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Subject Line */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Line
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900">{generatedEmail.subject}</p>
                    <button
                      onClick={() => copyToClipboard(generatedEmail.subject)}
                      className="text-xs text-primary-600 hover:text-primary-800 mt-1"
                    >
                      Copy subject
                    </button>
                  </div>
                </div>

                {/* Email Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Body
                  </label>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans leading-relaxed">
                      {generatedEmail.body}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(generatedEmail.body)}
                      className="text-xs text-primary-600 hover:text-primary-800 mt-2"
                    >
                      Copy body
                    </button>
                  </div>
                </div>

                {/* Email Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="ml-1 text-gray-600 capitalize">{generatedEmail.emailType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tone:</span>
                    <span className="ml-1 text-gray-600 capitalize">{generatedEmail.tone}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button className="btn-primary flex items-center space-x-2 flex-1">
                    <Send className="w-4 h-4" />
                    <span>Open in Email Client</span>
                  </button>
                  <button className="btn-secondary flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Mail className="w-12 h-12 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Generated</h3>
                <p className="text-center">
                  Fill in the job details and click "Generate Email" to create your personalized outreach message.
                </p>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="card bg-blue-50 border-blue-200">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-blue-800">💡 Tips for Better Results</h3>
            </div>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                Include specific details about the role and team
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                Mention the hiring manager's name when available
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                Keep your profile up-to-date for better personalization
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                Review and customize the generated email before sending
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailGenerator; 