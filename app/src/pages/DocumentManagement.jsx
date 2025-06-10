import React, { useState } from 'react';
import DocumentUpload from '../components/documents/DocumentUpload';
import DocumentList from '../components/documents/DocumentList';

export default function DocumentManagement() {
    const [refresh, setRefresh] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold mb-6">Document Management</h1>
            <DocumentUpload uploadFile={(status) => setRefresh(status)} />
            <DocumentList refresh={refresh} />
        </div>
    );
}