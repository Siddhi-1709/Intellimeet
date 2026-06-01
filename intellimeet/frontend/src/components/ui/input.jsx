import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  error, 
  icon: Icon,
  className = '',
  ...props 
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          type={type}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2 bg-white/5 border ${
            error ? 'border-red-500' : 'border-white/10'
          } rounded-lg focus:outline-none focus:border-blue-500 transition-colors ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;