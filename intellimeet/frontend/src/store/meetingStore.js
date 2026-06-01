import { create } from 'zustand';

const useMeetingStore = create((set, get) => ({
  currentMeeting: null,
  meetings: [],
  isRecording: false,
  isScreenSharing: false,
  activeSpeakers: [],
  
  setCurrentMeeting: (meeting) => set({ currentMeeting: meeting }),
  
  setMeetings: (meetings) => set({ meetings }),
  
  addMeeting: (meeting) => set((state) => ({ 
    meetings: [meeting, ...state.meetings] 
  })),
  
  updateMeeting: (meetingId, updates) => set((state) => ({
    meetings: state.meetings.map(m => 
      m.meetingId === meetingId ? { ...m, ...updates } : m
    ),
    currentMeeting: state.currentMeeting?.meetingId === meetingId 
      ? { ...state.currentMeeting, ...updates }
      : state.currentMeeting
  })),
  
  setIsRecording: (recording) => set({ isRecording: recording }),
  
  setIsScreenSharing: (sharing) => set({ isScreenSharing: sharing }),
  
  addActiveSpeaker: (userId) => set((state) => ({
    activeSpeakers: [...state.activeSpeakers, userId]
  })),
  
  removeActiveSpeaker: (userId) => set((state) => ({
    activeSpeakers: state.activeSpeakers.filter(id => id !== userId)
  })),
  
  clearMeeting: () => set({
    currentMeeting: null,
    isRecording: false,
    isScreenSharing: false,
    activeSpeakers: []
  })
}));

export { useMeetingStore };