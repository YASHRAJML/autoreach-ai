const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

// Initialize OpenAI (falls back to a mock if no API key)
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-key'
  });
} catch (error) {
  console.warn('OpenAI not configured, using mock responses');
}

// Mock AI response function for when API key is not provided
const generateMockEmail = (candidateProfile, jobDetails, emailType) => {
  const templates = {
    hiring_manager: `Subject: Interest in ${jobDetails.title} Position - Internal Application

Dear ${jobDetails.hiringManager || 'Hiring Manager'},

I hope this message finds you well. I am writing to express my strong interest in the ${jobDetails.title} position that was recently posted on our internal Talent Marketplace.

With my ${candidateProfile.experience} years of experience in ${candidateProfile.department}, I believe I would be a valuable addition to your team. My background in ${candidateProfile.skills?.slice(0, 3).join(', ') || 'relevant technologies'} aligns well with the requirements outlined in the job posting.

I would welcome the opportunity to discuss how my experience and passion for ${candidateProfile.interests || 'innovation'} could contribute to your team's success. Would you be available for a brief conversation about this role?

Thank you for your time and consideration.

Best regards,
${candidateProfile.name}`,
    
    recruiter: `Subject: Internal Application for ${jobDetails.title} - ${candidateProfile.name}

Hello ${jobDetails.recruiter || 'Recruiter'},

I am reaching out regarding the ${jobDetails.title} position posted internally. As a current ${candidateProfile.currentRole || 'employee'} in ${candidateProfile.department}, I am excited about the opportunity to grow within our organization.

My experience includes:
${candidateProfile.keyAchievements?.map(achievement => `• ${achievement}`).join('\n') || '• Strong performance in current role\n• Collaborative team player\n• Commitment to continuous learning'}

I have attached my updated resume and would appreciate any guidance on the application process. Please let me know if you need any additional information.

Looking forward to hearing from you.

Best regards,
${candidateProfile.name}`
  };

  return templates[emailType] || templates.hiring_manager;
};

// Generate personalized outreach email
router.post('/generate', async (req, res) => {
  try {
    const { candidateProfile, jobDetails, emailType = 'hiring_manager', tone = 'professional' } = req.body;

    if (!candidateProfile || !jobDetails) {
      return res.status(400).json({ 
        error: 'Missing required fields: candidateProfile and jobDetails' 
      });
    }

    let emailContent;

    if (process.env.OPENAI_API_KEY && openai) {
      // Use actual OpenAI API
      const prompt = `
        Generate a personalized outreach email for an internal job application with the following details:
        
        Candidate Profile:
        - Name: ${candidateProfile.name}
        - Current Role: ${candidateProfile.currentRole}
        - Department: ${candidateProfile.department}
        - Experience: ${candidateProfile.experience} years
        - Key Skills: ${candidateProfile.skills?.join(', ') || 'Various skills'}
        - Key Achievements: ${candidateProfile.keyAchievements?.join(', ') || 'Strong performance'}
        - Interests: ${candidateProfile.interests}
        
        Job Details:
        - Title: ${jobDetails.title}
        - Department: ${jobDetails.department}
        - Hiring Manager: ${jobDetails.hiringManager}
        - Job Description: ${jobDetails.description}
        - Requirements: ${jobDetails.requirements}
        
        Email Type: ${emailType}
        Tone: ${tone}
        
        Create a ${tone} email that:
        1. Shows genuine interest in the role
        2. Highlights relevant experience and skills
        3. Demonstrates knowledge of the company/team
        4. Includes a clear call to action
        5. Is concise but personalized
        6. Maintains internal networking etiquette
        
        Format the response with a subject line and body.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert career coach specializing in internal job applications and professional networking. Generate thoughtful, personalized outreach emails that help candidates stand out positively."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      });

      emailContent = completion.choices[0].message.content;
    } else {
      // Use mock response
      emailContent = generateMockEmail(candidateProfile, jobDetails, emailType);
    }

    // Parse subject and body
    const lines = emailContent.split('\n');
    const subjectLine = lines.find(line => line.toLowerCase().startsWith('subject:'))?.replace(/^subject:\s*/i, '') || 
                      `Interest in ${jobDetails.title} Position`;
    const bodyStart = lines.findIndex(line => line.toLowerCase().startsWith('subject:')) + 1;
    const body = lines.slice(bodyStart).join('\n').trim();

    res.json({
      success: true,
      email: {
        subject: subjectLine,
        body: body,
        generatedAt: new Date().toISOString(),
        emailType,
        tone
      }
    });

  } catch (error) {
    console.error('Error generating email:', error);
    res.status(500).json({ 
      error: 'Failed to generate email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get email templates
router.get('/templates', (req, res) => {
  const templates = [
    {
      id: 'hiring_manager',
      name: 'Hiring Manager Outreach',
      description: 'Direct outreach to the hiring manager',
      useCase: 'When you want to connect directly with the person who will make hiring decisions'
    },
    {
      id: 'recruiter',
      name: 'Recruiter Introduction',
      description: 'Professional introduction to the recruiter',
      useCase: 'When you want guidance on the application process and requirements'
    },
    {
      id: 'team_member',
      name: 'Team Member Network',
      description: 'Networking with current team members',
      useCase: 'When you want insights about team culture and role expectations'
    }
  ];

  res.json({ templates });
});

// Analyze email tone and suggestions
router.post('/analyze', (req, res) => {
  const { emailContent } = req.body;
  
  if (!emailContent) {
    return res.status(400).json({ error: 'Email content required' });
  }

  // Simple analysis (could be enhanced with AI)
  const analysis = {
    tone: emailContent.length > 500 ? 'detailed' : 'concise',
    readability: 'good',
    professionalism: emailContent.includes('Dear') || emailContent.includes('Hello') ? 'high' : 'medium',
    suggestions: [
      'Consider adding specific examples of your achievements',
      'Include a clear call to action',
      'Personalize the greeting if possible'
    ]
  };

  res.json({ analysis });
});

module.exports = router; 