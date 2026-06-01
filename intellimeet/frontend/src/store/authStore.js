import { create } from 'zustand'; 
import { persist } from 'zustand/middleware'; 
 
const useAuthStore = create( 
  persist( 
    (set) => ({ 
      user: null, 
      token: null, 
      isLoading: false, 
      login: async (email, password) => { 
        set({ isLoading: true }); 
        try { 
          const response = await api.post('/auth/login', { email, password }); 
          const { token, ...user } = response.data; 
          set({ user, token, isLoading: false }); 
          return response.data; 
        } catch (error) { 
          set({ isLoading: false }); 
          throw error; 
        } 
      }, 
      logout: () => set({ user: null, token: null }) 
    }), 
    { name: 'auth-storage' } 
  ) 
); 
 
export { useAuthStore }; 
