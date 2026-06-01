import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TestAuth = () => {
  const [status, setStatus] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    setStatus({
      hasToken: !!token,
      tokenValue: token ? token.substring(0, 30) + '...' : 'null',
      hasUser: !!user,
      userValue: user,
      currentPath: window.location.pathname
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Status</h1>
      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <pre className="text-sm">{JSON.stringify(status, null, 2)}</pre>
      </div>
      <button 
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-blue-500 rounded mr-2"
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
  );
};

export default TestAuth;