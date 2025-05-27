import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function LoginPage() {
    // State to hold the form values
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate(); // Initialize navigate function

    // Function to handle form submission
    interface LoginResponse {
        token?: string;
        message?: string;
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        // Stops the page from refreshing
        e.preventDefault();

        // On submit, fetch the JSON response from the API
        fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })
        .then(async (res: Response) => {
            const data: LoginResponse = await res.json();
            if (res.status === 200) {
                alert('Login successful!');
                sessionStorage.setItem('token', data.token as string);
                navigate('/chat');
            } else {
                setError(data.message as string);
            }
        })
        .catch(() => {
            setError("Network error. Please try again.");
        });
    };
    
    const goToSignupPage = () => {
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
            <button onClick={goToSignupPage}>Don't have an account? Sign Up</button>
        </div>
    );
}
