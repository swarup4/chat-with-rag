import React from 'react';

const mockUsers = [
    { id: 1, name: 'Alice Smith' },
    { id: 2, name: 'Bob Johnson' },
    { id: 3, name: 'Charlie Lee' },
];

export default function RoleAssign() {
    const [selectedUser, setSelectedUser] = React.useState('');
    const [role, setRole] = React.useState('User');

    function handleAssign(e) {
        e.preventDefault();
        // TODO: handle role assignment
        alert(`Assigned ${role} role to user ID ${selectedUser}`);
    }

    return (
        <form onSubmit={handleAssign} className="p-4 bg-white rounded shadow-md max-w-md mx-auto mt-6">
            <h3 className="text-lg font-semibold mb-4">Assign Role</h3>
            <div className="mb-2">
                <label className="block text-sm font-medium mb-1">User</label>
                <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="w-full border rounded px-2 py-1">
                    <option value="">Select a user</option>
                    {mockUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Role</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="w-full border rounded px-2 py-1">
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                </select>
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-1 rounded">Assign</button>
        </form>
    );
} 