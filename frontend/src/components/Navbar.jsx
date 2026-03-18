import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiUser, FiLogOut, FiBriefcase, FiBell, FiSearch, FiMessageSquare } from 'react-icons/fi';
import useAuthStore from '../store/authStore';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 glass-panel z-50">
            <div className="w-full px-6 md:px-12">
                <div className="flex justify-between items-center h-[72px]">
                    {/* Logo Area */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-[14px] shadow-lg group-hover:shadow-primary/40 transition-all duration-300">
                                <FiBriefcase className="w-5 h-5 text-white" />
                                <div className="absolute inset-0 bg-white/20 rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="text-[22px] font-extrabold tracking-tight text-secondary dark:text-white group-hover:text-primary transition-colors">
                                DevConnect
                            </span>
                        </Link>
                    </div>

                    {/* Search Bar (Visual Only for now) */}
                    <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                            <FiSearch className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search developers, projects, or tags..."
                            className="w-full bg-slate-100/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-transparent dark:border-white/10 focus:bg-white dark:focus:bg-white/10 focus:border-primary/30 dark:focus:border-primary/50 rounded-full py-2.5 pl-10 pr-4 text-sm text-slate-700 dark:text-white outline-none transition-all duration-300 placeholder-slate-400 shadow-inner group-focus-within:shadow-md"
                        />
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-6">
                        {user ? (
                            <>
                                <Link to="/" className="text-slate-500 hover:text-primary transition-all flex flex-col items-center group relative p-2">
                                    <FiHome className="w-[22px] h-[22px] group-hover:-translate-y-0.5 transition-transform" />
                                    <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </Link>

                                <Link to="/chat" className="text-slate-500 hover:text-primary transition-all flex flex-col items-center group relative p-2">
                                    <FiMessageSquare className="w-[22px] h-[22px] group-hover:-translate-y-0.5 transition-transform" />
                                </Link>

                                <Link to={`/profile/${user.username}`} className="text-slate-500 hover:text-primary transition-all flex flex-col items-center group relative p-2">
                                    <FiUser className="w-[22px] h-[22px] group-hover:-translate-y-0.5 transition-transform" />
                                </Link>

                                <button className="text-slate-500 hover:text-primary transition-all flex flex-col items-center group relative p-2">
                                    <FiBell className="w-[22px] h-[22px] group-hover:-translate-y-0.5 transition-transform animate-[wiggle_1s_ease-in-out_infinite]" />
                                    <div className="absolute top-1 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white"></div>
                                </button>

                                <div className="h-8 w-px bg-slate-200/60 mx-1"></div>

                                <div className="flex items-center gap-4">
                                    <Link to={`/profile/${user.username}`} className="relative group cursor-pointer flex items-center pr-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors border border-slate-100">
                                        <img
                                            src={user.avatar}
                                            alt={user.fullName}
                                            className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                                        />
                                        <span className="ml-2.5 text-sm font-semibold text-slate-700">{user.fullName.split(' ')[0]}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-full transition-all duration-300"
                                        title="Logout"
                                    >
                                        <FiLogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="btn-outline"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn-primary"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
