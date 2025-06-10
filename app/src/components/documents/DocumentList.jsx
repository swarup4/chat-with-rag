import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { HOST_URL } from '../../constants'

export default function DocumentList() {
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        const url = `${HOST_URL}/api/documents`
        axios.get(url).then(res => {
            setDocuments(res.data);
        }).catch(err => {
            console.log(err)
        })
    }, [])

    function getDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
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
                    {documents.map(doc => (
                        <tr key={doc.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border-b">{doc.name}</td>
                            <td className="px-4 py-2 border-b">{getDate(doc.createdAt)}</td>
                            <td className="px-4 text-center py-2 border-b">
                                {/* <button className="text-cyan-600 hover:underline mr-2">View</button>
                                <button className="text-green-600 hover:underline mr-2">Download</button> */}
                                <button className="text-red-600 hover:underline">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 