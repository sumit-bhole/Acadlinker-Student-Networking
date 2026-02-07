// src/components/InputField.jsx

import React from 'react';

const InputField = ({ label, name, type = 'text', value, onChange, required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label}
        </label>
        <input
            id={name}
            name={name}
            type={type}
            required={required}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
    </div>
);

export default InputField;