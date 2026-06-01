import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Video, Link, User, ArrowRight, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const JoinMeeting = () => {
  const { meetingId: urlMeetingId } = useParams();
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState(urlMeetingId || '');
  const [displayName, setDisplayName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = () => {
    if (!meetingId.trim()) {
      toast.error('Please enter a meeting ID');
      return;
    }
    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsJoining(true);
    
    // Save participant name
    localStorage.setItem('participantName', displayName);
    
    setTimeout(() => {
      navigate(`/meeting/${meetingId}?name=${encodeURIComponent(displayName)}`);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Join a Meeting
          </h1>
          <p className="text-gray-400 mt-2">No account needed - just enter your name</p>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meeting ID or Link
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                  placeholder="Enter meeting ID"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
            </div>

            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{isJoining ? 'Joining...' : 'Join Meeting'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-gray-800 rounded-xl font-medium hover:bg-gray-700 transition"
            >
              Create New Meeting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinMeeting;