import React from 'react';
import QAInterface from '../components/qa/QAInterface';

export default function QAPage() {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold mb-6">Q&A</h1>
            <QAInterface />
        </div>
    );
} 