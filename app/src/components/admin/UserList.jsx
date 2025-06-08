import React from 'react';

const mockUsers = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'User' },
    { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'Admin' },
    { id: 3, name: 'Charlie Lee', email: 'charlie@example.com', role: 'User' },
];

export default function UserList() {
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border-b">Name</th>
                            <th className="px-4 py-2 border-b">Email</th>
                            <th className="px-4 py-2 border-b">Role</th>
                            <th className="px-4 py-2 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border-b">{user.name}</td>
                                <td className="px-4 py-2 border-b">{user.email}</td>
                                <td className="px-4 py-2 border-b">{user.role}</td>
                                <td className="px-4 py-2 border-b">
                                    <button className="text-indigo-600 hover:underline mr-2">Edit</button>
                                    <button className="text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 