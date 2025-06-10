import React, { useState } from 'react';
import axios from 'axios'
import AnswerCard from './AnswerCard';
import { RAG_URL } from '../../constants'

export default function QAInterface() {
    const [question, setQuestion] = useState('');
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        getAnswer(question)
    }

    function getAnswer(question) {
        setLoading(true);
        const url = `${RAG_URL}/qa`
        const data = { question };

        axios.post(url, data).then(res => {
            console.log(res.data);
            data.answer = res.data.answer;
            setChat([...chat, data]);
            setQuestion('');
            setLoading(false);
        }).catch(err => {
            console.log(err)
        })
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
                <button className="bg-cyan-600 text-white px-4 py-2 rounded" disabled={loading}>
                    {loading ? 'Asking...' : 'Ask'}
                </button>
            </form>
            {chat.length > 0 ? <AnswerCard chats={chat} /> : ''}
        </div>
    );
} 