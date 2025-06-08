import React from 'react';
import DocumentUpload from '../components/documents/DocumentUpload';
import DocumentList from '../components/documents/DocumentList';

export default function DocumentManagement() {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold mb-6">Document Management</h1>
            <DocumentUpload />
            <DocumentList />
        </div>
    );
} 