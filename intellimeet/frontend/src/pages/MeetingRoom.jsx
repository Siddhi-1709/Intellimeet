import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Video, Mic, MicOff, VideoOff, Phone, Users, Copy, Check } from 'lucide-react';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Get user info from URL
  const queryParams = new URLSearchParams(location.search);
  const userName = queryParams.get('name') || localStorage.getItem('participantName') || 'Guest';
  const isHost = queryParams.get('host') === 'true';

  useEffect(() => {
    initializeCamera();
    connectSocket();
    
    return () => {
      if (socket) {
        socket.emit('leave-meeting');
        socket.disconnect();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      toast.success('Camera and microphone connected');
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const connectSocket = () => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      
      if (isHost) {
        // Host creates meeting
        newSocket.emit('create-meeting', { meetingId, hostName: userName });
        toast.success('Meeting created! Share the link to invite others');
      } else {
        // Participant joins meeting
        newSocket.emit('join-meeting', { meetingId, userName });
      }
      
      setIsConnecting(false);
    });

    newSocket.on('meeting-created', (data) => {
      console.log('Meeting created:', data);
    });

    newSocket.on('join-error', (data) => {
      toast.error(data.message);
      setTimeout(() => navigate('/'), 2000);
    });

    newSocket.on('current-participants', (data) => {
      console.log('Current participants:', data);
      setParticipants(data.participants);
      toast.success(`You joined the meeting. Host: ${data.hostName}`);
    });

    newSocket.on('user-joined', (data) => {
      setParticipants(prev => [...prev, { id: data.id, name: data.name }]);
      toast.success(`${data.name} joined the meeting`);
    });

    newSocket.on('user-left', (data) => {
      setParticipants(prev => prev.filter(p => p.id !== data.id));
      toast.info(`${data.name} left the meeting`);
    });

    newSocket.on('meeting-ended', () => {
      toast.error('Host has ended the meeting');
      setTimeout(() => navigate('/'), 2000);
    });
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const copyMeetingLink = () => {
    const link = `${window.location.origin}/join/${meetingId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Meeting link copied! Share with others');
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveMeeting = () => {
    if (socket) {
      socket.emit('leave-meeting');
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate('/');
    toast.success('Left meeting');
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Connecting to meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
      <div className="bg-gray-900/90 border-b border-gray-800 px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Meeting Room</h2>
              <p className="text-xs text-gray-400">ID: {meetingId}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={copyMeetingLink}
              className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
              <span className="text-sm text-gray-300">Copy Link</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">{participants.length + 1} in meeting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Local Video */}
          <div className="relative bg-gray-800 rounded-2xl overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-white">{userName?.charAt(0) || 'Y'}</span>
                  </div>
                  <p className="text-white text-sm">{userName}</p>
                  {isHost && <p className="text-xs text-yellow-500">Host</p>}
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg text-sm text-white">
              {userName} {isMuted && '(Muted)'} {isHost && '👑'}
            </div>
          </div>

          {/* Remote Participants */}
          {participants.map((participant) => (
            <div key={participant.id} className="relative bg-gray-800 rounded-2xl overflow-hidden aspect-video">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/30 to-purple-900/30">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-white">{participant.name?.charAt(0) || '?'}</span>
                  </div>
                  <p className="text-white text-sm">{participant.name}</p>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg text-sm text-white">
                {participant.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 border-t border-gray-800 p-4">
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
          </button>
          
          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
              isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
          </button>
          
          <button
            onClick={leaveMeeting}
            className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition"
          >
            <Phone className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;