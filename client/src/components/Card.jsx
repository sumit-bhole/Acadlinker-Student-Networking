// src/components/Card.jsx

import React from 'react';

const Card = ({ title, children, footer }) => (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">{title}</h2>
        <div className="space-y-4">
            {children}
        </div>
        <div className="mt-6 text-center text-sm">
            {footer}
        </div>
    </div>
);

export default Card;