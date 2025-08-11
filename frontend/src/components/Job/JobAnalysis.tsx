import React, { useEffect, useState } from 'react';
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
import { jobsApi, emailApi } from '../../services/api';

// Fallback dummy jobs in case backend is not working
const fallbackJobs: JobDetails[] = [
  {
    id: 'fallback-001',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    hiringManager: 'Sarah Wilson',
    location: 'San Francisco, CA',
    description: 'Join our frontend team to build amazing user experiences.',
    requirements: 'React, TypeScript, 5+ years experience',
    keySkills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML'],
    seniority: 'senior',
    remoteOption: true
  },
  {
    id: 'fallback-002',
    title: 'Backend Engineer',
    department: 'Engineering',
    hiringManager: 'Mike Chen',
    location: 'New York, NY',
    description: 'Build scalable backend systems and APIs.',
    requirements: 'Node.js, Python, Database experience',
    keySkills: ['Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker'],
    seniority: 'mid',
    remoteOption: false
  },
  {
    id: 'fallback-003',
    title: 'Product Manager',
    department: 'Product',
    hiringManager: 'Lisa Rodriguez',
    location: 'Austin, TX',
    description: 'Lead product strategy and roadmap development.',
    requirements: 'Product management experience, analytics skills',
    keySkills: ['Product Strategy', 'Analytics', 'User Research', 'Agile'],
    seniority: 'senior',
    remoteOption: true
  }
];

interface JobAnalysisProps {
  profile: CandidateProfile;
}

const JobAnalysis: React.FC<JobAnalysisProps> = ({ profile }) => {
  const [jobText, setJobText] = useState('');
  const [jobData, setJobData] = useState<JobDetails | null>(null);
  const [matchAnalysis, setMatchAnalysis] = useState<MatchAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [jobList, setJobList] = useState<JobDetails[]>([]);
  const [jobListLoading, setJobListLoading] = useState(true);
  const [jobScores, setJobScores] = useState<Record<string, number>>({});
  const [emailLoadingId, setEmailLoadingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'good' | 'poor'>('all');
  const [matchingInProgress, setMatchingInProgress] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score_desc' | 'title_asc'>('score_desc');
  const [bucketIds, setBucketIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobs = await jobsApi.getJobs(100);
        setJobList(jobs);
        // Auto-calculate match scores for all jobs
        calculateAllMatches(jobs);
      } catch (e) {
        console.warn('Backend jobs failed, using fallback jobs:', e);
        setJobList(fallbackJobs);
        calculateAllMatches(fallbackJobs);
        toast.error('Failed to load jobs');
      } finally {
        setJobListLoading(false);
      }
    };
    loadJobs();
    // Initialize bucket IDs
    try {
      const saved = localStorage.getItem('jobBucket');
      if (saved) {
        const parsed: JobDetails[] = JSON.parse(saved);
        setBucketIds(new Set(parsed.map(j => j.id || j.title)));
      }
    } catch {}
    const handleBucketUpdated = () => {
      try {
        const saved = localStorage.getItem('jobBucket');
        const parsed: JobDetails[] = saved ? JSON.parse(saved) : [];
        setBucketIds(new Set(parsed.map(j => j.id || j.title)));
      } catch {}
    };
    window.addEventListener('jobBucketUpdated', handleBucketUpdated);
    window.addEventListener('storage', handleBucketUpdated);
    return () => {
      window.removeEventListener('jobBucketUpdated', handleBucketUpdated);
      window.removeEventListener('storage', handleBucketUpdated);
    };
  }, []);

  const calculateAllMatches = async (jobs: JobDetails[]) => {
    setMatchingInProgress(true);
    const scores: Record<string, number> = {};
    
    for (const job of jobs) {
      try {
        const analysis = await jobsApi.getMatchAnalysis(profile, job);
        scores[job.id || job.title] = analysis.overallScore;
      } catch (e) {
        console.error(`Failed to match job ${job.title}:`, e);
        scores[job.id || job.title] = 0;
      }
    }
    
    setJobScores(scores);
    setMatchingInProgress(false);
    toast.success(`Calculated matches for ${jobs.length} jobs!`);
  };

  const analyzeMatchForJob = async (job: JobDetails) => {
    try {
      const analysis = await jobsApi.getMatchAnalysis(profile, job);
      setJobScores((prev) => ({ ...prev, [job.id || job.title]: analysis.overallScore }));
      return analysis.overallScore;
    } catch (e) {
      toast.error('Failed to compute match');
      return undefined;
    }
  };

  const generateEmailForJob = async (job: JobDetails) => {
    try {
      setEmailLoadingId(job.id || job.title);
      const email = await emailApi.generateEmail(profile, job, 'hiring_manager', 'professional');
      await navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`);
      toast.success('Email generated and copied to clipboard');
    } catch (e) {
      toast.error('Failed to generate email');
    } finally {
      setEmailLoadingId(null);
    }
  };

  const addToJobBucket = (job: JobDetails) => {
    try {
      const existing = localStorage.getItem('jobBucket');
      const savedJobs: JobDetails[] = existing ? JSON.parse(existing) : [];
      const jobId = job.id || job.title;
      const alreadySaved = savedJobs.some(savedJob => (savedJob.id || savedJob.title) === jobId);
      if (alreadySaved) {
        toast.error('Job is already in your bucket');
        return;
      }
      savedJobs.push(job);
      localStorage.setItem('jobBucket', JSON.stringify(savedJobs));
      setBucketIds(prev => { const next = new Set(prev); next.add(jobId); return next; });
      // Dispatch custom event to notify JobBucket component
      window.dispatchEvent(new CustomEvent('jobBucketUpdated'));
      toast.success('Job added to bucket!');
    } catch (e) {
      console.error('Error adding job to bucket:', e);
      toast.error('Failed to add job to bucket');
    }
  };

  const getFilteredJobs = () => {
    let list = [...jobList];
    // Filter by score bucket
    if (activeFilter === 'good') {
      list = list.filter(job => {
        const score = jobScores[job.id || job.title];
        return score !== undefined && score >= 60;
      });
    } else if (activeFilter === 'poor') {
      list = list.filter(job => {
        const score = jobScores[job.id || job.title];
        return score !== undefined && score < 60;
      });
    }
    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(job =>
        (job.title || '').toLowerCase().includes(q) ||
        (job.department || '').toLowerCase().includes(q) ||
        (job.location || '').toLowerCase().includes(q) ||
        (job.keySkills || []).some(s => s.toLowerCase().includes(q))
      );
    }
    // Sort
    if (sortBy === 'score_desc') {
      list.sort((a, b) => {
        const sa = jobScores[a.id || a.title];
        const sb = jobScores[b.id || b.title];
        if (sa == null && sb == null) return 0;
        if (sa == null) return 1;
        if (sb == null) return -1;
        return sb - sa;
      });
    } else if (sortBy === 'title_asc') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    return list;
  };

  const getMatchBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

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

      {/* Jobs List with Match and Email */}
      <div className="card">
        <div className="card-header sticky top-16 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Suggested Roles</h2>
              <p className="text-sm text-gray-600">
                {matchingInProgress ? 'Calculating matches...' : `${getFilteredJobs().length} of ${jobList.length} jobs`}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, skills, location..."
                className="input-field h-9 w-64"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input-field h-9 w-40"
              >
                <option value="score_desc">Sort: Match score</option>
                <option value="title_asc">Sort: Title A-Z</option>
              </select>
            </div>
            {matchingInProgress && <div className="loading-spinner" />}
          </div>
          
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeFilter === 'all' 
                  ? 'bg-primary-100 text-primary-700 font-medium' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              All Jobs ({jobList.length})
            </button>
            <button
              onClick={() => setActiveFilter('good')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeFilter === 'good' 
                  ? 'bg-green-100 text-green-700 font-medium' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Good Match ({jobList.filter(job => {
                const score = jobScores[job.id || job.title];
                return score !== undefined && score >= 60;
              }).length})
            </button>
            <button
              onClick={() => setActiveFilter('poor')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeFilter === 'poor' 
                  ? 'bg-red-100 text-red-700 font-medium' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Not Great Match ({jobList.filter(job => {
                const score = jobScores[job.id || job.title];
                return score !== undefined && score < 60;
              }).length})
            </button>
            {/* Match progress */}
            <div className="ml-auto flex items-center gap-2 text-xs text-gray-600">
              <div className="w-32 h-1.5 bg-gray-200 rounded">
                <div
                  className="h-1.5 bg-primary-500 rounded"
                  style={{ width: `${Math.round((Object.keys(jobScores).length / Math.max(jobList.length, 1)) * 100)}%` }}
                />
              </div>
              <span>{Object.keys(jobScores).length}/{jobList.length} matched</span>
            </div>
          </div>
        </div>
        {jobListLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-gray-200 rounded" />
                    <div className="h-5 w-12 bg-gray-200 rounded" />
                    <div className="h-5 w-20 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-28 bg-gray-200 rounded" />
                  <div className="h-8 w-28 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : matchingInProgress ? (
          <div className="text-gray-500 py-8 text-center">Calculating match scores...</div>
        ) : (
          <div className="divide-y">
            {getFilteredJobs().map((job) => {
              const score = jobScores[job.id || job.title];
              const jobId = job.id || job.title;
              const isSaved = bucketIds.has(jobId);
              return (
              <div key={job.id || job.title} className="py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-gray-900 truncate">{job.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{job.department}</span>
                    {score !== undefined && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getMatchBadgeColor(score)}`}>
                        {score}% match
                      </span>
                    )}
                    {job.remoteOption ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Remote</span>
                    ) : null}
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {job.location} • {job.seniority || 'mid'}
                  </div>
                  {job.keySkills && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.keySkills.slice(0, 5).map((s) => (
                        <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                   <button
                     onClick={() => analyzeMatchForJob(job)}
                     className="btn-outline text-sm"
                   >
                     {jobScores[jobId] != null ? `Match: ${jobScores[jobId]}%` : 'Get Match'}
                   </button>
                  <button
                    onClick={() => generateEmailForJob(job)}
                    disabled={emailLoadingId === jobId}
                    className="btn-primary text-sm"
                  >
                    {emailLoadingId === jobId ? 'Generating…' : 'Generate Mail'}
                  </button>
                  <button
                    onClick={() => addToJobBucket(job)}
                    className={`text-sm px-3 py-2 rounded-md border ${isSaved ? 'bg-green-50 text-green-700 border-green-200 cursor-default' : 'btn-outline'}`}
                    disabled={isSaved}
                  >
                    {isSaved ? 'Added' : 'Add to Bucket'}
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
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