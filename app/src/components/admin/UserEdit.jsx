import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik'
import { useParams, useNavigate } from 'react-router-dom';
import { object, string } from 'yup'
import { HOST_URL } from '../../constants';
import axios from '../../axiosInstance';

const schema = object({
    name: string().required('Name is required'),
    email: string().email('Invalid email').required('Email is required'),
    role: string().required('Role is required')
})

export default function UserEdit() {
    const { id } = useParams();
    const [status, setStatus] = useState(false);
    const [initialValues, setInitialValues] = useState({
        name: '',
        email: '',
        role: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const { values, errors, handleBlur, handleChange, handleSubmit, touched } = useFormik({
        initialValues,
        validationSchema: schema,
        enableReinitialize: true,
        onSubmit: (values) => {
            updateUser(id, values);
        }
    });

    function updateUser(id, values) {
        const url = `${HOST_URL}/api/users/updateUser/${id}`;
        axios.put(url, values).then(res => {
            console.log(res.data);
            setStatus(true);
            setTimeout(() => {
                setStatus(false);
            }, 3000);
        }).catch(err => {
            console.log(err);
        })
    }

    useEffect(() => {
        const url = `${HOST_URL}/api/users/getUser/${id}`;
        setIsLoading(true);
        axios.get(url).then(res => {
            setInitialValues(res.data);
            setIsLoading(false);
        }).catch(err => {
            console.log(err);
            setIsLoading(false);
        })
    }, []);

    function onCancel() {
        navigate('/admin/users');
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-md max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input 
                    name="name" 
                    value={values.name} 
                    onChange={handleChange} 
                    onBlur={handleBlur}
                    className="w-full border rounded px-2 py-1" 
                />
                {errors.name && touched.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
            </div>
            <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                    name="email" 
                    value={values.email} 
                    onChange={handleChange} 
                    onBlur={handleBlur}
                    className="w-full border rounded px-2 py-1" 
                />
                {errors.email && touched.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Role</label>
                <select 
                    name="role" 
                    value={values.role} 
                    onChange={handleChange} 
                    onBlur={handleBlur}
                    className="w-full border rounded px-2 py-1"
                >
                    <option value="">Select Role</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                {errors.role && touched.role && (
                    <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                )}
            </div>
            {status && <p className="text-green-600 mb-4">User updated successfully</p>}
            <div className="flex gap-2">
                <button type="submit" className="bg-cyan-600 text-white px-4 py-1 rounded">Save</button>
                <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-1 rounded">Cancel</button>
            </div>
        </form>
    );
} 