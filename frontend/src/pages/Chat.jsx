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
        <div className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="glass-panel rounded-3xl overflow-hidden h-[80vh] flex shadow-2xl border border-white/20">

                {/* Sidebar - User List */}
                <div className="w-1/3 border-r border-slate-200/50 flex flex-col bg-white/40">
                    <div className="p-6 border-b border-slate-200/50">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Messages</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {isLoadingUsers ? (
                            <div className="flex justify-center py-10">
                                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            </div>
                        ) : localUsers.length === 0 ? (
                            <div className="text-center py-10 text-slate-500">
                                <p>No users found to chat with.</p>
                            </div>
                        ) : (
                            localUsers.map((u) => (
                                <button
                                    key={u._id}
                                    onClick={() => setSelectedUser(u)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${selectedUser?._id === u._id
                                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                                            : 'hover:bg-white/60 text-slate-700'
                                        }`}
                                >
                                    <div className="relative">
                                        <img src={u.avatar} alt={u.username} className="w-12 h-12 rounded-full border-2 border-white/50 bg-white" />
                                        {onlineUsers.includes(u._id) && (
                                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                                        )}
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <p className={`font-semibold truncate ${selectedUser?._id === u._id ? 'text-white' : 'text-slate-800'}`}>
                                            {u.fullName}
                                        </p>
                                        <p className={`text-sm truncate ${selectedUser?._id === u._id ? 'text-indigo-100' : 'text-slate-500'}`}>
                                            @{u.username}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-white/20 backdrop-blur-sm">
                    {!selectedUser ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                <FiInfo className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-700 mb-2">Your Messages</h3>
                            <p>Select a conversation from the sidebar to start chatting.</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="p-6 border-b border-slate-200/50 bg-white/40 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img src={selectedUser.avatar} alt={selectedUser.username} className="w-10 h-10 rounded-full bg-white" />
                                    <div>
                                        <h3 className="font-bold text-slate-800">{selectedUser.fullName}</h3>
                                        <p className="text-sm text-slate-500">
                                            {onlineUsers.includes(selectedUser._id) ? (
                                                <span className="text-green-500 font-medium">Online</span>
                                            ) : (
                                                'Offline'
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender === user._id;
                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${isMe
                                                    ? 'bg-gradient-to-br from-primary to-indigo-700 text-white rounded-tr-none'
                                                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                                                }`}>
                                                <p>{msg.content}</p>
                                                <p className={`text-xs mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 bg-white/40 border-t border-slate-200/50">
                                <form onSubmit={handleSendMessage} className="flex gap-4">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 input-field py-3 px-5 rounded-full"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!messageInput.trim()}
                                        className="btn-primary rounded-full w-12 h-12 flex items-center justify-center p-0 flex-shrink-0 disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        <FiSend className="w-5 h-5 -ml-1" />
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
