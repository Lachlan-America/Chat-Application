import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputBox from "./InputBox";

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

    return (
        <form onSubmit={handleSubmit} 
        className="flex flex-col items-center gap-5 justify-center w-[25vw] min-w-[350px] min-h-[500px] h-[50vh] border-1 rounded-[40px] shadow-l backdrop-blur-md p-[40px]">
            <h1 className="mb-10 text-[3.5rem] font-bold">Login</h1>
            {error && <p className="w-full bg-red-500 text-lg p-1">{error}</p>}
            <InputBox icon="bx-user" name="username" placeholder="Username" value={username} setValue={setUsername} />
            <InputBox icon="bx-lock" name="password" placeholder="Password" value={password} setValue={setPassword} />
            <button className="h-[60px] w-full mt-5" type="submit">Login</button>
            <p>Don't have an account? <a onClick={() => navigate('/signup')}>Sign up!</a></p>
        </form>
    );
}
