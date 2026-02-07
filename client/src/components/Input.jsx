import React from 'react';

const Input = ({ label, name, type = 'text', value, onChange, placeholder }) => (
  <div className="group w-full">
    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1 transition-colors group-focus-within:text-indigo-600">
      {label}
    </label>
    <div className="relative">
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
      />
    </div>
  </div>
);

export default Input;