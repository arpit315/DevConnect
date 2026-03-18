import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import useAuthStore from './store/authStore';
import { Toaster } from 'react-hot-toast';

// A generic wrapper to protect routes that require login
const ProtectedRoute = ({ children }) => {
    const { user, isLoading } = useAuthStore();

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const App = () => {
    const { user, fetchCurrentUser } = useAuthStore();

    // Check if user is already logged in when the app starts
    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    return (
        <BrowserRouter>
            <div className={`w-full min-h-screen font-sans overflow-x-hidden relative transition-colors duration-500 ${user ? 'bg-gray-50 text-gray-900' : 'dark bg-[#030712] text-white'}`}>
                <Navbar />
                <main className="pt-[72px] w-full flex flex-col">
                    <Routes>
                        <Route path="/" element={user ? <Home /> : <Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/chat"
                            element={
                                <ProtectedRoute>
                                    <Chat />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile/:username"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </main>
                <Toaster position="bottom-right" />
            </div>
        </BrowserRouter>
    );
};

export default App;
