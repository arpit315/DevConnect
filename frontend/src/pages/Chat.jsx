import React, { useEffect, useRef, useState } from 'react';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';
import api from '../api/axios';
import { FiSend, FiUser, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Chat = () => {
    const { user } = useAuthStore();
    const {
        messages,
        users,
        selectedUser,
        isUsersLoading,
        isMessagesLoading,
        onlineUsers,
        setSelectedUser,
        setMessages,
        subscribeToMessages,
        unsubscribeFromMessages,
    } = useChatStore();

    const [messageInput, setMessageInput] = useState('');
    const [localUsers, setLocalUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const messagesEndRef = useRef(null);

    // Fetch all users to chat with
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // For simplicity, we'll fetch all users except the current user
                // In a real app, you might want to fetch only users they follow or have chatted with
                const res = await api.get('/users/all'); // We need to create this endpoint
                setLocalUsers(res.data.data.filter((u) => u._id !== user._id));
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setIsLoadingUsers(false);
            }
        };

        if (user) {
            fetchUsers();
        }
    }, [user]);

    // Fetch messages when a user is selected
    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedUser) return;
            try {
                const res = await api.get(`/messages/${selectedUser._id}`);
                setMessages(res.data.data);
            } catch (error) {
                toast.error("Failed to load messages");
            }
        };

        fetchMessages();

        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [selectedUser, subscribeToMessages, unsubscribeFromMessages, setMessages]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedUser) return;

        try {
            const res = await api.post(`/messages/send/${selectedUser._id}`, {
                content: messageInput,
            });

            // Optimistically add the message to the UI
            setMessages([...messages, res.data.data]);
            setMessageInput('');
        } catch (error) {
            toast.error("Failed to send message");
        }
    };

    return (
        <div className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative">
            {/* Ambient Background Glows */}
            <div className="fixed top-20 left-10 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob pointer-events-none -z-10"></div>
            <div className="fixed top-40 right-10 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000 pointer-events-none -z-10"></div>

            <div className="glass-panel rounded-3xl overflow-hidden h-[80vh] flex shadow-2xl border border-white/40">

                {/* Sidebar - User List */}
                <div className="w-[320px] border-r border-slate-200/50 flex flex-col bg-white/40 backdrop-blur-md">
                    <div className="p-6 border-b border-slate-200/50 flex justify-between items-center">
                        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Messages</h2>
                        <button className="w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                            <i className="fa-solid fa-pen text-sm"></i>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                        {isLoadingUsers ? (
                            <div className="flex justify-center py-10">
                                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            </div>
                        ) : localUsers.length === 0 ? (
                            <div className="text-center py-10 text-slate-500">
                                <p>No users found.</p>
                            </div>
                        ) : (
                            localUsers.map((u) => (
                                <button
                                    key={u._id}
                                    onClick={() => setSelectedUser(u)}
                                    className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-200 ${selectedUser?._id === u._id
                                        ? 'bg-primary/10 border border-primary/20 shadow-sm'
                                        : 'hover:bg-white/60 text-slate-700 border border-transparent'
                                        }`}
                                >
                                    <div className="relative shrink-0">
                                        <img src={u.avatar || "https://i.pravatar.cc/150"} alt={u.username} className="w-12 h-12 rounded-full object-cover bg-white" />
                                        {onlineUsers.includes(u._id) ? (
                                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></span>
                                        ) : (
                                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-slate-300 border-2 border-white rounded-full"></span>
                                        )}
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <p className={`font-bold truncate text-[15px] ${selectedUser?._id === u._id ? 'text-primary' : 'text-slate-800'}`}>
                                                {u.fullName}
                                            </p>
                                        </div>
                                        <p className="text-[13px] truncate text-slate-500 font-medium">
                                            @{u.username}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-white/20 backdrop-blur-sm relative">
                    {!selectedUser ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6 shadow-inner border border-primary/10">
                                <FiInfo className="w-10 h-10 text-primary/50" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-700 mb-2">Your Messages</h3>
                            <p className="font-medium">Select a conversation from the sidebar to start chatting.</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b border-slate-200/50 bg-white/40 flex items-center justify-between backdrop-blur-md">
                                <div className="flex items-center gap-4">
                                    <img src={selectedUser.avatar || "https://i.pravatar.cc/150"} alt={selectedUser.username} className="w-11 h-11 rounded-full object-cover shadow-sm bg-white border border-slate-100" />
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{selectedUser.fullName}</h3>
                                        <p className="text-xs font-semibold mt-0.5">
                                            {onlineUsers.includes(selectedUser._id) ? (
                                                <span className="text-emerald-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online</span>
                                            ) : (
                                                <span className="text-slate-400">Offline</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <button className="w-10 h-10 rounded-full text-slate-400 hover:text-primary hover:bg-white flex items-center justify-center transition-colors shadow-sm">
                                    <i className="fa-solid fa-circle-info text-lg"></i>
                                </button>
                            </div>

                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender === user._id;
                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                            <div className={`max-w-[75%] rounded-[20px] px-5 py-3.5 shadow-sm text-[15px] leading-relaxed relative border ${isMe
                                                ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-br-sm shadow-primary/20 border-transparent'
                                                : 'bg-white/80 text-slate-800 rounded-tl-sm border-white backdrop-blur-md shadow-sm'
                                                }`}>
                                                <p>{msg.content}</p>
                                                <p className={`text-[11px] font-medium mt-1.5 flex ${isMe ? 'justify-end text-white/70' : 'justify-start text-slate-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 bg-white/60 backdrop-blur-md border-t border-slate-200/50">
                                <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                                    <button type="button" className="w-10 h-10 rounded-full text-slate-400 hover:text-primary hover:bg-white flex items-center justify-center transition-colors shrink-0 shadow-sm">
                                        <i className="fa-regular fa-face-smile text-xl"></i>
                                    </button>
                                    <button type="button" className="w-10 h-10 rounded-full text-slate-400 hover:text-primary hover:bg-white flex items-center justify-center transition-colors shrink-0 shadow-sm">
                                        <i className="fa-solid fa-paperclip text-lg"></i>
                                    </button>

                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            placeholder="Type a message..."
                                            className="w-full bg-white/50 border border-slate-200 focus:border-primary/50 focus:bg-white rounded-full py-3.5 px-6 outline-none transition-all shadow-inner text-[15px] text-slate-800"
                                            autoComplete="off"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!messageInput.trim()}
                                        className="btn-primary rounded-full w-12 h-12 flex items-center justify-center p-0 shrink-0 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none bg-gradient-to-r from-primary to-secondary border-none transform transition-transform"
                                    >
                                        <FiSend className="w-5 h-5 -ml-1 text-white" />
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
