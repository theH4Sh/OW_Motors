import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useDispatch } from "react-redux"
import { login } from '../slice/authSlice.js';

export default function Login() {

    const [formData, setFormData] = useState({
        identifier: "",
        password: ""
    });

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    useEffect(() => {
        console.log(formData)
    }, [formData]);

    const handleSubmit = (e) => {
        e.preventDefault()

        const API_URL = import.meta.env.VITE_API || 'http://localhost:8000/api/';
        fetch(API_URL + 'auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
            .then((res) => {
                if (!res.ok) {
                    return res.json().then((data) => {
                        console.log(data)
                        throw new Error(data.message || data.error || data.detail || 'Login Failed')
                    })
                }
                return res.json()
            })
            .then((data) => {
                console.log('login successful: ', data)
                dispatch(login(data))
                toast.success("Login successful! 🎉")
                localStorage.setItem('auth', JSON.stringify({
                    username: data.username,
                    token: data.token,
                    role: data.role,
                    branch: data.branch,
                    isAuthenticated: true
                }))
                navigate('/')
            })
            .catch((err) => {
                console.log("your error: ", err)
                toast.error(`${err}`)
            })
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="bg-slate-50 shadow-2xl rounded-2xl max-w-sm w-full md:w-96 p-8 space-y-6">
                <h2 className="text-3xl font-bold text-center text-gray-800">Welcome</h2>
                <p className="text-center text-gray-500">Login to your account</p>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                            Email or Username
                        </label>
                        <input
                            id="identifier"
                            type="text"
                            required
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                            placeholder="username or email"
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800]"
                            placeholder="••••••••"
                            onChange={handleChange}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-[#0B7C56] hover:bg-[#095c40] cursor-pointer text-white font-semibold rounded-lg transition duration-200"
                    >
                        Log In
                    </button>
                </form>
                <p className="text-center text-sm text-gray-500">
                    Don't have an account?{" "}
                    <Link to='/signup' className="text-blue-700 hover:underline">
                        Sign up
                    </Link>
                </p>

                <p className="text-center text-sm text-gray-500">
                    <Link to='/forgot-password' className="text-blue-700 hover:underline">
                        Forgot password?{" "}
                    </Link>
                </p>
            </div>
        </div>
    );
}