import React from 'react';

export default function AnswerCard({ answer }) {
    return (
        <div className="bg-gray-50 p-4 rounded shadow">
            <div className="mb-2">
                <span className="font-semibold">Answer:</span> {answer.text}
            </div>
            <div className="mb-2 text-sm text-gray-600">
                Confidence: <span className="font-mono">{(answer.confidence * 100).toFixed(1)}%</span>
            </div>
            <div>
                <span className="font-semibold">Relevant Excerpts:</span>
                <ul className="list-disc ml-6 mt-1">
                    {answer.excerpts.map((ex, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                            <span className="font-medium">{ex.doc}:</span> {ex.snippet}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
} 