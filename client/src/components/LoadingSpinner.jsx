// src/components/LoadingSpinner.jsx

import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', size = 'large' }) => {
    const iconClass = size === 'large' ? 'h-10 w-10' : 'h-5 w-5';
    const textClass = size === 'large' ? 'mt-4 text-gray-600' : 'text-sm text-gray-600';

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
            <Loader2 className={`${iconClass} text-indigo-600 animate-spin`} />
            <p className={textClass}>{message}</p>
        </div>
    );
};

export default LoadingSpinner;