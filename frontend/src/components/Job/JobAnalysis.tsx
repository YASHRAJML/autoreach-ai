import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FileText, 
  Search, 
  TrendingUp, 
  Star, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  Copy
} from 'lucide-react';
import { CandidateProfile, JobDetails, MatchAnalysis } from '../../types';
import { jobsApi } from '../../services/api';

interface JobAnalysisProps {
  profile: CandidateProfile;
}

const JobAnalysis: React.FC<JobAnalysisProps> = ({ profile }) => {
  const [jobText, setJobText] = useState('');
  const [jobData, setJobData] = useState<JobDetails | null>(null);
  const [matchAnalysis, setMatchAnalysis] = useState<MatchAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const loadSampleJob = async () => {
    try {
      const sampleJob = await jobsApi.getSampleJob();
      const formattedJobText = `Title: ${sampleJob.title}
Department: ${sampleJob.department}
Hiring Manager: ${sampleJob.hiringManager}
Location: ${sampleJob.location}

Description:
${sampleJob.description}

Requirements:
${sampleJob.requirements}`;
      
      setJobText(formattedJobText);
      toast.success('Sample job loaded!');
    } catch (error) {
      toast.error('Failed to load sample job');
    }
  };

  const analyzeJob = async () => {
    if (!jobText.trim()) {
      toast.error('Please paste a job posting first');
      return;
    }

    setLoading(true);
    try {
      const analyzedJob = await jobsApi.analyzeJobPosting(jobText);
      setJobData(analyzedJob);
      toast.success('Job posting analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze job posting');
      console.error('Error analyzing job:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchAnalysis = async () => {
    if (!jobData) {
      toast.error('Please analyze a job posting first');
      return;
    }

    setAnalyzing(true);
    try {
      const analysis = await jobsApi.getMatchAnalysis(profile, jobData);
      setMatchAnalysis(analysis);
      toast.success('Match analysis completed!');
    } catch (error) {
      toast.error('Failed to analyze job match');
      console.error('Error analyzing match:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'medium': return <Star className="w-4 h-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Lightbulb className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Analysis</h1>
            <p className="text-gray-600 mt-1">
              Analyze job postings and see how well you match
            </p>
          </div>
          <div className="flex items-center space-x-2 text-primary-600">
            <Search className="w-5 h-5" />
            <span className="font-medium">Smart Analysis</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Job Posting Input */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Job Posting</h2>
                  <p className="text-sm text-gray-600">Paste the job description here</p>
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
              <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                className="textarea-field"
                rows={12}
                placeholder="Paste the complete job posting here including title, description, requirements, etc..."
              />

              <div className="flex space-x-3">
                <button
                  onClick={analyzeJob}
                  disabled={loading || !jobText.trim()}
                  className="btn-primary flex items-center space-x-2 flex-1"
                >
                  {loading ? (
                    <div className="loading-spinner" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Analyzing...' : 'Analyze Job'}</span>
                </button>

                {jobData && (
                  <button
                    onClick={getMatchAnalysis}
                    disabled={analyzing}
                    className="btn-outline flex items-center space-x-2"
                  >
                    {analyzing ? (
                      <div className="loading-spinner" />
                    ) : (
                      <TrendingUp className="w-4 h-4" />
                    )}
                    <span>{analyzing ? 'Matching...' : 'Get Match Score'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Extracted Job Details */}
          {jobData && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Extracted Information</h2>
                <p className="text-sm text-gray-600">Key details from the job posting</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">
                      {jobData.title || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">
                      {jobData.department || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hiring Manager
                    </label>
                    <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">
                      {jobData.hiringManager || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seniority Level
                    </label>
                    <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded capitalize">
                      {jobData.seniority || 'Not specified'}
                    </p>
                  </div>
                </div>

                {jobData.keySkills && jobData.keySkills.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Skills
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {jobData.keySkills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4 text-sm">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    jobData.remoteOption ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {jobData.remoteOption ? '✓ Remote Option' : '✗ No Remote Option'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        <div className="space-y-6">
          {/* Match Score Overview */}
          {matchAnalysis ? (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Match Analysis</h2>
                <p className="text-sm text-gray-600">Your compatibility with this role</p>
              </div>

              <div className="space-y-6">
                {/* Overall Score */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white mb-4">
                    <span className="text-2xl font-bold">{matchAnalysis.overallScore}%</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{matchAnalysis.rating}</h3>
                  <p className="text-sm text-gray-600">Overall Match Score</p>
                </div>

                {/* Factor Breakdown */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Score Breakdown</h4>
                  {matchAnalysis.factors.map((factor, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{factor.factor}</span>
                        <span className={`text-sm font-medium ${getScoreColor(factor.score, factor.maxScore)}`}>
                          {factor.score}/{factor.maxScore}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            factor.score / factor.maxScore >= 0.8 ? 'bg-green-500' : 
                            factor.score / factor.maxScore >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(factor.score / factor.maxScore) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600">{factor.details}</p>
                      
                      {factor.matchingItems && factor.matchingItems.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {factor.matchingItems.map((item, itemIndex) => (
                            <span
                              key={itemIndex}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-700"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                {matchAnalysis.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Recommendations</h4>
                    {matchAnalysis.recommendations.map((recommendation, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-l-4 ${
                          recommendation.priority === 'high' ? 'border-red-400 bg-red-50' :
                          recommendation.priority === 'medium' ? 'border-yellow-400 bg-yellow-50' :
                          'border-green-400 bg-green-50'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {getPriorityIcon(recommendation.priority)}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {recommendation.message}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {recommendation.action}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <TrendingUp className="w-12 h-12 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Yet</h3>
                <p className="text-center">
                  Analyze a job posting and click "Get Match Score" to see how well you match this role.
                </p>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="card bg-green-50 border-green-200">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-green-800">💡 Analysis Tips</h3>
            </div>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-400 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                Copy the entire job posting including title, description, and requirements
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-400 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                Include hiring manager and recruiter names if mentioned
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-400 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                The more complete your profile, the better the match analysis
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-400 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                Use the extracted information to generate targeted outreach emails
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobAnalysis; 