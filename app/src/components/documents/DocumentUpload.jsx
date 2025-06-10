import React, { useRef, useState } from 'react';

export default function DocumentUpload() {
    const [files, setFiles] = useState([]);
    const inputRef = useRef();

    function handleFiles(selected) {
        setFiles(Array.from(selected));
    }

    function handleDrop(e) {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleUpload() {
        // Mock upload logic
        alert(`${files.length} file(s) uploaded!`);
        setFiles([]);
    }

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-8">
            <h2 className="text-xl font-bold mb-4">Upload Documents</h2>
            <div
                className="border-2 border-dashed border-gray-300 rounded p-6 text-center cursor-pointer mb-4"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => inputRef.current.click()}
            >
                <input
                    type="file"
                    multiple
                    ref={inputRef}
                    className="hidden"
                    onChange={e => handleFiles(e.target.files)}
                />
                <p className="text-gray-500">Drag and drop files here, or click to select files</p>
            </div>
            {files.length > 0 && (
                <ul className="mb-4 text-left">
                    {files.map((file, idx) => (
                        <li key={idx} className="text-sm text-gray-700">{file.name}</li>
                    ))}
                </ul>
            )}
            <button onClick={handleUpload} disabled={files.length === 0} className="bg-cyan-600 text-white px-4 py-2 rounded disabled:opacity-50">
                Upload
            </button>
        </div>
    );
} 