import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {

    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const API_URL = import.meta.env.VITE_API || 'http://localhost:8000/api/';
        fetch(API_URL + 'auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
            .then((res) => {
                if (!res.ok) {
                    return res.json().then((data) => {

                        const firstKey = Object.keys(data)[0]
                        const err = data[firstKey][0]
                        console.log(data[firstKey])
                        throw new Error(err)
                    })
                }
                return res.json()
            })
            .then((res) => {
                console.log('signup successful: ', res);
                toast.success("Signup successful! 🎉")
                navigate('/login')
            })
            .catch((err) => {
                console.log("catch block: ", err.message)
                toast.error(`${err}`)
            })
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="bg-slate-50 shadow-2xl rounded-2xl max-w-sm sm:w-full md:w-96 p-8 space-y-6">
                <h2 className="text-3xl font-bold text-center text-gray-800">Create Account</h2>
                <p className="text-center text-gray-500">Join us and get started!</p>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            required
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                            placeholder="User_123"
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                            placeholder="you@example.com"
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
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                            placeholder="••••••••"
                            onChange={handleChange}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 text-white font-semibold cursor-pointer
            rounded-lg transition duration-200 bg-[#0B7C56] hover:bg-[#095c40]"
                    >
                        Sign Up
                    </button>
                </form>
                <p className="text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link to="/" className="text-blue-700 hover:underline font-medium">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}