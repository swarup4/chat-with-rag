import React, { useState, useEffect } from 'react';
import axios from '../../axiosInstance';
import { HOST_URL } from '../../constants'


export default function UserList() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const url = `${HOST_URL}/api/users`;
        axios.get(url).then(res => {
            debugger
            setUsers(res.data);
        }).catch(err => {
            console.log(err)
        })
    }, []);

    function deleteUser(id) {
        const url = `${HOST_URL}/api/users/deleteUser/${id}`;
        axios.delete(url).then(res => {
            setUsers(users.filter(user => user._id !== id));
        }).catch(err => {
            console.log(err);
        });
    }

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
                        {users.map((user, idx) => (
                            <tr key={idx} className="hover:bg-gray-50" >
                                <td className="px-4 py-2 text-center border-b">{user.name}</td>
                                <td className="px-4 py-2 text-center border-b">{user.email}</td>
                                <td className="px-4 py-2 text-center border-b">{user.role}</td>
                                <td className="px-4 py-2 text-center border-b">

                                    {user.status == true ? (
                                        <button onClick={() => deleteUser(user._id)} className="text-red-600 hover:underline">Delete</button>
                                    ) : (
                                        <button className="text-cyan-600 hover:underline ml-2">Inactive</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 