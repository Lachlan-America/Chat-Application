import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
console.log(API_URL);

export default function LoginPage() {
    // State to hold the form values
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate(); // Initialize navigate function

    // Function to handle form submission
    const handleSubmit = async (e) => {
        // Stops the page from refreshing
        e.preventDefault();

        // Transmits form data as JSON to the server
        const res = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (res.status === 200) {
            //localStorage.setItem('token', data.token);
            alert('Login successful!');

            // Store the token in local storage (if needed)
            localStorage.setItem('token', data.token);

            // Navigate to chat page after successful login
            navigate('/chat');
        } else {
            setError(data.message);
        }
    };
    
    // Handle navigation to signup page
    const goToSignup = () => {
        navigate('/signup');
    };

    return (
        <div>
            <h1>Login</h1>
            {error && <p className="w-full bg-red-500">{error}</p>}
            <form onSubmit={handleSubmit} id="loginForm">
                <div>
                    <input className="border border-gray-300 rounded-lg shadow-lg mt-8 mb-2 w-lg p-10px"
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <input className="border border-gray-300 rounded-lg shadow-lg mb-5 w-lg p-10px"
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="mb-3">Login</button>
            </form>
            <button onClick={goToSignup}>Don't have an account? Sign Up</button>
        </div>
    );
}
