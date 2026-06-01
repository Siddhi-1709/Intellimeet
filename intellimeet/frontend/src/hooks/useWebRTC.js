import { useRef, useCallback, useState, useEffect } from 'react';
import socketService from '../services/socket';

const useWebRTC = (meetingId, userId, userName) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const peerConnections = useRef(new Map());
  const localVideoRef = useRef(null);
  const screenStreamRef = useRef(null);

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ]
  };

  const createPeerConnection = useCallback((remoteUserId) => {
    const pc = new RTCPeerConnection(configuration);
    
    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.sendIceCandidate(meetingId, event.candidate, remoteUserId);
      }
    };

    // Handle remote tracks
    pc.ontrack = (event) => {
      setRemoteStreams(prev => {
        const newStreams = new Map(prev);
        const stream = newStreams.get(remoteUserId) || new MediaStream();
        event.streams[0].getTracks().forEach(track => {
          stream.addTrack(track);
        });
        newStreams.set(remoteUserId, stream);
        return newStreams;
      });
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setRemoteStreams(prev => {
          const newStreams = new Map(prev);
          newStreams.delete(remoteUserId);
          return newStreams;
        });
        peerConnections.current.delete(remoteUserId);
      }
    };

    peerConnections.current.set(remoteUserId, pc);
    return pc;
  }, [localStream, meetingId]);

  const initLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);
      
      // Replace video track in all peer connections
      const videoTrack = screenStream.getVideoTracks()[0];
      peerConnections.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });
      
      // Update local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }
      
      // Notify others
      socketService.startScreenShare(meetingId, userId, 'screen-share');
      
      // Handle screen share stop
      videoTrack.onended = () => {
        stopScreenShare();
      };
      
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const stopScreenShare = async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    
    setIsScreenSharing(false);
    
    // Switch back to camera
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      peerConnections.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    }
    
    socketService.stopScreenShare(meetingId, userId);
  };

  const handleOffer = useCallback(async (data) => {
    const pc = createPeerConnection(data.fromUserId);
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socketService.sendAnswer(meetingId, answer);
  }, [createPeerConnection, meetingId]);

  const handleAnswer = useCallback(async (data) => {
    const pc = peerConnections.current.get(data.fromUserId);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  }, []);

  const handleIceCandidate = useCallback(async (data) => {
    const pc = peerConnections.current.get(data.fromUserId);
    if (pc && data.candidate) {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  }, []);

  const callUser = useCallback(async (remoteUserId) => {
    const pc = createPeerConnection(remoteUserId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketService.sendOffer(meetingId, offer, userId);
  }, [createPeerConnection, meetingId, userId]);

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled;
      }
    }
    return false;
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return !videoTrack.enabled;
      }
    }
    return false;
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
  };

  useEffect(() => {
    // Socket event listeners
    socketService.on('offer', handleOffer);
    socketService.on('answer', handleAnswer);
    socketService.on('ice-candidate', handleIceCandidate);

    return () => {
      socketService.off('offer', handleOffer);
      socketService.off('answer', handleAnswer);
      socketService.off('ice-candidate', handleIceCandidate);
      cleanup();
    };
  }, [handleOffer, handleAnswer, handleIceCandidate]);

  return {
    localStream,
    remoteStreams,
    localVideoRef,
    isScreenSharing,
    initLocalStream,
    startScreenShare,
    stopScreenShare,
    callUser,
    toggleMute,
    toggleVideo,
    cleanup
  };
};

export default useWebRTC;