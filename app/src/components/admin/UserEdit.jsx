import React from 'react';

export default function UserEdit({ user, onSave, onCancel }) {
    const [form, setForm] = React.useState(user || { name: '', email: '', role: 'User' });

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        onSave(form);
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-md max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Role</label>
                <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded px-2 py-1">
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                </select>
            </div>
            <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-1 rounded">Save</button>
                <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-1 rounded">Cancel</button>
            </div>
        </form>
    );
} 