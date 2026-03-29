import { useState } from "react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const res = await fetch(
                "http://localhost:8000/api/auth/forgot-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Request failed");
            }

            setMessage(data.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="bg-slate-50 shadow-2xl rounded-2xl max-w-sm w-full md:w-96 p-8 space-y-6"
            >
                <h1 className="text-2xl font-semibold mb-4">Forgot Password</h1>

                <input
                    type="email"
                    placeholder="Enter your email"
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <button
                    className="w-full bg-[#0B7C56] hover:bg-[#095c40] cursor-pointer text-white py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>

                {message && <p className="text-green-600 mt-3">{message}</p>}
                {error && <p className="text-red-600 mt-3">{error}</p>}
            </form>
        </div>
    );
}