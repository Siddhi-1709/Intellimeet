import React from 'react';

const Select = ({ label, options, error, className = '', ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-300">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-2 bg-white/5 border ${
          error ? 'border-red-500' : 'border-white/10'
        } rounded-lg focus:outline-none focus:border-blue-500 transition-colors ${className}`}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Select;