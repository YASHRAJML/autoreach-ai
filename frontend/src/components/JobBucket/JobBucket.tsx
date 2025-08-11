import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Bookmark, Trash2, RefreshCw } from 'lucide-react';
import { CandidateProfile, JobDetails } from '../../types';

interface JobBucketProps {
  profile: CandidateProfile;
}

const JobBucket: React.FC<JobBucketProps> = ({ profile }) => {
  const [savedJobs, setSavedJobs] = useState<JobDetails[]>([]);

  const loadSavedJobs = () => {
    try {
      const saved = localStorage.getItem('jobBucket');
      console.log('Loading saved jobs from localStorage:', saved);
      if (saved) {
        const jobs = JSON.parse(saved);
        console.log('Parsed jobs:', jobs);
        setSavedJobs([...jobs]); // Force new reference
      } else {
        setSavedJobs([]);
      }
    } catch (e) {
      console.error('Failed to load saved jobs:', e);
      setSavedJobs([]);
    }
  };

  useEffect(() => {
    loadSavedJobs();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jobBucket') {
        console.log('Storage changed, reloading jobs');
        loadSavedJobs();
      }
    };

    // Listen for custom events
    const handleJobBucketUpdate = () => {
      console.log('Custom jobBucketUpdated event received, reloading jobs');
      loadSavedJobs();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('jobBucketUpdated', handleJobBucketUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('jobBucketUpdated', handleJobBucketUpdate);
    };
  }, []);

  const removeJob = (jobId: string) => {
    try {
      const updatedJobs = savedJobs.filter(job => (job.id || job.title) !== jobId);
      setSavedJobs(updatedJobs);
      localStorage.setItem('jobBucket', JSON.stringify(updatedJobs));
      toast.success('Job removed from bucket');
    } catch (e) {
      console.error('Failed to remove job:', e);
      toast.error('Failed to remove job');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bookmark className="w-6 h-6 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Job Bucket</h1>
                <p className="text-gray-600">Saved jobs: {savedJobs.length}</p>
              </div>
            </div>
            <button
              onClick={loadSavedJobs}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {savedJobs.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs saved yet</h3>
              <p className="text-gray-600">
                Go to Job Analysis and click "Add to Bucket" to save jobs here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedJobs.map((job, index) => (
                <div key={job.id || job.title || index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.department} • {job.location}</p>
                      {job.keySkills && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {job.keySkills.slice(0, 5).map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeJob(job.id || job.title)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Remove from bucket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobBucket; 