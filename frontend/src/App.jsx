import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Search from './pages/Search';
import useAuthStore from './store/authStore';
import useNotificationStore from './store/notificationStore';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
    const { user, isLoading } = useAuthStore();

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const AppContent = () => {
    const { user } = useAuthStore();
    const location = useLocation();
    
    
    const isAuthOrLandingPage = !user && (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register');

    return (
        <div className={`w-full min-h-screen font-sans overflow-x-hidden relative transition-colors duration-500 ${user ? 'bg-gray-50 text-gray-900' : 'dark bg-[#030712] text-white'}`}>
            {!isAuthOrLandingPage && <Navbar />}
            <main className={`${!isAuthOrLandingPage ? 'pt-[72px]' : ''} w-full flex flex-col`}>
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
                    <Route
                        path="/search"
                        element={
                            <ProtectedRoute>
                                <Search />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>
            <Toaster position="bottom-right" />
        </div>
    );
};
console.log("vercel test update")
const App = () => {
    const { user, fetchCurrentUser } = useAuthStore();
    const { fetchNotifications, subscribeToNotifications, unsubscribeFromNotifications } = useNotificationStore();

    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            subscribeToNotifications();
            return () => unsubscribeFromNotifications();
        }
    }, [user, fetchNotifications, subscribeToNotifications, unsubscribeFromNotifications]);

    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
};

export default App;
