import React, { useEffect, useState } from 'react';
import { HOST_URL } from '../../constants';
import axios from '../../axiosInstance';


export default function RoleAssign() {
    const [userId, setUserId] = useState('');
    const [role, setRole] = useState('user');
    const [users, setUsers] = useState([]);
    const [status, setStatus] = useState(false);

    function handleAssign(e) {
        e.preventDefault();
        const url = `${HOST_URL}/api/users/updateUser/${userId}`;
        axios.put(url, { role }).then(res => {
            setStatus(true);
            setTimeout(() => {
                setStatus(false);
            }, 3000);
        }).catch(err => {
            console.log(err);
        });
    }

    useEffect(() => {
        const url = `${HOST_URL}/api/users`;
        axios.get(url).then(res => {
            setUsers(res.data);
        }).catch(err => {
            console.log(err);
        });
    }, []);

    return (
        <form onSubmit={handleAssign} className="p-4 bg-white rounded shadow-md max-w-md mx-auto mt-6">
            <h3 className="text-lg font-semibold mb-4">Assign Role</h3>
            <div className="mb-2">
                <label className="block text-sm font-medium mb-1">User</label>
                <select value={userId} onChange={e => setUserId(e.target.value)} className="w-full border rounded px-2 py-1">
                    <option value="">Select a user</option>
                    {users.map(user => (
                        <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Role</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="w-full border rounded px-2 py-1">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            {status && <p className="text-green-600">Role assigned successfully</p>}
            <button type="submit" className="bg-cyan-600 text-white px-4 py-1 rounded">Assign</button>
        </form>
    );
} 