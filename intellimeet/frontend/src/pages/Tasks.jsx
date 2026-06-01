import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Plus } from 'lucide-react';

const Tasks = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Tasks</h1>
            <p className="text-gray-400">Manage your action items</p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-8 text-center">
          <CheckSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No tasks yet</p>
          <p className="text-gray-500 text-sm">Tasks will appear here when created from meetings</p>
        </div>
      </div>
    </div>
  );
};

export default Tasks;