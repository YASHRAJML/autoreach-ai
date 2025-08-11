import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Brain, 
  Upload, 
  FileText, 
  Lightbulb, 
  CheckCircle, 
  AlertTriangle,
  Star,
  MessageSquare,
  Download
} from 'lucide-react';
import { CandidateProfile } from '../../types';

interface CVAgentProps {
  profile: CandidateProfile;
}

interface CVAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  industryTips: string[];
  keywords: string[];
}

const CVAgent: React.FC<CVAgentProps> = ({ profile }) => {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState('');
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'agent', content: string}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'text/plain' || file.name.endsWith('.docx')) {
        setCvFile(file);
        toast.success('CV uploaded successfully!');
      } else {
        toast.error('Please upload a PDF, TXT, or DOCX file');
      }
    }
  };

  const analyzeCV = async () => {
    if (!cvFile && !cvText.trim()) {
      toast.error('Please upload a CV file or paste CV text');
      return;
    }

    setLoading(true);
    try {
      // Mock CV analysis - in real app, this would call backend API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis: CVAnalysis = {
        score: Math.floor(Math.random() * 30) + 70, // 70-100
        strengths: [
          'Strong technical skills alignment',
          'Clear career progression',
          'Quantified achievements',
          'Good formatting and structure'
        ],
        weaknesses: [
          'Missing specific keywords for target roles',
          'Could use more industry-specific achievements',
          'Limited mention of soft skills',
          'No clear personal brand statement'
        ],
        suggestions: [
          'Add more action verbs at the beginning of bullet points',
          'Include specific metrics and percentages where possible',
          'Tailor keywords to match job descriptions you\'re targeting',
          'Add a professional summary at the top',
          'Include relevant certifications and courses'
        ],
        industryTips: [
          'For tech roles, emphasize programming languages and frameworks',
          'Highlight any open-source contributions or personal projects',
          'Include links to GitHub, portfolio, or professional websites',
          'Show impact through metrics like performance improvements or cost savings',
          'Keep it to 1-2 pages maximum for most roles'
        ],
        keywords: ['JavaScript', 'React', 'Node.js', 'AWS', 'Agile', 'Leadership', 'Problem Solving']
      };

      setAnalysis(mockAnalysis);
      toast.success('CV analysis completed!');
    } catch (error) {
      toast.error('Failed to analyze CV');
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = currentMessage;
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setCurrentMessage('');
    setChatLoading(true);

    try {
      // Mock agent response - in real app, this would call backend API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const responses = [
        'Based on your profile, I recommend focusing on quantifiable achievements. For example, instead of "improved system performance," say "improved system performance by 40%, reducing load time from 3s to 1.8s."',
        'For your industry, keywords like "microservices," "CI/CD," and "cloud architecture" are trending. Make sure these appear in your CV if you have experience with them.',
        'Consider adding a "Projects" section that showcases your technical skills with brief descriptions and links to live demos or GitHub repositories.',
        'Your leadership experience should be highlighted more prominently. Consider moving team management achievements higher in your bullet points.',
        'I notice you could benefit from stronger action verbs. Try starting bullets with "Architected," "Orchestrated," "Spearheaded," instead of "Worked on" or "Helped with."'
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages(prev => [...prev, { role: 'agent', content: response }]);
    } catch (error) {
      toast.error('Failed to get response from CV Agent');
    } finally {
      setChatLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CV Agent Helper</h1>
            <p className="text-gray-600 mt-1">
              AI-powered CV analysis and career improvement tips
            </p>
          </div>
          <div className="flex items-center space-x-2 text-primary-600">
            <Brain className="w-5 h-5" />
            <span className="font-medium">AI Assistant</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload & Analysis Section */}
        <div className="space-y-6">
          {/* CV Upload */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Upload Your CV</h2>
              <p className="text-sm text-gray-600">Upload PDF, DOCX, or paste text for analysis</p>
            </div>

            <div className="space-y-4">
              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-sm text-gray-600">
                    Drop your CV here or <span className="text-primary-600 hover:text-primary-700">browse files</span>
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.txt,.docx"
                    onChange={handleFileUpload}
                  />
                </label>
                {cvFile && (
                  <div className="mt-2 flex items-center justify-center space-x-2 text-sm text-green-600">
                    <FileText className="w-4 h-4" />
                    <span>{cvFile.name}</span>
                  </div>
                )}
              </div>

              {/* Text Input Alternative */}
              <div className="text-center text-sm text-gray-500">or</div>
              
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                className="textarea-field"
                rows={8}
                placeholder="Paste your CV content here..."
              />

              <button
                onClick={analyzeCV}
                disabled={loading || (!cvFile && !cvText.trim())}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="loading-spinner" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                <span>{loading ? 'Analyzing...' : 'Analyze CV'}</span>
              </button>
            </div>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">CV Analysis Results</h2>
              </div>

              <div className="space-y-6">
                {/* Overall Score */}
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreBg(analysis.score)} mb-4`}>
                    <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                      {analysis.score}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">CV Score</h3>
                  <p className="text-sm text-gray-600">Based on industry standards</p>
                </div>

                {/* Strengths */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="w-2 h-2 bg-green-400 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tips & Chat Section */}
        <div className="space-y-6">
          {/* Suggestions */}
          {analysis && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
                  Actionable Suggestions
                </h2>
              </div>

              <div className="space-y-4">
                {analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-blue-800">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Industry Tips */}
          {analysis && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Star className="w-5 h-5 text-purple-500 mr-2" />
                  Industry-Specific Tips
                </h2>
              </div>

              <div className="space-y-3">
                {analysis.industryTips.map((tip, index) => (
                  <div key={index} className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-800">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat with Agent */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MessageSquare className="w-5 h-5 text-green-500 mr-2" />
                Chat with CV Agent
              </h2>
              <p className="text-sm text-gray-600">Ask specific questions about your CV</p>
            </div>

            <div className="space-y-4">
              {/* Chat Messages */}
              <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="text-gray-500 text-sm text-center py-8">
                    Start a conversation! Ask me about CV formatting, keywords, or career advice.
                  </div>
                ) : (
                  chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                          message.role === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-3 py-2 rounded-lg">
                      <div className="loading-spinner w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  className="input-field flex-1"
                  placeholder="Ask the CV Agent anything..."
                  disabled={chatLoading}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={chatLoading || !currentMessage.trim()}
                  className="btn-primary"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVAgent; 