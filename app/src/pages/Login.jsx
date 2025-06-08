import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import { object, string } from 'yup'
import axios from 'axios'
import { HOST_URL } from '../constants'

const initialValues = {
    email: '',
    password: ''
}
const schema = object({
    email: string().email('Email should be valid').required('Enter your email'),
    password: string().required('Enter your password')
})

export default function Login() {
    const navigate = useNavigate();

    const { values, errors, handleBlur, handleChange, handleSubmit, touched } = useFormik({
        initialValues: initialValues,
        validationSchema: schema,
        onSubmit: (values, action) => {
            console.log(values);
            login(values);
        }
    });

    function login(data) {
        const url = `${HOST_URL}user/login`
        axios.post(url, data).then(res => {
            // console.log(res.data);
            sessionStorage.auth = res.data.token;
            const location = sessionStorage.url;
            navigate(location);
        }).catch(err => {
            console.log(err)
        })
    }


    return (
        <div className='full-height'>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 pt-0 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                        Sign in to your account
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input id="email" name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange} onBlur={handleBlur}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                                {errors.email && touched.email ? (
                                    <p className='mt-1 text-red-500'>{errors.email}</p>
                                ) : ''}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                    Password
                                </label>
                                <div className="text-sm">
                                    <Link to='/forgotpassword' className="font-semibold text-indigo-600 hover:text-indigo-500">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>
                            <div className="mt-2">
                                <input id="password" name="password" type="password" autoComplete="current-password" value={values.password} onChange={handleChange} onBlur={handleBlur}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                                {(errors.password && touched.password) ? (
                                    <p className='mt-1 text-red-500'>{errors.password}</p>
                                ) : ''}
                            </div>
                        </div>

                        <div>
                            <button type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                Sign in
                            </button>
                        </div>
                    </form>

                    <div className="mt-10 text-center text-sm text-gray-500">
                        <div className='relative mb-3'>
                            <div className='border-t w-full absolute top-2.5'></div>
                            <div className='relative'>
                                <span className='bg-white px-2.5'>Don't have account</span>
                            </div>
                        </div>
                        <Link to='/signup' className="font-semibold text-indigo-600 hover:text-indigo-500">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
