import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { FiBriefcase } from 'react-icons/fi';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { setUser } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/users/login', formData);
            setUser(response.data.data.user);
            toast.success('Welcome back to DevConnect!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative z-10">
            {/* Ambient Backgrounds */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-pulse-slow pointer-events-none -z-10"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center animate-fade-in-up">
                <Link to="/" className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary to-accent rounded-2xl mb-6 shadow-xl shadow-primary/20 hover:scale-105 transition-transform duration-300">
                    <FiBriefcase className="w-8 h-8 text-white" />
                </Link>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                    Welcome back
                </h2>
                <p className="mt-3 text-slate-400 font-medium tracking-wide">
                    New to DevConnect?{' '}
                    <Link to="/register" className="font-bold text-primary hover:text-primary-hover transition-colors">
                        Create an account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up stagger-1">
                <div className="glass-card py-10 px-8 shadow-2xl rounded-[2.5rem]">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-bold text-slate-200 mb-2 tracking-wide">
                                Username or Email
                            </label>
                            <input
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="input-field"
                                placeholder=""
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-slate-200 tracking-wide">
                                    Password
                                </label>
                                <a href="#" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field"
                                placeholder=""
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-3.5 text-[15px] flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <span className="animate-pulse">Authenticating...</span>
                                ) : (
                                    <>
                                        <span>Sign in</span>
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="mt-8 text-center text-xs text-slate-400 font-medium px-10">
                    By continuing, you agree to DevConnect's <a href="#" className="underline hover:text-slate-400">Terms of Service</a> and <a href="#" className="underline hover:text-slate-400">Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
};

export default Login;
