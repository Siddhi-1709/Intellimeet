import React from 'react';
import { TrendingUp, Users, Clock, Video } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-4">Analytics</h1>
        <p className="text-gray-400">View meeting insights and productivity metrics</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-800/50 rounded-xl p-6 text-center">
            <TrendingUp className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white">0</h3>
            <p className="text-gray-400">Total Meetings</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 text-center">
            <Clock className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white">0</h3>
            <p className="text-gray-400">Hours Saved</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 text-center">
            <Users className="w-12 h-12 text-purple-500 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white">0</h3>
            <p className="text-gray-400">Participants</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;