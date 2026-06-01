import React from 'react';
import { useNavigate } from 'react-router-dom';

const CheckAuth = () => {
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Status</h1>
      
      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <p><strong>Token:</strong> {token ? token.substring(0, 50) + '...' : 'Not found'}</p>
        <p><strong>User:</strong> {user || 'Not found'}</p>
        <p><strong>Logged in:</strong> {token && user ? 'Yes' : 'No'}</p>
      </div>
      
      <div className="space-x-2">
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-500 rounded"
        >
          Go to Dashboard
        </button>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="px-4 py-2 bg-red-500 rounded"
        >
          Clear & Logout
        </button>
      </div>
    </div>
  );
};

export default CheckAuth;