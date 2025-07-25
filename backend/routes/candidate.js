const express = require('express');
const router = express.Router();

// In-memory storage for demo (replace with database in production)
let candidateProfiles = [
  {
    id: 'demo-candidate',
    name: 'Alex Johnson',
    currentRole: 'Software Engineer II',
    department: 'Engineering',
    experience: 4,
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
    keyAchievements: [
      'Led migration to microservices architecture, reducing system downtime by 40%',
      'Mentored 3 junior developers and improved team productivity',
      'Implemented automated testing pipeline, increasing code coverage to 90%'
    ],
    interests: 'machine learning and scalable system design',
    email: 'alex.johnson@company.com',
    phone: '+1 (555) 123-4567',
    linkedIn: 'linkedin.com/in/alexjohnson',
    careerGoals: 'Transition into a senior engineering role with focus on AI/ML applications',
    createdAt: new Date().toISOString()
  }
];

// Get candidate profile
router.get('/profile/:id?', (req, res) => {
  const { id } = req.params;
  
  if (id) {
    const profile = candidateProfiles.find(p => p.id === id);
    if (!profile) {
      return res.status(404).json({ error: 'Candidate profile not found' });
    }
    return res.json({ profile });
  }
  
  // Return demo profile if no ID provided
  res.json({ profile: candidateProfiles[0] });
});

// Create or update candidate profile
router.post('/profile', (req, res) => {
  try {
    const profileData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'currentRole', 'department'];
    const missingFields = requiredFields.filter(field => !profileData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        missingFields 
      });
    }

    // Generate ID if not provided
    const id = profileData.id || `candidate-${Date.now()}`;
    
    const profile = {
      ...profileData,
      id,
      updatedAt: new Date().toISOString(),
      createdAt: profileData.createdAt || new Date().toISOString()
    };

    // Update existing or create new
    const existingIndex = candidateProfiles.findIndex(p => p.id === id);
    if (existingIndex >= 0) {
      candidateProfiles[existingIndex] = profile;
    } else {
      candidateProfiles.push(profile);
    }

    res.json({ 
      success: true, 
      profile,
      message: existingIndex >= 0 ? 'Profile updated' : 'Profile created'
    });

  } catch (error) {
    console.error('Error saving candidate profile:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Get candidate skills suggestions
router.get('/skills/suggestions', (req, res) => {
  const { query } = req.query;
  
  const skillCategories = {
    programming: [
      'JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'Go', 'Rust',
      'PHP', 'C#', 'Swift', 'Kotlin', 'Ruby', 'Scala'
    ],
    frontend: [
      'React', 'Vue.js', 'Angular', 'HTML/CSS', 'Sass/SCSS', 'Webpack',
      'Next.js', 'Nuxt.js', 'Tailwind CSS', 'Bootstrap'
    ],
    backend: [
      'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
      'Laravel', 'Ruby on Rails', 'FastAPI', 'ASP.NET'
    ],
    cloud: [
      'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
      'Terraform', 'CloudFormation', 'Serverless'
    ],
    database: [
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
      'DynamoDB', 'Cassandra', 'Neo4j'
    ],
    tools: [
      'Git', 'Jenkins', 'GitLab CI', 'Jira', 'Confluence',
      'Slack', 'Figma', 'Postman', 'Datadog'
    ]
  };

  let suggestions = [];
  if (query) {
    // Filter skills based on query
    const queryLower = query.toLowerCase();
    Object.values(skillCategories).forEach(category => {
      suggestions.push(...category.filter(skill => 
        skill.toLowerCase().includes(queryLower)
      ));
    });
  } else {
    // Return all skills grouped by category
    suggestions = skillCategories;
  }

  res.json({ suggestions });
});

// Get achievement templates
router.get('/achievements/templates', (req, res) => {
  const templates = [
    {
      category: 'Leadership',
      examples: [
        'Led a team of X developers to deliver Y project on time',
        'Mentored X junior team members, improving their performance by Y%',
        'Coordinated cross-functional initiatives involving X teams'
      ]
    },
    {
      category: 'Technical Impact',
      examples: [
        'Improved system performance by X% through optimization',
        'Reduced deployment time from X to Y minutes',
        'Implemented solution that saved X hours per week'
      ]
    },
    {
      category: 'Process Improvement',
      examples: [
        'Introduced new workflow that increased team productivity by X%',
        'Automated manual process, reducing errors by X%',
        'Established best practices adopted across X teams'
      ]
    },
    {
      category: 'Innovation',
      examples: [
        'Developed new feature that increased user engagement by X%',
        'Created internal tool used by X% of the organization',
        'Pioneered use of X technology, becoming team expert'
      ]
    }
  ];

  res.json({ templates });
});

// Analyze profile completeness
router.post('/profile/analyze', (req, res) => {
  const { profile } = req.body;
  
  if (!profile) {
    return res.status(400).json({ error: 'Profile data required' });
  }

  const checks = [
    { field: 'name', weight: 10, required: true },
    { field: 'currentRole', weight: 10, required: true },
    { field: 'department', weight: 10, required: true },
    { field: 'experience', weight: 8, required: false },
    { field: 'skills', weight: 15, required: false, minItems: 3 },
    { field: 'keyAchievements', weight: 20, required: false, minItems: 2 },
    { field: 'interests', weight: 10, required: false },
    { field: 'careerGoals', weight: 12, required: false },
    { field: 'email', weight: 5, required: false }
  ];

  let score = 0;
  let maxScore = 0;
  const missing = [];
  const suggestions = [];

  checks.forEach(check => {
    maxScore += check.weight;
    const value = profile[check.field];
    
    if (!value || (Array.isArray(value) && value.length === 0)) {
      if (check.required) {
        missing.push(check.field);
      } else {
        suggestions.push(`Add ${check.field} to improve your profile`);
      }
    } else if (Array.isArray(value)) {
      if (check.minItems && value.length < check.minItems) {
        suggestions.push(`Add more ${check.field} (at least ${check.minItems} recommended)`);
        score += (value.length / check.minItems) * check.weight;
      } else {
        score += check.weight;
      }
    } else {
      score += check.weight;
    }
  });

  const completenessPercentage = Math.round((score / maxScore) * 100);

  res.json({
    analysis: {
      completenessPercentage,
      score: Math.round(score),
      maxScore,
      missing,
      suggestions,
      status: completenessPercentage >= 80 ? 'excellent' : 
              completenessPercentage >= 60 ? 'good' : 
              completenessPercentage >= 40 ? 'fair' : 'needs_improvement'
    }
  });
});

module.exports = router; 