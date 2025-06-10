import React from 'react';

export default function Loader() {
    return (
        <div className="flex justify-center items-center h-16">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        </div>
    );
}
