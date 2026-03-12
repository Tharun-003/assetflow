import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import { users } from '../data/mockData';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('chairman');
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        // Mock authentication
        const matchedUser = users.find(u => u.role === role);
        if (matchedUser) {
            login(matchedUser);
            navigate('/dashboard');
        } else {
            setError('Invalid role selection for mock data');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-2">
                        <img src="/logo.png" alt="CIT Logo" className="h-20 object-contain" />
                    </div>
                </div>
                <h2 className="text-3xl font-black text-primary tracking-tight mb-2">AssetFlow</h2>
                <p className="mt-2 text-sm text-secondaryText">AI-Powered Institutional Asset Management</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-borderContent">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-medium text-primaryText">Role</label>
                            <div className="mt-1">
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-borderContent rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
                                >
                                    <option value="chairman">chairman</option>
                                    <option value="principle">principle</option>
                                    <option value="asset_admin">asset_admin</option>
                                    <option value="faculty">faculty</option>
                                    <option value="HOD">HOD</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-primaryText">Email address</label>
                            <div className="mt-1">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-borderContent rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
                                    placeholder="Enter any email for mock login"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-primaryText">Password</label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-borderContent rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
                                    placeholder="Enter any password"
                                />
                            </div>
                        </div>

                        {error && <div className="text-red-600 text-sm text-center">{error}</div>}

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primaryText bg-accent hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
                            >
                                <LogIn className="mr-2 h-5 w-5" />
                                Sign in
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
