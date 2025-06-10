import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import { object, string } from 'yup'
import { HOST_URL } from '../constants'
import axios from 'axios'

const initialValues = {
    name: '',
    role: '',
    email: '',
    password: ''
}

const schema = object({
    name: string().required('Enter your first name'),
    role: string().required('Enter a role'),
    email: string().email('Email should be valid').required('Enter your email'),
    password: string().min(6, 'Password must be at least 6 characters').required('Enter your password')
})

export default function Signup() {
    const navigate = useNavigate();
    const { values, errors, handleBlur, handleChange, handleSubmit, touched } = useFormik({
        initialValues: initialValues,
        validationSchema: schema,
        onSubmit: (values, action) => {
            console.log(values);
            signup(values);
        }
    });

    function signup(values) {
        const url = `${HOST_URL}/api/auth/register`
        axios.post(url, values).then(res => {
            sessionStorage.auth = res.data.token;
            sessionStorage.user = JSON.stringify({ name: res.data.name, role: res.data.role });
            const location = res.data.role === 'admin' ? '/admin' : '/dashboard';
            navigate(location);
        }).catch(err => {
            console.log(err)
        })
    }

    return (
        <div className='full-height'>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 pt-0 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        className="mx-auto h-10 w-auto"
                        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                        alt="Your Company"
                    />
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                        Sign up for your account
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="text" className="block text-sm font-medium leading-6 text-gray-900">
                                Full Name
                            </label>
                            <div className="mt-2">
                                <div className='grid grid-flow-row-dense gap-x-4'>
                                    <input id="name" name="name" type="text" autoComplete="name" placeholder="Enter Full Name" value={values.name} onChange={handleChange} onBlur={handleBlur} required
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                                <div className="grid grid-flow-row-dense grid-cols-2 gap-x-4">
                                    <div>{errors.name && touched.name ? (<p className='mt-1 text-red-500'>{errors.name}</p>) : ''}</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="Role" className="block text-sm font-medium leading-6 text-gray-900">
                                Role
                            </label>
                            <div className="mt-2">
                                <input id="role" name="role" type="text" autoComplete="role" placeholder="Enter Role" value={values.role} onChange={handleChange} onBlur={handleBlur} required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                                />
                                {errors.role && touched.role ? (
                                    <p className='mt-1 text-red-500'>{errors.role}</p>
                                ) : ''}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input id="email" name="email" type="email" autoComplete="email" placeholder="Enter Email" value={values.email} onChange={handleChange} onBlur={handleBlur} required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                                />
                                {errors.email && touched.email ? (
                                    <p className='mt-1 text-red-500'>{errors.email}</p>
                                ) : ''}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Password
                            </label>
                            <div className="mt-2">
                                <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter Password" value={values.password} onChange={handleChange} onBlur={handleBlur} required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                                />
                                {errors.password && touched.password ? (
                                    <p className='mt-1 text-red-500'>{errors.password}</p>
                                ) : ''}
                            </div>
                        </div>

                        <div>
                            <button type="submit" className="flex w-full justify-center rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600">
                                Sign up
                            </button>
                        </div>
                    </form>

                    <div className="mt-10 text-center text-sm text-gray-500">
                        <div className='relative mb-3'>
                            <div className='border-t w-full absolute top-2.5'></div>
                            <div className='relative'>
                                <span className='bg-white px-2.5'>Do you have account</span>
                            </div>
                        </div>
                        <Link to='/' className="font-semibold text-cyan-600 hover:text-cyan-500">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
