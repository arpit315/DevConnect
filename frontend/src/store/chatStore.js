import { create } from "zustand";
import { io } from "socket.io-client";
import useAuthStore from "./authStore";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:8000" : "/";

const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    socket: null,
    onlineUsers: [],

    connectSocket: () => {
        const { user } = useAuthStore.getState();
        if (!user || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            query: {
                userId: user._id,
            },
        });
        socket.connect();

        set({ socket });

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket?.connected) {
            socket.disconnect();
            set({ socket: null });
        }
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),

    setMessages: (messages) => set({ messages }),

    // Listen for incoming messages dynamically from any component
    subscribeToMessages: () => {
        const { socket } = get();
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            // Only add the message to the store if we are currently chatting with the sender
            const { selectedUser, messages } = get();

            if (selectedUser && newMessage.sender === selectedUser._id) {
                set({ messages: [...messages, newMessage] });
            }

            // Note: If you want to show a notification dot on the sidebar when unselected,
            // you could store a separate state like unreadMessages: { userId: count }
        });
    },

    unsubscribeFromMessages: () => {
        const { socket } = get();
        if (!socket) return;
        socket.off("newMessage");
    },
}));

export default useChatStore;
