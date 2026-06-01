import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, Calendar, Clock, Users, Plus, LogIn, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Meetings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadMeetings();
  }, []);

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
    setMeetings(allMeetings.sort((a, b) => new Date(b.datetime) - new Date(a.datetime)));
  };

  const handleJoinMeeting = (meetingId) => {
    navigate(`/meeting/${meetingId}?name=${encodeURIComponent(user?.name || 'Guest')}`);
  };

  const handleDeleteMeeting = (meetingId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      localStorage.removeItem(`scheduled_meeting_${meetingId}`);
      toast.success('Meeting deleted successfully');
      loadMeetings();
    }
  };

  const getStatus = (datetime) => {
    const meetingDate = new Date(datetime);
    const now = new Date();
    if (meetingDate > now) return 'upcoming';
    if (meetingDate < now) return 'completed';
    return 'ongoing';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'upcoming': return 'text-yellow-500 bg-yellow-500/20';
      case 'completed': return 'text-green-500 bg-green-500/20';
      case 'ongoing': return 'text-blue-500 bg-blue-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

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
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-6">
                <Link to="/" className="text-gray-300 hover:text-white transition">Dashboard</Link>
                <Link to="/meetings" className="text-white font-medium">Meetings</Link>
                <Link to="/tasks" className="text-gray-300 hover:text-white transition">Tasks</Link>
                <Link to="/analytics" className="text-gray-300 hover:text-white transition">Analytics</Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Meetings</h1>
          <p className="text-gray-400">Manage and join your meetings</p>
        </div>

        {/* Action Cards - FIXED WITH VIBRANT BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Start a Meeting Card */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group">
            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Video className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Start a Meeting</h3>
            <p className="text-gray-400 mb-6">Create a new instant meeting</p>
            <button
              onClick={() => navigate('/create')}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-medium hover:opacity-90 transition flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25"
            >
              <Video className="w-4 h-4" />
              <span>Start Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Schedule Meeting Card */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-300 group">
            <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Schedule</h3>
            <p className="text-gray-400 mb-6">Plan meetings for later</p>
            <button
              onClick={() => {
                const scheduleBtn = document.querySelector('.schedule-modal-trigger');
                if (scheduleBtn) scheduleBtn.click();
                else {
                  // Fallback: show toast or navigate
                  toast.info('Click "Schedule Meeting" on dashboard');
                }
              }}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-medium hover:opacity-90 transition flex items-center justify-center space-x-2 shadow-lg shadow-green-500/25"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Join Meeting Card */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group">
            <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <LogIn className="w-7 h-7 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Join</h3>
            <p className="text-gray-400 mb-6">Enter a meeting ID to join</p>
            <button
              onClick={() => navigate('/join/example')}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium hover:opacity-90 transition flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/25"
            >
              <LogIn className="w-4 h-4" />
              <span>Join Meeting</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scheduled Meetings List */}
        {meetings.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Your Scheduled Meetings</h2>
            <div className="space-y-4">
              {meetings.map((meeting) => {
                const status = getStatus(meeting.datetime);
                return (
                  <div key={meeting.id} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Video className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{meeting.title}</h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <div className="flex items-center text-sm text-gray-400">
                              <Calendar className="w-4 h-4 mr-1" />
                              {meeting.date ? new Date(meeting.date).toLocaleDateString() : 'Date TBD'}
                            </div>
                            <div className="flex items-center text-sm text-gray-400">
                              <Clock className="w-4 h-4 mr-1" />
                              {meeting.time || 'Time TBD'}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                              {status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleJoinMeeting(meeting.meetingId)}
                          className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-medium hover:opacity-90 transition flex items-center space-x-2 shadow-md"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join</span>
                        </button>
                        <button
                          onClick={() => handleDeleteMeeting(meeting.meetingId, meeting.title)}
                          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition flex items-center space-x-2"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {meetings.length === 0 && (
          <div className="text-center py-12 bg-gray-800/30 rounded-2xl">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No scheduled meetings yet</p>
            <button
              onClick={() => navigate('/create')}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-medium hover:opacity-90 transition inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Meeting</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Meetings;