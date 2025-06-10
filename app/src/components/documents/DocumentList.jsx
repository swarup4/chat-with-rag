import React from 'react';

const mockDocuments = [
    { id: 1, name: 'Report.pdf', uploaded: '2024-06-01' },
    { id: 2, name: 'Invoice.docx', uploaded: '2024-06-02' },
    { id: 3, name: 'Notes.txt', uploaded: '2024-06-03' },
];

export default function DocumentList() {
    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
            <h2 className="text-xl font-bold mb-4">Uploaded Documents</h2>
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr>
                        <th className="px-4 py-2 border-b">Name</th>
                        <th className="px-4 py-2 border-b">Uploaded</th>
                        <th className="px-4 py-2 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {mockDocuments.map(doc => (
                        <tr key={doc.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border-b">{doc.name}</td>
                            <td className="px-4 py-2 border-b">{doc.uploaded}</td>
                            <td className="px-4 py-2 border-b">
                                <button className="text-cyan-600 hover:underline mr-2">View</button>
                                <button className="text-green-600 hover:underline mr-2">Download</button>
                                <button className="text-red-600 hover:underline">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 