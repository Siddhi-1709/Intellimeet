import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Video, Users, CheckSquare, TrendingUp, Clock, Plus, LogOut, User, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    duration: '60'
  });
  const [stats, setStats] = useState({
    totalMeetings: 0,
    upcomingMeetings: 0,
    completedMeetings: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
    
    loadMeetings();
  }, [navigate]);

  const loadMeetings = () => {
    const allMeetings = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('scheduled_meeting_')) {
        try {
          const meeting = JSON.parse(localStorage.getItem(key));
          allMeetings.push(meeting);
        } catch (error) {
          console.error('Error parsing meeting:', error);
        }
      }
    }
    
    const sortedMeetings = allMeetings.sort((a, b) => {
      const dateA = a.datetime ? new Date(a.datetime) : new Date(0);
      const dateB = b.datetime ? new Date(b.datetime) : new Date(0);
      return dateB - dateA;
    });
    
    const now = new Date();
    const upcoming = sortedMeetings.filter(m => {
      const meetingDate = m.datetime ? new Date(m.datetime) : new Date(0);
      return meetingDate > now;
    });
    
    setUpcomingMeetings(upcoming);
    setRecentMeetings(sortedMeetings.slice(0, 5));
    
    setStats({
      totalMeetings: allMeetings.length,
      upcomingMeetings: upcoming.length,
      completedMeetings: allMeetings.filter(m => {
        const meetingDate = m.datetime ? new Date(m.datetime) : new Date(0);
        return meetingDate < now;
      }).length,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0
    });
  };

  const generateMeetingId = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleStartNewMeeting = () => {
    navigate('/create');
  };

  const handleScheduleMeeting = (e) => {
    e.preventDefault();
    if (!newMeeting.title.trim()) {
      toast.error('Please enter meeting title');
      return;
    }
    
    const meetingId = generateMeetingId();
    const datetime = newMeeting.date && newMeeting.time 
      ? `${newMeeting.date}T${newMeeting.time}`
      : new Date().toISOString();
    
    const meetingData = {
      id: Date.now(),
      meetingId: meetingId,
      title: newMeeting.title.trim(),
      datetime: datetime,
      date: newMeeting.date,
      time: newMeeting.time,
      duration: newMeeting.duration,
      participants: 1,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      host: user?.name || 'Host'
    };
    
    localStorage.setItem(`scheduled_meeting_${meetingId}`, JSON.stringify(meetingData));
    toast.success(`Meeting "${newMeeting.title}" scheduled successfully!`);
    setShowCreateMeetingModal(false);
    setNewMeeting({ title: '', date: '', time: '', duration: '60' });
    loadMeetings();
  };

  const handleJoinMeeting = (meetingId) => {
    const meetingKey = `scheduled_meeting_${meetingId}`;
    const meetingData = localStorage.getItem(meetingKey);
    
    if (meetingData) {
      try {
        const meeting = JSON.parse(meetingData);
        navigate(`/meeting/${meetingId}?name=${encodeURIComponent(user?.name || 'Guest')}&host=${meeting.host === user?.name}`);
      } catch (error) {
        console.error('Error joining meeting:', error);
        navigate(`/meeting/${meetingId}?name=${encodeURIComponent(user?.name || 'Guest')}`);
      }
    } else {
      navigate(`/meeting/${meetingId}?name=${encodeURIComponent(user?.name || 'Guest')}`);
    }
  };

  const handleDeleteMeeting = (meetingId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      localStorage.removeItem(`scheduled_meeting_${meetingId}`);
      toast.success('Meeting deleted successfully');
      loadMeetings();
    }
  };

  const handleLogout = async () => {
    try {
      // Clear all local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userName');
      
      // Clear any meeting-related data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('scheduled_meeting_') || key.startsWith('meeting_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileDropdown]);

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && <p className="text-green-500 text-sm mt-2">{trend}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                IntelliMeet
              </h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-white font-medium">Dashboard</Link>
              <Link to="/meetings" className="text-gray-300 hover:text-white transition">Meetings</Link>
              <Link to="/tasks" className="text-gray-300 hover:text-white transition">Tasks</Link>
              <Link to="/analytics" className="text-gray-300 hover:text-white transition">Analytics</Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleStartNewMeeting}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-medium hover:opacity-90 transition flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Meeting</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-gray-400">Welcome back,</p>
                  <p className="font-semibold text-white">{user?.name || 'Guest'}</p>
                </div>
                
                {/* Profile Dropdown */}
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer hover:opacity-90 transition"
                  >
                    <span className="text-white font-bold text-lg">{user?.name?.charAt(0) || 'G'}</span>
                  </button>
                  
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
                      <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{user?.name?.charAt(0) || 'G'}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{user?.name}</p>
                            <p className="text-xs text-gray-400">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/20 rounded-lg transition flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Guest'}</span>
          </h2>
          <p className="text-gray-400">Here's what's happening with your meetings today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Meetings" 
            value={stats.totalMeetings} 
            icon={Video} 
            color="from-blue-500 to-cyan-500"
          />
          <StatCard 
            title="Upcoming Meetings" 
            value={stats.upcomingMeetings} 
            icon={Calendar} 
            color="from-purple-500 to-pink-500"
          />
          <StatCard 
            title="Completed Meetings" 
            value={stats.completedMeetings} 
            icon={CheckSquare} 
            color="from-green-500 to-emerald-500"
          />
          <StatCard 
            title="Total Hours Saved" 
            value="24" 
            icon={TrendingUp} 
            color="from-orange-500 to-red-500"
            trend="+40% productivity"
          />
        </div>

        {/* Quick Actions and Recent Meetings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Meetings */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                Recent Meetings
              </h3>
              {recentMeetings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No meetings yet</p>
                  <button 
                    onClick={() => setShowCreateMeetingModal(true)}
                    className="mt-3 text-blue-500 hover:text-blue-400 text-sm"
                  >
                    Schedule your first meeting →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-900/50 hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Video className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{meeting.title}</p>
                          <p className="text-sm text-gray-400">
                            {meeting.date ? new Date(meeting.date).toLocaleDateString() : 'Date TBD'} at {meeting.time || 'Time TBD'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleJoinMeeting(meeting.meetingId)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-sm font-medium hover:opacity-90 transition"
                        >
                          Join
                        </button>
                        <button 
                          onClick={() => handleDeleteMeeting(meeting.meetingId, meeting.title)}
                          className="px-3 py-2 bg-red-500/20 text-red-500 rounded-lg text-sm hover:bg-red-500/30 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleStartNewMeeting}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:opacity-90 transition flex items-center justify-between group"
                >
                  <span>Start New Meeting</span>
                  <Video className="w-4 h-4 group-hover:scale-110 transition" />
                </button>
                
                <button
                  onClick={() => setShowCreateMeetingModal(true)}
                  className="w-full p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition text-white font-medium flex items-center justify-between group"
                >
                  <span>Schedule Meeting</span>
                  <Calendar className="w-4 h-4 group-hover:scale-110 transition" />
                </button>
                
                <button
                  onClick={() => navigate('/tasks')}
                  className="w-full p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition text-white font-medium flex items-center justify-between group"
                >
                  <span>View Tasks</span>
                  <CheckSquare className="w-4 h-4 group-hover:scale-110 transition" />
                </button>
                
                <button
                  onClick={() => navigate('/analytics')}
                  className="w-full p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition text-white font-medium flex items-center justify-between group"
                >
                  <span>Analytics Dashboard</span>
                  <TrendingUp className="w-4 h-4 group-hover:scale-110 transition" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-500" />
            Upcoming Schedule
          </h3>
          {upcomingMeetings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No scheduled meetings</p>
              <p className="text-gray-500 text-sm mt-2">Click "Schedule Meeting" to create one</p>
              <button 
                onClick={() => setShowCreateMeetingModal(true)}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-medium hover:opacity-90 transition"
              >
                Schedule Your First Meeting
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <div>
                    <p className="font-medium text-white">{meeting.title}</p>
                    <p className="text-sm text-gray-400">
                      {meeting.date ? new Date(meeting.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'Date TBD'} at {meeting.time || 'Time TBD'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Duration: {meeting.duration} minutes</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleJoinMeeting(meeting.meetingId)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-sm font-medium hover:opacity-90 transition"
                    >
                      Join
                    </button>
                    <button 
                      onClick={() => handleDeleteMeeting(meeting.meetingId, meeting.title)}
                      className="px-3 py-2 bg-red-500/20 text-red-500 rounded-lg text-sm hover:bg-red-500/30 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Schedule Meeting Modal */}
      {showCreateMeetingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreateMeetingModal(false)}>
          <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-4">Schedule New Meeting</h3>
            <form onSubmit={handleScheduleMeeting} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Meeting Title *</label>
                <input 
                  type="text" 
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white" 
                  placeholder="Enter meeting title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Date</label>
                <input 
                  type="date" 
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Time</label>
                <input 
                  type="time" 
                  value={newMeeting.time}
                  onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Duration (minutes)</label>
                <select 
                  value={newMeeting.duration}
                  onChange={(e) => setNewMeeting({...newMeeting, duration: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateMeetingModal(false)} className="flex-1 py-2 bg-gray-700 rounded-lg font-medium hover:bg-gray-600 transition">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-medium hover:opacity-90 transition">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;