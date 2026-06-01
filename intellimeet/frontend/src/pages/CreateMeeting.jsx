import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Copy, Check, Users, Sparkles, ArrowRight, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateMeeting = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateMeetingId = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const createInstantMeeting = async () => {
    setIsCreating(true);
    const meetingId = generateMeetingId();
    const hostName = localStorage.getItem('userName') || 'Host';
    
    localStorage.setItem('userName', hostName);
    
    setTimeout(() => {
      setCreatedMeeting({
        id: meetingId,
        link: `${window.location.origin}/join/${meetingId}`,
        hostName: hostName
      });
      setIsCreating(false);
      toast.success('Meeting created successfully!');
    }, 500);
  };

  const startMeeting = () => {
    navigate(`/meeting/${createdMeeting.id}?host=true&name=${encodeURIComponent(createdMeeting.hostName)}`);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(createdMeeting.link);
    setCopied(true);
    toast.success('Meeting link copied! Share with others to join');
    setTimeout(() => setCopied(false), 2000);
  };

  if (createdMeeting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Meeting Created!</h2>
              <p className="text-gray-400">Your meeting is ready. Share the link to invite others.</p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-900 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-2">Meeting ID</p>
                <p className="text-xl font-mono text-white">{createdMeeting.id}</p>
              </div>

              <div className="bg-gray-900 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-2">Invite Link</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={createdMeeting.link}
                    readOnly
                    className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700"
                  />
                  <button
                    onClick={copyLink}
                    className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-300" />}
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setCreatedMeeting(null)}
                  className="flex-1 py-3 bg-gray-700 rounded-xl font-medium hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={startMeeting}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-medium hover:opacity-90 transition flex items-center justify-center space-x-2"
                >
                  <span>Start Meeting</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Share link</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Anyone can join</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              IntelliMeet
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-white mb-4">
              Premium Video Meetings
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"> Now Free</span>
            </h2>
            <p className="text-gray-400 text-lg">Host secure, high-quality video meetings. Share a link and anyone can join.</p>
          </div>

          {/* Two Column Layout with Enhanced Buttons */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Instant Meeting Card - Left */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">Instant Meeting</h3>
              <p className="text-gray-400 mb-6">Create a meeting and invite others instantly</p>
              <button
                onClick={createInstantMeeting}
                disabled={isCreating}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25"
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Start Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Join Meeting Card - Right (FIXED - Now matches left button style) */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <LogIn className="w-7 h-7 text-purple-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">Join a Meeting</h3>
              <p className="text-gray-400 mb-6">Already have an invite link? Join here</p>
              <button
                onClick={() => navigate('/join/example')}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium hover:opacity-90 transition flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/25"
              >
                <span>Join Meeting</span>
                <LogIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-white font-medium">Unlimited Participants</p>
              <p className="text-gray-500 text-sm">No limits on attendees</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-white font-medium">HD Video & Audio</p>
              <p className="text-gray-500 text-sm">Crystal clear quality</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-white font-medium">No Login Required</p>
              <p className="text-gray-500 text-sm">Join with just a name</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateMeeting;