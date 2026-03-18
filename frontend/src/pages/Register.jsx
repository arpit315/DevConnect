import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { FiBriefcase } from 'react-icons/fi';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: ''
    });
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
            await api.post('/users/register', formData);

            const loginResp = await api.post('/users/login', {
                email: formData.email,
                password: formData.password
            });

            setUser(loginResp.data.data.user);
            toast.success('Account created successfully! Welcome!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative z-10 pt-20">
            {/* Ambient Backgrounds */}
            <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-pulse-slow pointer-events-none -z-10"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center animate-fade-in-up">
                <Link to="/" className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-accent to-primary rounded-2xl mb-6 shadow-xl shadow-accent/20 hover:scale-105 transition-transform duration-300">
                    <FiBriefcase className="w-8 h-8 text-white" />
                </Link>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                    Join DevConnect
                </h2>
                <p className="mt-3 text-slate-400 font-medium tracking-wide">
                    Already an awesome member?{' '}
                    <Link to="/login" className="font-bold text-accent hover:text-primary transition-colors">
                        Sign in here
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up stagger-1">
                <div className="glass-card py-8 px-8 sm:px-10 shadow-2xl rounded-[2.5rem]">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-bold text-slate-200 mb-1.5 tracking-wide">Full Name</label>
                            <input
                                name="fullName"
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                className="input-field py-3"
                                placeholder=""
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-200 mb-1.5 tracking-wide">Username</label>
                            <input
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="input-field py-3"
                                placeholder=""
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-200 mb-1.5 tracking-wide">Email address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field py-3"
                                placeholder=""
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-200 mb-1.5 tracking-wide">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                minLength="6"
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field py-3"
                                placeholder="Minimum 6 characters"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative inline-flex items-center justify-center px-6 py-3.5 overflow-hidden font-bold text-white bg-gradient-to-r from-accent to-primary rounded-full shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {loading ? 'Setting up your space...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
