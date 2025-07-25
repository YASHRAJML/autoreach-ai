const express = require('express');
const router = express.Router();

// Sample job postings for demo
const sampleJobs = [
  {
    id: 'job-001',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    hiringManager: 'Sarah Chen',
    recruiter: 'Mike Rodriguez',
    location: 'San Francisco, CA / Remote',
    type: 'Full-time',
    description: `We are looking for a Senior Software Engineer to join our platform team. You will be responsible for designing and implementing scalable microservices, mentoring junior developers, and contributing to our technical architecture decisions.

Key Responsibilities:
- Design and develop high-performance, scalable web applications
- Lead technical discussions and code reviews
- Mentor junior and mid-level engineers
- Collaborate with product managers and designers
- Contribute to architectural decisions`,
    requirements: `Required Qualifications:
- 5+ years of software development experience
- Strong proficiency in JavaScript, Python, or Java
- Experience with cloud platforms (AWS, Azure, GCP)
- Knowledge of microservices architecture
- Experience with containerization (Docker, Kubernetes)

Preferred Qualifications:
- Experience with React and Node.js
- Knowledge of CI/CD pipelines
- Previous mentoring experience
- Familiarity with agile development methodologies`,
    benefits: [
      'Competitive salary and equity',
      'Health, dental, and vision insurance',
      'Flexible PTO',
      'Remote work options',
      'Professional development budget'
    ],
    postedDate: '2024-01-15',
    applicationDeadline: '2024-02-15'
  }
];

// Analyze job posting from text/URL
router.post('/analyze', (req, res) => {
  try {
    const { jobText, jobUrl } = req.body;
    
    if (!jobText && !jobUrl) {
      return res.status(400).json({ 
        error: 'Either jobText or jobUrl is required' 
      });
    }

    // For demo, we'll extract from job text
    // In production, this could use AI/NLP to parse job postings
    const jobData = parseJobPosting(jobText || '');
    
    res.json({
      success: true,
      jobData,
      extractedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error analyzing job posting:', error);
    res.status(500).json({ error: 'Failed to analyze job posting' });
  }
});

// Get sample job for demo
router.get('/sample', (req, res) => {
  res.json({ job: sampleJobs[0] });
});

// Parse job posting text and extract key information
function parseJobPosting(jobText) {
  const jobData = {
    title: '',
    department: '',
    hiringManager: '',
    recruiter: '',
    location: '',
    description: '',
    requirements: '',
    keySkills: [],
    benefits: [],
    seniority: '',
    remoteOption: false
  };

  // Extract title (look for common patterns)
  const titlePatterns = [
    /title:\s*(.+)/i,
    /position:\s*(.+)/i,
    /role:\s*(.+)/i,
    /job title:\s*(.+)/i
  ];
  
  for (const pattern of titlePatterns) {
    const match = jobText.match(pattern);
    if (match) {
      jobData.title = match[1].trim();
      break;
    }
  }

  // Extract hiring manager
  const hmPatterns = [
    /hiring manager:\s*([^,\n]+)/i,
    /reports to:\s*([^,\n]+)/i,
    /manager:\s*([^,\n]+)/i
  ];
  
  for (const pattern of hmPatterns) {
    const match = jobText.match(pattern);
    if (match) {
      jobData.hiringManager = match[1].trim();
      break;
    }
  }

  // Extract department
  const deptPatterns = [
    /department:\s*([^,\n]+)/i,
    /team:\s*([^,\n]+)/i,
    /division:\s*([^,\n]+)/i
  ];
  
  for (const pattern of deptPatterns) {
    const match = jobText.match(pattern);
    if (match) {
      jobData.department = match[1].trim();
      break;
    }
  }

  // Extract location
  const locationPatterns = [
    /location:\s*([^,\n]+)/i,
    /based in:\s*([^,\n]+)/i,
    /office:\s*([^,\n]+)/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = jobText.match(pattern);
    if (match) {
      jobData.location = match[1].trim();
      break;
    }
  }

  // Check for remote work
  jobData.remoteOption = /remote|work from home|wfh|hybrid/i.test(jobText);

  // Extract seniority level
  if (/senior|sr\.|lead/i.test(jobText)) {
    jobData.seniority = 'senior';
  } else if (/junior|jr\.|entry|graduate/i.test(jobText)) {
    jobData.seniority = 'junior';
  } else if (/principal|staff|architect/i.test(jobText)) {
    jobData.seniority = 'principal';
  } else {
    jobData.seniority = 'mid';
  }

  // Extract common technical skills
  const skillKeywords = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'AWS', 'Docker', 
    'Kubernetes', 'MongoDB', 'PostgreSQL', 'TypeScript', 'Angular', 'Vue',
    'Spring', 'Django', 'Flask', 'Git', 'CI/CD', 'Agile', 'Scrum',
    'Machine Learning', 'AI', 'DevOps', 'Microservices', 'REST', 'GraphQL'
  ];

  jobData.keySkills = skillKeywords.filter(skill => 
    new RegExp(skill, 'i').test(jobText)
  );

  // Split description and requirements
  const requirementsMatch = jobText.match(/requirements?:?\s*([\s\S]*?)(?=benefits?:|$)/i);
  if (requirementsMatch) {
    jobData.requirements = requirementsMatch[1].trim();
  }

  const descMatch = jobText.match(/description:?\s*([\s\S]*?)(?=requirements?:|qualifications?:|$)/i);
  if (descMatch) {
    jobData.description = descMatch[1].trim();
  } else {
    // If no clear separation, use first part as description
    jobData.description = jobText.substring(0, 500) + '...';
  }

  return jobData;
}

// Get job match score with candidate profile
router.post('/match', (req, res) => {
  try {
    const { candidateProfile, jobData } = req.body;
    
    if (!candidateProfile || !jobData) {
      return res.status(400).json({ 
        error: 'Both candidateProfile and jobData are required' 
      });
    }

    const matchAnalysis = calculateMatchScore(candidateProfile, jobData);
    
    res.json({
      success: true,
      matchAnalysis
    });

  } catch (error) {
    console.error('Error calculating job match:', error);
    res.status(500).json({ error: 'Failed to calculate job match' });
  }
});

function calculateMatchScore(profile, job) {
  let score = 0;
  let maxScore = 0;
  const factors = [];

  // Skill matching (40% weight)
  const skillWeight = 40;
  maxScore += skillWeight;
  
  if (profile.skills && job.keySkills) {
    const matchingSkills = profile.skills.filter(skill => 
      job.keySkills.some(jobSkill => 
        skill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    const skillScore = job.keySkills.length > 0 ? 
      (matchingSkills.length / job.keySkills.length) * skillWeight : 0;
    score += skillScore;
    
    factors.push({
      factor: 'Technical Skills',
      score: Math.round(skillScore),
      maxScore: skillWeight,
      details: `${matchingSkills.length}/${job.keySkills.length} skills match`,
      matchingItems: matchingSkills
    });
  }

  // Experience level (25% weight)
  const expWeight = 25;
  maxScore += expWeight;
  
  const expScore = calculateExperienceMatch(profile.experience, job.seniority) * expWeight;
  score += expScore;
  
  factors.push({
    factor: 'Experience Level',
    score: Math.round(expScore),
    maxScore: expWeight,
    details: `${profile.experience || 0} years experience for ${job.seniority || 'mid'} level role`
  });

  // Department alignment (20% weight)
  const deptWeight = 20;
  maxScore += deptWeight;
  
  const deptScore = profile.department && job.department && 
    profile.department.toLowerCase().includes(job.department.toLowerCase()) ? deptWeight : 0;
  score += deptScore;
  
  factors.push({
    factor: 'Department Alignment',
    score: Math.round(deptScore),
    maxScore: deptWeight,
    details: deptScore > 0 ? 'Same department' : 'Different department'
  });

  // Career goals alignment (15% weight)
  const goalWeight = 15;
  maxScore += goalWeight;
  
  const goalScore = profile.careerGoals && job.title &&
    profile.careerGoals.toLowerCase().includes(job.title.toLowerCase().split(' ')[0]) ? goalWeight : goalWeight * 0.5;
  score += goalScore;
  
  factors.push({
    factor: 'Career Goals',
    score: Math.round(goalScore),
    maxScore: goalWeight,
    details: 'Alignment with stated career objectives'
  });

  const overallScore = Math.round((score / maxScore) * 100);
  
  return {
    overallScore,
    rating: overallScore >= 80 ? 'Excellent Match' :
            overallScore >= 60 ? 'Good Match' :
            overallScore >= 40 ? 'Fair Match' : 'Weak Match',
    factors,
    recommendations: generateRecommendations(factors, profile, job)
  };
}

function calculateExperienceMatch(candidateExp, jobSeniority) {
  const expRequirements = {
    'junior': { min: 0, max: 2 },
    'mid': { min: 2, max: 5 },
    'senior': { min: 5, max: 10 },
    'principal': { min: 8, max: 15 }
  };

  const reqRange = expRequirements[jobSeniority] || expRequirements.mid;
  const exp = candidateExp || 0;

  if (exp >= reqRange.min && exp <= reqRange.max) {
    return 1.0; // Perfect match
  } else if (exp < reqRange.min) {
    return Math.max(0, exp / reqRange.min * 0.7); // Partial credit if close
  } else {
    return Math.max(0.8, 1 - (exp - reqRange.max) / 10); // Slight penalty for overqualification
  }
}

function generateRecommendations(factors, profile, job) {
  const recommendations = [];
  
  // Check skill gaps
  const skillFactor = factors.find(f => f.factor === 'Technical Skills');
  if (skillFactor && skillFactor.score < skillFactor.maxScore * 0.7) {
    recommendations.push({
      type: 'skill_development',
      priority: 'high',
      message: 'Consider highlighting transferable skills or pursuing training in the required technologies',
      action: 'Review job requirements and identify skill gaps to address'
    });
  }

  // Check experience level
  const expFactor = factors.find(f => f.factor === 'Experience Level');
  if (expFactor && expFactor.score < expFactor.maxScore * 0.6) {
    recommendations.push({
      type: 'experience_positioning',
      priority: 'medium',
      message: 'Emphasize relevant project experience and achievements to demonstrate readiness',
      action: 'Highlight complex projects and leadership experiences'
    });
  }

  // General recommendations
  recommendations.push({
    type: 'networking',
    priority: 'medium',
    message: 'Connect with current team members to learn more about team culture and expectations',
    action: 'Reach out to 1-2 people on the team for informational interviews'
  });

  return recommendations;
}

// Get department suggestions
router.get('/departments', (req, res) => {
  const departments = [
    'Engineering', 'Product', 'Design', 'Data Science', 'DevOps',
    'Marketing', 'Sales', 'Customer Success', 'Operations', 'Finance',
    'Human Resources', 'Legal', 'Security', 'QA', 'Research'
  ];

  res.json({ departments });
});

module.exports = router; 