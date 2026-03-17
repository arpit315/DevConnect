import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
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
    const { fetchCurrentUser } = useAuthStore();

    // Check if user is already logged in when the app starts
    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
                <Navbar />
                <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
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
                                    <div className="py-10 text-center">Profile Page Coming Soon</div>
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
