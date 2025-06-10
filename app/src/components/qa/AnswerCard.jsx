import React from 'react';

export default function AnswerCard({ chats }) {
    return (
        <div className="flex flex-col gap-4 mt-6 overflow-auto">
            {chats.map((chat, index) => (
                <div key={index} className="flex flex-col gap-2">
                    {chat.question && (
                        <div className="flex justify-end">
                            <div className="bg-indigo-100 text-indigo-900 px-4 py-2 rounded-2xl rounded-br-sm max-w-[70%] shadow">
                                <span className="font-semibold">You:</span> {chat.question}
                            </div>
                        </div>
                    )}

                    {chat.answer && (
                        <div className="flex justify-start">
                            <div className="bg-teal-100 border text-teal-900 border-teal-200 px-4 py-2 rounded-2xl rounded-bl-sm max-w-[70%] shadow">
                                <span className="font-semibold">Bot:</span> {chat.answer}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}