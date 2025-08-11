# AutoReach AI - Smart Outreach Assistant

🚀 **AutoReach AI** is an intelligent outreach assistant designed specifically for internal job applications. It helps candidates create personalized, professional emails to hiring managers and recruiters using AI-powered content generation.

## ✨ Features

### 🎯 Core Functionality
- **AI-Powered Email Generation**: Create personalized outreach emails using OpenAI GPT
- **Job Posting Analysis**: Extract key information from job descriptions automatically
- **Candidate Profile Management**: Maintain comprehensive professional profiles
- **Match Analysis**: Get compatibility scores between your profile and job requirements
- **Multiple Email Types**: Generate emails for hiring managers, recruiters, or team members
- **Customizable Tone**: Choose from professional, friendly, formal, or casual tones

### 🔧 Technical Features
- **Modern React Frontend**: Built with TypeScript, React 18, and Tailwind CSS
- **Express.js Backend**: RESTful API with comprehensive error handling
- **AI Integration**: OpenAI API with fallback to mock responses
- **Real-time Analysis**: Live profile completeness scoring and suggestions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Professional UI/UX**: Clean, intuitive interface with modern design patterns

## 🏗️ Architecture

```
autoreach-ai/
├── backend/                 # Express.js API server
│   ├── routes/             # API route handlers
│   │   ├── email.js        # Email generation endpoints
│   │   ├── candidate.js    # Profile management
│   │   └── jobs.js         # Job analysis endpoints
│   ├── package.json        # Backend dependencies
│   └── server.js           # Main server file
├── frontend/               # React TypeScript application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API communication
│   │   ├── types/          # TypeScript definitions
│   │   └── App.tsx         # Main application
│   ├── package.json        # Frontend dependencies
│   └── public/             # Static assets
└── package.json            # Root package.json with scripts
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **OpenAI API Key** (optional - app works with mock data)

### Installation

1. **Clone and Install Dependencies**
```bash
# Clone the repository
git clone <repository-url>
cd autoreach-ai

# Install all dependencies (root, backend, and frontend)
npm run install-all
```

2. **Environment Setup** (Optional)
```bash
# Create environment file for backend
cd backend
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=your_openai_api_key_here
```

3. **Start the Application**
```bash
# Start both backend and frontend (from root directory)
npm run dev

# Or start them separately:
# Backend (runs on http://localhost:5000)
npm run server

# Frontend (runs on http://localhost:3000)
npm run client
```

4. **Access the Application**
   - Open your browser to `http://localhost:3000`
   - The backend API runs on `http://localhost:5000`

## 📱 Usage Guide

### 1. Profile Setup
- Complete your candidate profile with personal and professional information
- Add technical skills, achievements, and career goals
- The system provides real-time completeness scoring and suggestions

### 2. Job Analysis
- Paste job postings to extract key information automatically
- Get compatibility scores based on your profile
- View detailed match analysis with recommendations

### 3. Email Generation
- Input job details (manually or from analysis)
- Choose email type (hiring manager, recruiter, team member)
- Select tone and generate AI-powered personalized emails
- Copy generated emails or open in your email client

### 4. Dashboard
- View profile completeness and statistics
- Access quick actions and recent activity
- Get insights and recommendations for improvement

## 🔑 API Endpoints

### Email Generation
- `POST /api/email/generate` - Generate personalized outreach email
- `GET /api/email/templates` - Get available email templates
- `POST /api/email/analyze` - Analyze email content

### Candidate Profile
- `GET /api/candidate/profile` - Get candidate profile
- `POST /api/candidate/profile` - Save/update profile
- `GET /api/candidate/skills/suggestions` - Get skill suggestions
- `POST /api/candidate/profile/analyze` - Analyze profile completeness

### Job Analysis
- `POST /api/jobs/analyze` - Analyze job posting text
- `GET /api/jobs/sample` - Get sample job for testing
- `POST /api/jobs/match` - Get match analysis between profile and job
- `GET /api/jobs/departments` - Get department suggestions

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3b82f6) - Professional and trustworthy
- **Success**: Green (#22c55e) - Positive actions and states
- **Warning**: Yellow (#f59e0b) - Attention and caution
- **Error**: Red (#ef4444) - Errors and critical states

### Components
- Responsive grid layouts
- Card-based information architecture
- Consistent button and form styles
- Loading states and animations
- Toast notifications for user feedback

## 🛠️ Development

### Available Scripts

```bash
# Root level
npm run dev          # Start both backend and frontend
npm run install-all  # Install all dependencies
npm run build        # Build frontend for production
npm start           # Start production backend

# Backend
npm run server      # Start backend development server
cd backend && npm run dev  # Backend with nodemon

# Frontend  
npm run client      # Start frontend development server
cd frontend && npm start   # Frontend with hot reload
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Lucide React for icons
- React Hot Toast for notifications
- Axios for API communication

**Backend:**
- Node.js with Express.js
- OpenAI API integration
- CORS and security middleware
- Comprehensive error handling
- RESTful API design

## 🔒 Security & Privacy

- API keys are stored securely in environment variables
- CORS protection for API endpoints
- Input validation and sanitization
- No sensitive data stored in localStorage
- Rate limiting ready for production deployment

## 🚀 Production Deployment

### Backend Deployment
```bash
cd backend
npm install --production
npm start
```

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the build/ folder to your static hosting service
```

### Environment Variables
```bash
# Backend (.env)
PORT=5000
NODE_ENV=production
OPENAI_API_KEY=your_openai_api_key
ALLOWED_ORIGINS=https://yourdomain.com

# Frontend
REACT_APP_API_URL=https://your-backend-api.com/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. **Check the console** for error messages
2. **Verify environment setup** - ensure all dependencies are installed
3. **API Key Issues** - The app works without OpenAI API key using mock data
4. **Port Conflicts** - Ensure ports 3000 and 5000 are available

## 🎯 Roadmap

- [ ] Email template customization
- [ ] Integration with calendar systems
- [ ] Advanced analytics and reporting
- [ ] Team collaboration features
- [ ] Mobile application
- [ ] Integration with job boards
- [ ] AI-powered interview preparation

---

**Built with ❤️ for internal career growth and professional networking.** 