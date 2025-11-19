import React, { useState, useEffect, useReducer } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Leaf, Users, Award,Maximize2, Minimize2,  Calculator, ShoppingBag, MessageSquare, Target, Zap, Home, LogOut, Menu, X, Moon ,Trophy, Share2, AlertCircle, Heart, Send, Bot, Coins, Car, Utensils, Trash2, Lightbulb, TrendingDown } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// API Configuration
const API_URL = 'http://localhost:5000/api';

// Auth State Management
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      const user = { ...action.payload.user, id: action.payload.user.id || action.payload.user._id };
      return { ...state, user, token: action.payload.token, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, token: null, isAuthenticated: false };
    case 'UPDATE_PROFILE':
      const updatedUser = { ...state.user, ...action.payload };
      return { ...state, user: updatedUser };
    default:
      return state;
  }
};

// API Helper Functions
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Something went wrong');
  }

  return response.json();
};
const mlApiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_URL}/ml${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'ML API call failed');
  }

  return response.json();
};


function AIAssistant({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your EcoTrack AI assistant. Ask me anything about green energy, sustainability, or reducing your carbon footprint!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);  // NEW
  const [isDarkMode, setIsDarkMode] = useState(false);    // NEW

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = await apiCall('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: input })
      });
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response 
      }]);
    } catch (err) {
      console.error('AI chat error:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Dynamic styling based on mode
  const containerClasses = isMaximized 
    ? "fixed inset-4 z-50" 
    : "fixed bottom-4 right-4 w-96 h-[500px] z-50";

  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-emerald-500';
  const inputBg = isDarkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300';
  const messageBg = isDarkMode ? 'bg-gray-800' : 'bg-gray-100';
  const headerBg = isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-emerald-500 to-green-600';

  return (
    <div className={`${containerClasses} ${bgColor} rounded-2xl shadow-2xl border-2 ${borderColor} flex flex-col`}>
      {/* UPDATED HEADER */}
      <div className={`${headerBg} text-white p-4 rounded-t-2xl flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          <Bot className="w-6 h-6" />
          <span className="font-semibold">EcoTrack AI Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
          {/* NEW: Dark mode toggle (only when maximized) */}
          {isMaximized && (
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="hover:bg-white/20 p-2 rounded transition-colors"
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
            >
              <Moon className={`w-5 h-5 ${isDarkMode ? 'fill-current' : ''}`} />
            </button>
          )}
          {/* NEW: Maximize/Minimize button */}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="hover:bg-white/20 p-2 rounded transition-colors"
            title={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* UPDATED MESSAGES CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-emerald-500 text-white' 
                : `${messageBg} ${textColor}`
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className={`${messageBg} ${textColor} p-3 rounded-lg`}>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UPDATED INPUT FORM */}
      <form onSubmit={sendMessage} className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about green energy..."
            className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${inputBg}`}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-500 text-white p-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

// Main App Component
export default function EcoTrackApp() {
  const [authState, dispatch] = useReducer(authReducer, {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token')
  });
  
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [error, setError] = useState(null);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      const parsedUser = JSON.parse(user);
      dispatch({ 
        type: 'LOGIN', 
        payload: { 
          user: parsedUser, 
          token: token 
        } 
      });
    }
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      dispatch({ type: 'LOGIN', payload: { user: data.user, token: data.token } });
      setCurrentPage('dashboard');
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      const data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      dispatch({ type: 'LOGIN', payload: { user: data.user, token: data.token } });
      setCurrentPage('dashboard');
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    setCurrentPage('login');
  };

  if (!authState.isAuthenticated) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} error={error} setError={setError} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                EcoTrack
              </span>
            </div>
            
            <nav className="hidden md:flex space-x-1">
  <NavButton icon={Home} label="Dashboard" active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} />
  <NavButton icon={Calculator} label="Calculator" active={currentPage === 'calculator'} onClick={() => setCurrentPage('calculator')} />
 
  <NavButton icon={Zap} label="Energy Solutions" active={currentPage === 'energy'} onClick={() => setCurrentPage('energy')} />
  <NavButton icon={Trophy} label="Challenges" active={currentPage === 'challenges'} onClick={() => setCurrentPage('challenges')} />
  <NavButton icon={Users} label="Community" active={currentPage === 'community'} onClick={() => setCurrentPage('community')} />
  <NavButton icon={ShoppingBag} label="Shop" active={currentPage === 'shop'} onClick={() => setCurrentPage('shop')} />
</nav>

            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-emerald-50 rounded-lg">
                <Award className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-700">{authState.user.sustainabilityScore}</span>
              </div>
              <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-emerald-100 bg-white">
            <div className="px-4 py-3 space-y-1">
<MobileNavButton icon={Home} label="Dashboard" onClick={() => { setCurrentPage('dashboard'); setMobileMenuOpen(false); }} />
<MobileNavButton icon={Calculator} label="Calculator" onClick={() => { setCurrentPage('calculator'); setMobileMenuOpen(false); }} />

<MobileNavButton icon={Zap} label="Energy Solutions" onClick={() => { setCurrentPage('energy'); setMobileMenuOpen(false); }} />
<MobileNavButton icon={Trophy} label="Challenges" onClick={() => { setCurrentPage('challenges'); setMobileMenuOpen(false); }} />
<MobileNavButton icon={Users} label="Community" onClick={() => { setCurrentPage('community'); setMobileMenuOpen(false); }} />
<MobileNavButton icon={ShoppingBag} label="Shop" onClick={() => { setCurrentPage('shop'); setMobileMenuOpen(false); }} />            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'dashboard' && <Dashboard user={authState.user} dispatch={dispatch} />}
        {currentPage === 'calculator' && <CarbonCalculator user={authState.user} dispatch={dispatch} />}
        {currentPage === 'energy' && <EnergySolutions user={authState.user} />}

        {currentPage === 'challenges' && <Challenges user={authState.user} dispatch={dispatch} />}
        {currentPage === 'community' && <Community user={authState.user} />}
        {currentPage === 'shop' && <EcoShop user={authState.user} dispatch={dispatch} />}
      </main>

      {!showAI && (
        <button
          onClick={() => setShowAI(true)}
          className="fixed bottom-4 right-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 z-40"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {showAI && <AIAssistant onClose={() => setShowAI(false)} />}
    </div>
  );
}

// Navigation Components
function NavButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        active ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}

function MobileNavButton({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
      <Icon className="w-5 h-5 text-gray-600" />
      <span className="font-medium text-gray-700">{label}</span>
    </button>
  );
}

// Login Page Component
function LoginPage({ onLogin, onRegister, error, setError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isSignUp) {
        await onRegister(name, email, password);
      } else {
        await onLogin(email, password);
      }
    } catch (err) {
      // Error is handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
            EcoTrack
          </h1>
          <p className="text-gray-600">Track your sustainability journey</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Your Name"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-green-700 transition-all transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="text-emerald-600 font-semibold hover:underline">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
          <p className="text-sm text-gray-700 mb-2 font-medium">Test Credentials:</p>
          <p className="text-xs text-gray-600">Email: sarah@example.com</p>
          <p className="text-xs text-gray-600">Password: password123</p>
        </div>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard({ user, dispatch }) {
  const [carbonHistory, setCarbonHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Waste classification states
  const [selectedImage, setSelectedImage] = useState(null);
  const [classifying, setClassifying] = useState(false);
  const [classification, setClassification] = useState(null);

  useEffect(() => {
    fetchCarbonHistory();
  }, []);

  const fetchCarbonHistory = async () => {
    try {
      const data = await apiCall('/carbon/history');
      const formattedData = data.history.slice(0, 6).reverse().map(item => ({
        month: item.month,
        carbon: parseFloat(item.totalCarbon),
        target: 4.5
      }));
      setCarbonHistory(formattedData);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(URL.createObjectURL(file));
    setClassifying(true);
    setClassification(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/classify-waste', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Classification failed');
      }

      const data = await response.json();
      setClassification(data);
    } catch (error) {
      console.error('Error classifying waste:', error);
      alert('Failed to classify image. Please try again.');
    } finally {
      setClassifying(false);
    }
  };

  const categoryData = [
    { name: 'Transport', value: 35, color: '#10b981' },
    { name: 'Energy', value: 30, color: '#059669' },
    { name: 'Food', value: 25, color: '#047857' },
    { name: 'Waste', value: 10, color: '#065f46' }
  ];

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Leaf}
          title="Carbon Footprint"
          value={`${user.carbonFootprint || 0} tons`}
          change="-12%"
          positive={true}
        />
        <StatCard
          icon={Trophy}
          title="Challenges Joined"
          value={user.joinedChallenges || 0}
          change="+2"
          positive={true}
        />
        <StatCard
          icon={Award}
          title="Sustainability Score"
          value={user.sustainabilityScore || 0}
          change="+8"
          positive={true}
        />
        <StatCard
          icon={Target}
          title="Goal Progress"
          value="68%"
          change="+15%"
          positive={true}
        />
      </div>

      {/* NEW: Waste Classification Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          <Trash2 className="w-5 h-5 mr-2 text-emerald-600" />
          AI Waste Classifier - Is it Recyclable?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload an image of your waste item
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-emerald-50 file:text-emerald-700
                hover:file:bg-emerald-100 cursor-pointer"
            />
            
            {selectedImage && (
              <div className="mt-4">
                <img 
                  src={selectedImage} 
                  alt="Selected waste item" 
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>

          <div>
            {classifying && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing image...</p>
              </div>
            )}

            {!classifying && !classification && (
              <div className="text-center py-12 text-gray-400">
                <Trash2 className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Upload an image to classify waste type</p>
              </div>
            )}

            {classification && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  classification.prediction.recyclable 
                    ? 'bg-green-50 border-2 border-green-500' 
                    : 'bg-red-50 border-2 border-red-500'
                }`}>
                  <h4 className="font-bold text-lg mb-2">
                    {classification.prediction.recyclable ? '♻️ Recyclable!' : '🚫 Not Recyclable'}
                  </h4>
                  <p className="text-sm mb-1">
                    <strong>Material:</strong> <span className="capitalize">{classification.prediction.class}</span>
                  </p>
                  <p className="text-sm">
                    <strong>Confidence:</strong> {classification.prediction.confidence}%
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold mb-2 text-gray-700">All Predictions:</h5>
                  <div className="space-y-2">
                    {classification.allPredictions.map((pred, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                        <span className="text-sm capitalize font-medium">{pred.class}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-600">{pred.confidence}%</span>
                          <span className="text-lg">{pred.recyclable ? '♻️' : '🚫'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Carbon Footprint Trend</h3>
          {carbonHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={carbonHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="carbon" stroke="#10b981" strokeWidth={3} name="Actual" />
                <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Target" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <LineChart className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p>No data available. Calculate your footprint to get started!</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Achievements</h3>
        {user.achievements && user.achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {user.achievements.map((achievement, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                <Award className="w-8 h-8 text-emerald-600" />
                <span className="font-medium text-gray-800">{achievement}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Complete challenges to earn achievements!</p>
          </div>
        )}
      </div>
    </div>
  );
}


function StatCard({ icon: Icon, title, value, change, positive }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 text-emerald-600" />
        <span className={`text-sm font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Calculate distance between two coordinates (Haversine formula)
const calculateMapDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};


function CarbonCalculator({ user, dispatch }) {
  // ========== EXISTING CALCULATOR STATES ==========
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [distance, setDistance] = useState(0);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [weeklyDistance, setWeeklyDistance] = useState(0);
  const [monthlyDistance, setMonthlyDistance] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [selectingPoint, setSelectingPoint] = useState(null);
  const [vehicleType, setVehicleType] = useState('car');
  const [fuelType, setFuelType] = useState('petrol');
  const [energy, setEnergy] = useState(150);
  const [dietType, setDietType] = useState('mixed');
  const [foodSource, setFoodSource] = useState('mixed');
  const [foodType, setFoodType] = useState('mixed');
  const [wasteType, setWasteType] = useState('mixed');
  const [wasteAmount, setWasteAmount] = useState(10);
  const [calculated, setCalculated] = useState(false);
  const [carbonBreakdown, setCarbonBreakdown] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  // ========== NEW: ML PREDICTOR STATES ==========
  const [showMLPredictor, setShowMLPredictor] = useState(false);
  const [mlPrediction, setMlPrediction] = useState(null);
  const [mlWeeklyTrend, setMlWeeklyTrend] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [trainingModel, setTrainingModel] = useState(false);
  const [mlLoading, setMlLoading] = useState(false);

  // NEW: Fetch model info on mount
  useEffect(() => {
    fetchModelInfo();
  }, []);

  const fetchModelInfo = async () => {
    try {
      const data = await mlApiCall('/model-info');
      if (data.success && data.info) {
        setModelInfo(data.info);
      }
    } catch (err) {
      console.error('Error fetching model info:', err);
    }
  };

  // ========== EXISTING CALCULATOR FUNCTIONS ==========
  const handleCalculateDistance = () => {
    if (startCoords && endCoords) {
      const dist = calculateMapDistance(
        startCoords.lat, startCoords.lng,
        endCoords.lat, endCoords.lng
      );
      const oneWay = Math.round(dist);
      const roundTrip = oneWay * 2;
      const weekly = roundTrip * daysPerWeek;
      const monthly = weekly * 4.33;
      
      setDistance(oneWay);
      setWeeklyDistance(weekly);
      setMonthlyDistance(Math.round(monthly));
    }
  };

  const calculate = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/carbon/calculate', {
        method: 'POST',
        body: JSON.stringify({
          transport: { distance: weeklyDistance || distance, vehicleType, fuelType },
          energy,
          food: { dietType, foodSource, foodType },
          waste: { wasteType, wasteAmount }
        }),
      });
      
      setCarbonBreakdown(data.breakdown);
      setRecommendations(data.recommendations);
      setCalculated(true);
      
      dispatch({ 
        type: 'UPDATE_PROFILE', 
        payload: { carbonFootprint: parseFloat(data.totalCarbon) } 
      });
    } catch (err) {
      console.error('Error calculating carbon:', err);
      alert('Error calculating carbon footprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ========== NEW: ML PREDICTOR FUNCTIONS ==========
  const trainModel = async () => {
    setTrainingModel(true);
    try {
      const data = await mlApiCall('/train-model', { method: 'POST' });
      setModelMetrics(data.metrics);
      await fetchModelInfo();
      alert('✅ Model trained successfully!\n\nMetrics:\n' +
        `• R² Score: ${data.metrics.test_r2}\n` +
        `• MAE: ${data.metrics.test_mae} kg CO2/week`
      );
    } catch (err) {
      alert('Error training model: ' + err.message);
    } finally {
      setTrainingModel(false);
    }
  };

  const predictWithML = async () => {
    setMlLoading(true);
    try {
      // Use current calculator inputs for prediction
      const predictionData = {
        transport: {
          tripsPerWeek: Math.round(weeklyDistance / (distance * 2)) || 10,
          distancePerTrip: distance || 20,
          vehicleType: vehicleType,
          fuelType: fuelType
        },
        energy: energy,
        food: { dietType: dietType },
        waste: { wasteType: wasteType, wasteAmount: wasteAmount }
      };

      const data = await mlApiCall('/predict', {
        method: 'POST',
        body: JSON.stringify(predictionData)
      });
      
      if (data.success) {
        setMlPrediction(data);
        
        // Get weekly trend
        const trendData = await mlApiCall('/weekly-trend', {
          method: 'POST',
          body: JSON.stringify({
            currentData: predictionData,
            weeks: 4
          })
        });
        
        if (trendData.success) {
          setMlWeeklyTrend(trendData.trend);
        }
      }
    } catch (err) {
      alert('Error predicting footprint: ' + err.message);
    } finally {
      setMlLoading(false);
    }
  };

  const MapSelector = () => {
    const MapClickHandler = () => {
      useMapEvents({
        click: (e) => {
          if (selectingPoint === 'start') {
            setStartCoords(e.latlng);
          } else if (selectingPoint === 'end') {
            setEndCoords(e.latlng);
          }
          setShowMap(false);
        },
      });
      return null;
    };

    return showMap ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-4 max-w-4xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Select {selectingPoint === 'start' ? 'Starting Point' : 'Destination'}
            </h3>
            <button onClick={() => setShowMap(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div style={{ height: '500px', width: '100%' }}>
            <MapContainer center={[24.8607, 67.0011]} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapClickHandler />
              {startCoords && <Marker position={[startCoords.lat, startCoords.lng]} />}
              {endCoords && <Marker position={[endCoords.lat, endCoords.lng]} />}
            </MapContainer>
          </div>
        </div>
      </div>
    ) : null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ========== TOGGLE BUTTONS: Calculator vs ML Predictor ========== */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-emerald-100">
        <div className="flex space-x-4">
          <button
            onClick={() => setShowMLPredictor(false)}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              !showMLPredictor
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Standard Calculator
          </button>
          <button
            onClick={() => setShowMLPredictor(true)}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              showMLPredictor
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🤖 AI ML Predictor
          </button>
        </div>
      </div>

      {/* ========== STANDARD CALCULATOR VIEW ========== */}
      {!showMLPredictor && (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-emerald-100">
          <div className="flex items-center space-x-3 mb-6">
            <Calculator className="w-8 h-8 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-800">Advanced Carbon Footprint Calculator</h2>
          </div>

          {/* ALL YOUR EXISTING CALCULATOR CODE HERE */}
          {/* Transport Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Car className="w-6 h-6 text-emerald-600" />
              <h3 className="text-xl font-semibold text-gray-800">Transport</h3>
            </div>
            
            {/* ... ALL YOUR EXISTING TRANSPORT INPUTS ... */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Starting Point</label>
              <button
                type="button"
                onClick={() => { setShowMap(true); setSelectingPoint('start'); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left hover:bg-gray-50"
              >
                {startCoords ? `${startCoords.lat.toFixed(4)}, ${startCoords.lng.toFixed(4)}` : 'Click to select on map'}
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
              <button
                type="button"
                onClick={() => { setShowMap(true); setSelectingPoint('end'); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left hover:bg-gray-50"
              >
                {endCoords ? `${endCoords.lat.toFixed(4)}, ${endCoords.lng.toFixed(4)}` : 'Click to select on map'}
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days per week (Round trip)
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={handleCalculateDistance}
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={!startCoords || !endCoords}
            >
              Calculate Distance
            </button>

            {weeklyDistance > 0 && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-700 font-medium">📍 Weekly: {weeklyDistance} km</p>
                <p className="text-blue-600 text-sm">Monthly: {monthlyDistance} km</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="car">Car</option>
                  <option value="bus">Bus</option>
                  <option value="motorbike">Motorbike</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="walk">Walking</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  disabled={vehicleType === 'bicycle' || vehicleType === 'walk'}
                >
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="cng">CNG</option>
                </select>
              </div>
            </div>
          </div>

          {/* Energy Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb className="w-6 h-6 text-emerald-600" />
              <h3 className="text-xl font-semibold text-gray-800">Energy Consumption</h3>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-gray-700 font-medium">Monthly Energy Usage</label>
                <span className="text-emerald-600 font-semibold">{energy} kWh</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>

          {/* Food Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Utensils className="w-6 h-6 text-emerald-600" />
              <h3 className="text-xl font-semibold text-gray-800">Food Consumption</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
                <select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="meat">Meat-based</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Food Source</label>
                <select
                  value={foodSource}
                  onChange={(e) => setFoodSource(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="local">Local</option>
                  <option value="imported">Imported</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Food Type</label>
                <select
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="organic">Organic</option>
                  <option value="conventional">Conventional</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Waste Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Trash2 className="w-6 h-6 text-emerald-600" />
              <h3 className="text-xl font-semibold text-gray-800">Waste Management</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Waste Type</label>
                <select
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="recyclable">Recyclable</option>
                  <option value="landfill">Landfill</option>
                  <option value="compostable">Compostable</option>
                  <option value="plastic">Plastic</option>
                  <option value="ewaste">E-waste</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-gray-700 font-medium">Weekly Waste</label>
                  <span className="text-emerald-600 font-semibold">{wasteAmount} kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={wasteAmount}
                  onChange={(e) => setWasteAmount(Number(e.target.value))}
                  className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            </div>
          </div>

          <button
            onClick={calculate}
            disabled={loading || weeklyDistance === 0}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-lg font-semibold hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Calculate My Footprint'}
          </button>

          {/* Standard Calculator Results */}
          {calculated && carbonBreakdown && (
            <div className="mt-6 space-y-6">
              <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border-2 border-emerald-200">
                <div className="text-center">
                  <p className="text-gray-600 mb-2">Your Annual Carbon Footprint</p>
                  <p className="text-4xl font-bold text-emerald-600 mb-2">{carbonBreakdown.total} tons</p>
                  <p className="text-sm text-gray-600">CO₂ equivalent per year</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-emerald-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Carbon Footprint Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={carbonBreakdown.categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="carbon" fill="#10b981" name="CO₂ (tons)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {recommendations.length > 0 && (
                <div className="bg-white p-6 rounded-lg border border-emerald-100">
                  <div className="flex items-center space-x-2 mb-4">
                    <TrendingDown className="w-6 h-6 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Personalized Recommendations</h3>
                  </div>
                  <div className="space-y-3">
                    {recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start space-x-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                        <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{rec.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                          <p className="text-sm text-emerald-600 font-semibold mt-2">
                            💡 Save {rec.savings} tons CO₂/year
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========== ML PREDICTOR VIEW ========== */}
      {showMLPredictor && (
        <>
          {/* Model Training Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-sm p-6 border-2 border-purple-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">🤖 AI Model Training</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600">Training Data</p>
                <p className="text-2xl font-bold text-purple-600">100 Users</p>
                <p className="text-xs text-gray-500">Synthetic realistic profiles</p>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600">Model Type</p>
                <p className="text-2xl font-bold text-pink-600">Random Forest</p>
                <p className="text-xs text-gray-500">100 decision trees</p>
              </div>
            </div>
            
            {modelMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600">R² Score</p>
                  <p className="text-xl font-bold text-green-600">{modelMetrics.test_r2}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600">MAE</p>
                  <p className="text-xl font-bold text-blue-600">{modelMetrics.test_mae} kg</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600">RMSE</p>
                  <p className="text-xl font-bold text-amber-600">{modelMetrics.test_rmse} kg</p>
                </div>
              </div>
            )}
            
            <button
              onClick={trainModel}
              disabled={trainingModel}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50"
            >
              {trainingModel ? '🔄 Training Model...' : '🎯 Train / Retrain Model'}
            </button>
          </div>

          {/* Use Current Calculator Inputs for ML Prediction */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              🔮 ML Prediction Based on Your Inputs
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Using your current calculator settings: {weeklyDistance || distance}km/week transport, 
              {energy}kWh energy, {dietType} diet, {wasteAmount}kg waste
            </p>
            
            <button
              onClick={predictWithML}
              disabled={mlLoading || !modelInfo?.trained || weeklyDistance === 0}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-lg font-semibold hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-50"
            >
              {mlLoading ? '🔮 Predicting...' : '🔮 Get AI Prediction'}
            </button>
            
            {!modelInfo?.trained && (
              <p className="text-center text-sm text-amber-600 mt-2">
                ⚠️ Please train the model first
              </p>
            )}
            {weeklyDistance === 0 && modelInfo?.trained && (
              <p className="text-center text-sm text-amber-600 mt-2">
                ⚠️ Please calculate distance first in the transport section
              </p>
            )}
          </div>

          {/* ML Prediction Results */}
          {mlPrediction && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">AI Predicted Footprint</p>
                  <p className="text-3xl font-bold text-blue-600">{mlPrediction.prediction}</p>
                  <p className="text-sm text-gray-600">{mlPrediction.unit}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Range: {mlPrediction.lowerBound} - {mlPrediction.upperBound} kg
                  </p>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Confidence</p>
                  <p className="text-3xl font-bold text-green-600">{mlPrediction.confidence}%</p>
                  <p className="text-sm text-gray-600">Model accuracy</p>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-200">
                  <p className="text-sm text-gray-600 mb-1">vs. Average</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {modelInfo ? (
                      mlPrediction.prediction > modelInfo.mean_footprint ? '+' : '-'
                    ) : ''}
                    {modelInfo ? Math.abs(mlPrediction.prediction - modelInfo.mean_footprint).toFixed(1) : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">kg CO2 difference</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Contribution Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { category: 'Transport', value: mlPrediction.breakdown.transport },
                    { category: 'Energy', value: mlPrediction.breakdown.energy },
                    { category: 'Food', value: mlPrediction.breakdown.food },
                    { category: 'Waste', value: mlPrediction.breakdown.waste }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#10b981" name="kg CO2/week" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Weekly Trend */}
              {mlWeeklyTrend && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">4-Week Prediction Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mlWeeklyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="week" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="predicted" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        name="Predicted" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="lower_bound" 
                        stroke="#93c5fd" 
                        strokeDasharray="5 5" 
                        name="Lower Bound" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="upper_bound" 
                        stroke="#93c5fd" 
                        strokeDasharray="5 5" 
                        name="Upper Bound" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <MapSelector />
    </div>
  );
}



function QuizChallenge({ challengeId, onComplete, onClose }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      question: "Which renewable energy source uses photovoltaic cells?",
      options: ["Wind Energy", "Solar Energy", "Hydroelectric", "Geothermal"],
      correct: 1
    },
    {
      question: "What percentage of the world's electricity comes from renewable sources?",
      options: ["10%", "29%", "50%", "75%"],
      correct: 1
    },
    {
      question: "Which country leads in wind energy production?",
      options: ["USA", "Germany", "China", "Denmark"],
      correct: 2
    },
    {
      question: "What is the most abundant renewable energy source?",
      options: ["Solar", "Wind", "Biomass", "Hydroelectric"],
      correct: 0
    },
    {
      question: "LED bulbs use how much less energy than incandescent bulbs?",
      options: ["25%", "50%", "75%", "90%"],
      correct: 2
    }
  ];

  const handleAnswer = (selectedIndex) => {
    if (selectedIndex === questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleComplete = async () => {
    try {
      const data = await apiCall(`/challenges/${challengeId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ score })
      });
      onComplete(data);
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  if (showResult) {
    const passed = score >= 3;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <div className={`text-6xl mb-4`}>{passed ? '🎉' : '😔'}</div>
          <h3 className="text-2xl font-bold mb-2">
            {passed ? 'Congratulations!' : 'Try Again!'}
          </h3>
          <p className="text-gray-600 mb-4">
            You scored {score} out of {questions.length}
          </p>
          {passed ? (
            <button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-lg font-semibold"
            >
              Claim +20 Points
            </button>
          ) : (
            <button onClick={onClose} className="w-full bg-gray-500 text-white py-3 rounded-lg">
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Green Energy Quiz</h3>
          <button onClick={onClose} className="text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>Score: {score}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <h4 className="text-lg font-semibold mb-4">
          {questions[currentQuestion].question}
        </h4>

        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SolarGameChallenge({ challengeId, onComplete, onClose }) {
  const canvasRef = React.useRef(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let player = { x: 50, y: canvas.height / 2, size: 30, speed: 5 };
    let panels = [];
    let clouds = [];
    let score = 0;
    let animationId;

    const spawnPanel = () => {
      panels.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 30),
        size: 25
      });
    };

    const spawnCloud = () => {
      clouds.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 40),
        size: 35
      });
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw player (solar collector)
      ctx.fillStyle = '#10b981';
      ctx.fillRect(player.x, player.y, player.size, player.size);
      ctx.fillText('☀️', player.x, player.y + 20);

      // Update and draw panels
      panels = panels.filter(panel => {
        panel.x -= 3;
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(panel.x, panel.y, panel.size, panel.size);

        // Collision with player
        if (
          player.x < panel.x + panel.size &&
          player.x + player.size > panel.x &&
          player.y < panel.y + panel.size &&
          player.y + player.size > panel.y
        ) {
          score += 10;
          return false;
        }

        return panel.x > -panel.size;
      });

      // Update and draw clouds
      clouds = clouds.filter(cloud => {
        cloud.x -= 4;
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(cloud.x, cloud.y, cloud.size, cloud.size);
        ctx.fillText('☁️', cloud.x, cloud.y + 25);

        // Collision with player (game over)
        if (
          player.x < cloud.x + cloud.size &&
          player.x + player.size > cloud.x &&
          player.y < cloud.y + cloud.size &&
          player.y + player.size > cloud.y
        ) {
          setGameScore(score);
          setGameOver(true);
          cancelAnimationFrame(animationId);
          return false;
        }

        return cloud.x > -cloud.size;
      });

      // Draw score
      ctx.fillStyle = '#000';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, 10, 30);

      // Continue game
      if (score < 1000) {
        animationId = requestAnimationFrame(gameLoop);
      } else {
        setGameScore(score);
        setGameOver(true);
      }
    };

    // Keyboard controls
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp') player.y = Math.max(0, player.y - player.speed * 5);
      if (e.key === 'ArrowDown') player.y = Math.min(canvas.height - player.size, player.y + player.speed * 5);
    };

    window.addEventListener('keydown', handleKeyDown);

    // Start spawning
    const panelInterval = setInterval(spawnPanel, 2000);
    const cloudInterval = setInterval(spawnCloud, 3000);

    // Start game
    gameLoop();

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(panelInterval);
      clearInterval(cloudInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleComplete = async () => {
    if (gameScore >= 200) {
      try {
        const data = await apiCall(`/challenges/${challengeId}/complete`, {
          method: 'POST',
          body: JSON.stringify({ score: gameScore })
        });
        onComplete(data);
        onClose();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (gameOver) {
    const won = gameScore >= 200;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">{won ? '🎉' : '💨'}</div>
          <h3 className="text-2xl font-bold mb-2">
            {won ? 'Amazing!' : 'Keep Trying!'}
          </h3>
          <p className="text-gray-600 mb-4">Score: {gameScore}</p>
          <p className="text-sm text-gray-500 mb-4">
            {won ? 'You collected enough solar energy!' : 'Collect 200+ points to win!'}
          </p>
          {won && (
            <button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-lg"
            >
              Claim +50 Points
            </button>
          )}
          <button onClick={onClose} className="w-full mt-2 bg-gray-200 py-3 rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-3xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Solar Panel Power Rush</h3>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Use ↑↓ arrow keys to collect solar panels (yellow) and avoid clouds (gray). Score 200+ to win!
        </p>
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="border-2 border-gray-300 rounded-lg w-full"
        />
      </div>
    </div>
  );
}



// Challenges Component
function Challenges({ user, dispatch }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    fetchChallenges();
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);


  const fetchChallenges = async () => {
    try {
      const data = await apiCall(`/challenges?category=${selectedCategory}`);
      setChallenges(data.challenges);
    } catch (err) {
      console.error('Error fetching challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const data = await apiCall('/leaderboard');
      setLeaderboard(data.leaderboard.slice(0, 5));
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      await apiCall(`/challenges/${challengeId}/join`, { method: 'POST' });
      fetchChallenges();
      dispatch({ type: 'UPDATE_PROFILE', payload: { joinedChallenges: (user.joinedChallenges || 0) + 1 } });
    } catch (err) {
      console.error('Error joining challenge:', err);
      alert(err.message);
    }
  };

  const handleLeaveChallenge = async (challengeId) => {
    try {
      await apiCall(`/challenges/${challengeId}/leave`, { method: 'POST' });
      fetchChallenges();
      dispatch({ type: 'UPDATE_PROFILE', payload: { joinedChallenges: Math.max(0, (user.joinedChallenges || 0) - 1) } });
    } catch (err) {
      console.error('Error leaving challenge:', err);
    }
  };

  const categories = ['all', 'carbon', 'energy', 'waste', 'transport', 'food'];

  if (loading) {
    return <div className="text-center py-12">Loading challenges...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-800">Community Challenges</h2>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{challenges.reduce((acc, c) => acc + c.participantCount, 0)} active participants</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {leaderboard.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-amber-500" />
            Top Contributors (by Points)
          </h3>
          <div className="space-y-3">
            {leaderboard.map((contributor, idx) => (
              <div key={contributor._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                    idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700' :
                    idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                    'bg-gradient-to-br from-emerald-400 to-green-500 text-white'
                  }`}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{contributor.name}</p>
                    <p className="text-xs text-gray-500">{contributor.completedChallenges} challenges completed</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span className="text-xl font-bold text-emerald-600">{contributor.sustainabilityScore}</span>
                  <span className="text-sm text-gray-500">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.length > 0 ? (
          challenges.map((challenge) => (
            // In Challenges component, CHANGE:
<ChallengeCard
  key={challenge._id}
  challenge={challenge}
  onJoin={handleJoinChallenge}
  onLeave={handleLeaveChallenge}
  dispatch={dispatch}  // ADD THIS PROP
/>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No challenges available in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChallengeCard({ challenge, onJoin, onLeave, dispatch }) {  // ADD dispatch prop
  const [showQuiz, setShowQuiz] = useState(false);  // MOVE INSIDE
  const [showGame, setShowGame] = useState(false);  // MOVE INSIDE
  
  const difficultyColors = {
    Easy: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Hard: 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{challenge.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[challenge.difficulty]}`}>
          {challenge.difficulty}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Category</span>
          <span className="font-medium text-gray-700 capitalize">{challenge.category}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Reward</span>
          <span className="font-semibold text-emerald-600">+{challenge.reward} points</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Participants</span>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-700">{challenge.participantCount}</span>
          </div>
        </div>
      </div>

      {challenge.isJoined && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-semibold text-emerald-600">{challenge.userProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full transition-all"
              style={{ width: `${challenge.userProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* REPLACE YOUR BUTTON WITH THIS: */}
      <button
        onClick={() => {
          if (challenge.isJoined) {
            if (challenge.challengeType === 'quiz' && !challenge.isCompleted) {
              setShowQuiz(true);
            } else if (challenge.challengeType === 'game' && !challenge.isCompleted) {
              setShowGame(true);
            } else {
              onLeave(challenge._id);
            }
          } else {
            if (challenge.challengeType === 'placeholder') {
              alert('This challenge is coming soon!');
            } else {
              onJoin(challenge._id);
            }
          }
        }}
        disabled={challenge.challengeType === 'placeholder'}
        className={`w-full py-3 rounded-lg font-semibold transition-all ${
          challenge.challengeType === 'placeholder'
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : challenge.isJoined
            ? challenge.isCompleted
              ? 'bg-green-100 text-green-700'
              : challenge.challengeType === 'quiz'
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : challenge.challengeType === 'game'
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'
        }`}
      >
        {challenge.challengeType === 'placeholder'
          ? 'Coming Soon'
          : challenge.isCompleted
          ? '✓ Completed'
          : challenge.isJoined
          ? challenge.challengeType === 'quiz'
            ? 'Start Quiz'
            : challenge.challengeType === 'game'
            ? 'Play Game'
            : 'Leave Challenge'
          : 'Join Challenge'}
      </button>

      {/* ADD MODALS HERE - INSIDE THE COMPONENT */}
      {showQuiz && (
        <QuizChallenge
          challengeId={challenge._id}
          onComplete={(data) => {
            dispatch({ type: 'UPDATE_PROFILE', payload: data.user });
            onJoin(challenge._id); // Refresh challenges
          }}
          onClose={() => setShowQuiz(false)}
        />
      )}

      {showGame && (
        <SolarGameChallenge
          challengeId={challenge._id}
          onComplete={(data) => {
            dispatch({ type: 'UPDATE_PROFILE', payload: data.user });
            onJoin(challenge._id); // Refresh challenges
          }}
          onClose={() => setShowGame(false)}
        />
      )}
    </div>
  );
}



// Community Component with Real-time Updates
function Community({ user }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetchPosts();
  // Remove the interval that refreshes every 5 seconds
  // Only fetch on mount
}, []);

  const fetchPosts = async () => {
    try {
      const data = await apiCall('/posts');
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const data = await apiCall('/posts', {
        method: 'POST',
        body: JSON.stringify({ content: newPost })
      });
      
      const newPostWithAuthor = {
        ...data.post,
        author: {
          _id: user.id,
          name: user.name || 'Anonymous',
          email: user.email || '',
          sustainabilityScore: user.sustainabilityScore || 0
        },
        likes: [],
        likesCount: 0,
        isLiked: false,
        comments: [],
        commentsCount: 0
      };
      
      setPosts(prevPosts => [newPostWithAuthor, ...prevPosts]);
      setNewPost('');
    } catch (err) {
      console.error('Error creating post:', err);
      alert(`Failed to create post: ${err.message}`);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const data = await apiCall(`/posts/${postId}/like`, { method: 'POST' });
      
      setPosts(prevPosts => prevPosts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            likesCount: data.likesCount,
            isLiked: data.isLiked,
            likes: data.isLiked 
              ? [...post.likes, user.id]
              : post.likes.filter(id => id !== user.id)
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

const handleAddComment = async (postId, content) => {
  if (!content.trim()) return;

  try {
    const data = await apiCall(`/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
    
    // Immediately update UI with new comment
    setPosts(prevPosts => prevPosts.map(post => {
      if (post._id === postId) {
        const newComment = {
          _id: Date.now().toString(), // Temporary ID
          content: content,
          createdAt: new Date(),
          author: {
            _id: user.id,
            name: user.name,
            email: user.email
          }
        };
        
        return {
          ...post,
          comments: [...post.comments, newComment],
          commentsCount: post.comments.length + 1
        };
      }
      return post;
    }));
  } catch (err) {
    console.error('Error adding comment:', err);
    alert('Failed to add comment. Please try again.');
  }
};

  if (loading) {
    return <div className="text-center py-12">Loading community posts...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
        <div className="flex items-center space-x-3 mb-6">
          <Users className="w-8 h-8 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-800">Community</h2>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-3">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your sustainability journey..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            rows="3"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-emerald-600 hover:to-green-700 transition-all flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Post</span>
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={user.id}
              onLike={handleLikePost}
              onComment={handleAddComment}
            />
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-emerald-100">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No posts yet. Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post, currentUserId, onLike, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post._id, commentText);
      setCommentText('');
    }
  };

  if (!post.author || !post.author.name) {
    return null;
  }

  const validComments = (post.comments || []).filter(
    comment => comment && comment.author && comment.author.name
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">{post.author.name[0].toUpperCase()}</span>
        </div>
        <div>
          <p className="font-semibold text-gray-800">{post.author.name}</p>
          <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{post.content}</p>

      <div className="flex items-center space-x-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            post.isLiked ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50 text-gray-600'
          }`}
        >
          <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{post.likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm font-medium">{validComments.length}</span>
        </button>

        <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
          <Share2 className="w-4 h-4" />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          {validComments.map((comment) => (
            <div key={comment._id} className="flex space-x-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-700 text-sm font-semibold">
                  {comment.author.name[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-sm text-gray-800 mb-1">{comment.author.name}</p>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}

          <form onSubmit={handleSubmitComment} className="flex space-x-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
            <button
              type="submit"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// Eco Shop Component
// Eco Shop Component
function EcoShop({ user, dispatch }) {
  const products = [
    {
      id: 1,
      name: 'Bamboo Toothbrush Set',
      pricePoints: 160,
      image: '🪥',
      category: 'Personal Care',
      eco_score: 95,
      description: 'Biodegradable bamboo toothbrushes'
    },
    {
      id: 2,
      name: 'Reusable Water Bottle',
      pricePoints: 250,
      image: '🧴',
      category: 'Kitchen',
      eco_score: 90,
      description: 'Stainless steel, BPA-free'
    },
    {
      id: 3,
      name: 'Organic Cotton Tote',
      pricePoints: 130,
      image: '👜',
      category: 'Accessories',
      eco_score: 88,
      description: 'Durable and eco-friendly'
    },
    {
      id: 4,
      name: 'Solar Power Bank',
      pricePoints: 500,
      image: '🔋',
      category: 'Electronics',
      eco_score: 85,
      description: 'Charge with solar energy'
    },
    {
      id: 5,
      name: 'Beeswax Food Wraps',
      pricePoints: 190,
      image: '🍯',
      category: 'Kitchen',
      eco_score: 92,
      description: 'Replace plastic wrap naturally'
    },
    {
      id: 6,
      name: 'LED Light Bulbs',
      pricePoints: 300,
      image: '💡',
      category: 'Home',
      eco_score: 94,
      description: 'Energy-efficient lighting'
    }
  ];

  const handlePurchase = async (product) => {
    if (user.sustainabilityScore >= product.pricePoints) {
      const confirmed = window.confirm(
        `Redeem ${product.pricePoints} points for ${product.name}?\n\nYou'll receive an email with a confirmation form to complete your redemption.`
      );
      
      if (confirmed) {
        try {
          const response = await apiCall('/rewards/redeem', {
            method: 'POST',
            body: JSON.stringify({
              productId: product.id,
              productName: product.name,
              productDetails: {
                description: product.description,
                category: product.category,
                eco_score: product.eco_score,
                pricePoints: product.pricePoints
              }
            })
          });

          dispatch({ 
            type: 'UPDATE_PROFILE', 
            payload: { 
              sustainabilityScore: response.remainingPoints
            }
          });

          alert(`Success! 🎉\n\nYou've redeemed ${product.name}!\n\nCheck your email (${user.email}) for the confirmation form to complete your redemption.`);
        } catch (error) {
          alert(`Error: ${error.message}`);
        }
      }
    } else {
      alert(`You need ${product.pricePoints - user.sustainabilityScore} more points to redeem this item. Complete more challenges!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="w-8 h-8 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-800">Eco-Friendly Rewards Shop</h2>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 rounded-lg">
            <Coins className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              Your Points: {user.sustainabilityScore}
            </span>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">Earn points by completing challenges and redeem them for eco-friendly products!</p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100 hover:shadow-md transition-shadow">
            <div className="text-6xl mb-4 text-center">{product.image}</div>

            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                  {product.category}
                </span>
                <div className="flex items-center space-x-1">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-600">{product.eco_score}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-1">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <span className="text-2xl font-bold text-gray-800">{product.pricePoints}</span>
                </div>
                <button 
                  onClick={() => handlePurchase(product)}
                  disabled={user.sustainabilityScore < product.pricePoints}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    user.sustainabilityScore >= product.pricePoints
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Redeem
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Earn More Points Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Earn More Points!</h3>
            <p className="text-emerald-50">Complete sustainability challenges to earn points and get products for free</p>
          </div>
          <Zap className="w-16 h-16 text-white opacity-50" />
        </div>
      </div>
    </div>
  );
}
// Energy Solutions Component
function EnergySolutions({ user }) {
  const [activeCalculator, setActiveCalculator] = useState('solar');
  
  // Solar calculator states
  const [roofArea, setRoofArea] = useState(50);
  const [panelCount, setPanelCount] = useState(0);
  const [energyUsage, setEnergyUsage] = useState(500);
  const [sunHours, setSunHours] = useState(5);
  const [electricityRate, setElectricityRate] = useState(0.15);
  const [installationCost, setInstallationCost] = useState(10000);
  const [solarResults, setSolarResults] = useState(null);
  const [solarAIAdvice, setSolarAIAdvice] = useState(null);
  
  // Efficiency calculator states
  const [appliances, setAppliances] = useState([
    { type: 'LED Bulbs', currentUsage: 60, efficientUsage: 10, quantity: 10 },
    { type: 'Refrigerator', currentUsage: 150, efficientUsage: 100, quantity: 1 },
    { type: 'Air Conditioner', currentUsage: 300, efficientUsage: 200, quantity: 2 }
  ]);
  const [efficiencyRate, setEfficiencyRate] = useState(0.15);
  const [efficiencyResults, setEfficiencyResults] = useState(null);
  const [efficiencyAIAdvice, setEfficiencyAIAdvice] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');

  const calculateSolar = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/energy/solar-calculator', {
        method: 'POST',
        body: JSON.stringify({
          roofArea,
          panelCount,
          energyUsage,
          sunHours,
          electricityRate,
          installationCost
        })
      });
      
      setSolarResults(data.results);
      
      // Get AI advice automatically
      const aiData = await apiCall('/energy/ai-advice', {
        method: 'POST',
        body: JSON.stringify({
          calculatorType: 'solar',
          results: data.results
        })
      });
      setSolarAIAdvice(aiData.advice);
    } catch (err) {
      alert('Error calculating solar savings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateEfficiency = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/energy/efficiency-calculator', {
        method: 'POST',
        body: JSON.stringify({
          appliances,
          electricityRate: efficiencyRate
        })
      });
      
      setEfficiencyResults(data);
      
      // Get AI advice automatically
      const aiData = await apiCall('/energy/ai-advice', {
        method: 'POST',
        body: JSON.stringify({
          calculatorType: 'efficiency',
          results: data
        })
      });
      setEfficiencyAIAdvice(aiData.advice);
    } catch (err) {
      alert('Error calculating efficiency: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const askAI = async () => {
    if (!aiQuestion.trim()) return;
    
    setLoading(true);
    try {
      const results = activeCalculator === 'solar' ? solarResults : efficiencyResults;
      const data = await apiCall('/energy/ai-advice', {
        method: 'POST',
        body: JSON.stringify({
          calculatorType: activeCalculator,
          results,
          userQuestion: aiQuestion
        })
      });
      
      if (activeCalculator === 'solar') {
        setSolarAIAdvice(data.advice);
      } else {
        setEfficiencyAIAdvice(data.advice);
      }
      setAiQuestion('');
    } catch (err) {
      alert('Error getting AI advice: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAppliance = (index, field, value) => {
    const newAppliances = [...appliances];
    newAppliances[index][field] = value;
    setAppliances(newAppliances);
  };

  const addAppliance = () => {
    setAppliances([...appliances, { type: 'New Appliance', currentUsage: 100, efficientUsage: 50, quantity: 1 }]);
  };

  const removeAppliance = (index) => {
    setAppliances(appliances.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="w-8 h-8 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-800">Energy Solutions</h2>
        </div>
        <p className="text-gray-600">Calculate your renewable energy potential and efficiency savings with AI-powered recommendations.</p>
      </div>

      {/* Calculator Selector */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveCalculator('solar')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeCalculator === 'solar'
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ☀️ Solar Panel Calculator
          </button>
          <button
            onClick={() => setActiveCalculator('efficiency')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeCalculator === 'efficiency'
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💡 Energy Efficiency Calculator
          </button>
        </div>
      </div>

      {/* Solar Calculator */}
      {activeCalculator === 'solar' && (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-emerald-100">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">Solar Panel Savings Calculator</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roof Area (m²) or Number of Panels
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    value={roofArea}
                    onChange={(e) => setRoofArea(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Roof area (m²)"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={panelCount}
                    onChange={(e) => setPanelCount(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="# of panels"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Energy Usage (kWh)
              </label>
              <input
                type="number"
                value={energyUsage}
                onChange={(e) => setEnergyUsage(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-gray-700 font-medium">Average Sunlight Hours/Day</label>
                <span className="text-emerald-600 font-semibold">{sunHours}h</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="0.5"
                value={sunHours}
                onChange={(e) => setSunHours(Number(e.target.value))}
                className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Electricity Rate ($/kWh)
              </label>
              <input
                type="number"
                step="0.01"
                value={electricityRate}
                onChange={(e) => setElectricityRate(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Installation Cost ($) - Optional
              </label>
              <input
                type="number"
                value={installationCost}
                onChange={(e) => setInstallationCost(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            onClick={calculateSolar}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-lg font-semibold hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Calculating...' : '☀️ Calculate Solar Savings'}
          </button>

          {/* Solar Results */}
          {solarResults && (
            <div className="mt-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
                  <p className="text-sm text-gray-600 mb-1">Monthly Energy Generated</p>
                  <p className="text-3xl font-bold text-emerald-600">{solarResults.energyGeneration.monthly}</p>
                  <p className="text-sm text-gray-600">kWh/month</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Yearly Savings</p>
                  <p className="text-3xl font-bold text-blue-600">${solarResults.savings.yearly}</p>
                  <p className="text-sm text-gray-600">per year</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-1">CO₂ Reduction</p>
                  <p className="text-3xl font-bold text-green-600">{solarResults.co2Reduction}</p>
                  <p className="text-sm text-gray-600">kg/year</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-gray-600">Energy Coverage</p>
                  <p className="text-2xl font-bold text-amber-600">{solarResults.coveragePercent}%</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600">Panels Needed</p>
                  <p className="text-2xl font-bold text-purple-600">{solarResults.panelsNeeded}</p>
                </div>
                {solarResults.paybackTime && (
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-sm text-gray-600">Payback Time</p>
                    <p className="text-2xl font-bold text-indigo-600">{solarResults.paybackTime} years</p>
                  </div>
                )}
              </div>

              {/* AI Advice Section */}
              {solarAIAdvice && (
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <Bot className="w-6 h-6 text-purple-600" />
                    <h4 className="text-lg font-semibold text-gray-800">AI Recommendations</h4>
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap">{solarAIAdvice}</div>
                </div>
              )}

              {/* Ask AI */}
              <div className="p-6 bg-white rounded-xl border-2 border-emerald-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Ask AI for More Advice</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="e.g., How many panels do I need for 100% coverage?"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={askAI}
                    disabled={loading}
                    className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Efficiency Calculator */}
      {activeCalculator === 'efficiency' && (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-emerald-100">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">Energy Efficiency Calculator</h3>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Electricity Rate ($/kWh)
            </label>
            <input
              type="number"
              step="0.01"
              value={efficiencyRate}
              onChange={(e) => setEfficiencyRate(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800">Appliances & Upgrades</h4>
              <button
                onClick={addAppliance}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 text-sm"
              >
                + Add Appliance
              </button>
            </div>

            {appliances.map((appliance, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={appliance.type}
                  onChange={(e) => updateAppliance(index, 'type', e.target.value)}
                  placeholder="Appliance type"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={appliance.currentUsage}
                  onChange={(e) => updateAppliance(index, 'currentUsage', Number(e.target.value))}
                  placeholder="Current kWh/month"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={appliance.efficientUsage}
                  onChange={(e) => updateAppliance(index, 'efficientUsage', Number(e.target.value))}
                  placeholder="Efficient kWh/month"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={appliance.quantity}
                  onChange={(e) => updateAppliance(index, 'quantity', Number(e.target.value))}
                  placeholder="Quantity"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={() => removeAppliance(index)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={calculateEfficiency}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-lg font-semibold hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Calculating...' : '💡 Calculate Efficiency Savings'}
          </button>

          {/* Efficiency Results */}
          {efficiencyResults && (
            <div className="mt-8 space-y-6">
              {/* 3 Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
                  <p className="text-sm text-gray-600 mb-1">Monthly Energy Saved</p>
                  <p className="text-3xl font-bold text-emerald-600">{efficiencyResults.totalEnergySaved}</p>
                  <p className="text-sm text-gray-600">kWh/month</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Monthly Cost Savings</p>
                  <p className="text-3xl font-bold text-blue-600">${efficiencyResults.totalCostSaved}</p>
                  <p className="text-sm text-gray-600">per month</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-1">CO₂ Reduction</p>
                  <p className="text-3xl font-bold text-green-600">{efficiencyResults.totalCO2Saved}</p>
                  <p className="text-sm text-gray-600">kg/month</p>
                </div>
              </div>

              {/* Breakdown by Appliance */}
              <div className="p-6 bg-gray-50 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Savings Breakdown by Appliance</h4>
                <div className="space-y-3">
                  {efficiencyResults.breakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                      <span className="font-medium text-gray-800">{item.type}</span>
                      <div className="flex items-center space-x-6 text-sm">
                        <div>
                          <span className="text-gray-600">Energy: </span>
                          <span className="font-semibold text-emerald-600">{item.energySaved} kWh/mo</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Cost: </span>
                          <span className="font-semibold text-blue-600">${item.costSaved}/mo</span>
                        </div>
                        <div>
                          <span className="text-gray-600">CO₂: </span>
                          <span className="font-semibold text-green-600">{item.co2Saved} kg/mo</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Advice Section */}
              {efficiencyAIAdvice && (
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <Bot className="w-6 h-6 text-purple-600" />
                    <h4 className="text-lg font-semibold text-gray-800">AI Recommendations</h4>
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap">{efficiencyAIAdvice}</div>
                </div>
              )}

              {/* Ask AI */}
              <div className="p-6 bg-white rounded-xl border-2 border-emerald-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Ask AI for More Advice</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="e.g., Which appliances should I upgrade first?"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={askAI}
                    disabled={loading}
                    className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Cards - OUTSIDE CALCULATOR CONDITIONALS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Solar Panel Benefits Card */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-sm p-6 border-2 border-yellow-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            ☀️ Solar Panel Benefits
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">✓</span>
              <span>Reduce electricity bills by 50-100%</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">✓</span>
              <span>Increase property value by 3-4%</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">✓</span>
              <span>25-30 year lifespan with warranties</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">✓</span>
              <span>Government tax credits & incentives available</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">✓</span>
              <span>Significant CO₂ reduction (avg. 1.5 tons/year per kW)</span>
            </li>
          </ul>
        </div>

        {/* Energy Efficiency Tips Card */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-sm p-6 border-2 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            💡 Energy Efficiency Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">✓</span>
              <span>LED bulbs use 75% less energy than incandescent</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">✓</span>
              <span>Smart thermostats save 10-23% on heating/cooling</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">✓</span>
              <span>Energy Star appliances use 10-50% less energy</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">✓</span>
              <span>Proper insulation reduces energy use by 15%</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">✓</span>
              <span>Unplugging devices saves $100-200/year</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}