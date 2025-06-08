import React, { useState } from 'react';
import AnswerCard from './AnswerCard';

export default function QAInterface() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState(null);
    const [loading, setLoading] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setAnswer({
                text: 'This is a mock answer to your question.',
                confidence: 0.92,
                excerpts: [
                    { doc: 'Report.pdf', snippet: 'Relevant excerpt from Report.pdf...' },
                    { doc: 'Notes.txt', snippet: 'Another relevant excerpt from Notes.txt...' },
                ],
            });
            setLoading(false);
        }, 1200);
    }

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
            <h2 className="text-xl font-bold mb-4">Ask a Question</h2>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input
                    type="text"
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="Type your question..."
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    required
                />
                <button className="bg-indigo-600 text-white px-4 py-2 rounded" disabled={loading}>
                    {loading ? 'Asking...' : 'Ask'}
                </button>
            </form>
            {answer && <AnswerCard answer={answer} />}
        </div>
    );
} 