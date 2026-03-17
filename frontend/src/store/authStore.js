import { create } from "zustand";
import api from "../api/axios";
import useChatStore from "./chatStore";

const useAuthStore = create((set) => ({
    user: null,
    isLoading: false,

    setUser: (user) => {
        set({ user });
        // Connect socket when user logs in manually
        if (user) {
            useChatStore.getState().connectSocket();
        }
    },

    fetchCurrentUser: async () => {
        try {
            const res = await api.get("/users/me");
            const user = res.data.data;
            set({ user });

            // Connect socket if user session is restored
            if (user) {
                useChatStore.getState().connectSocket();
            }
        } catch {
            set({ user: null });
            useChatStore.getState().disconnectSocket();
        }
    },

    logout: async () => {
        await api.post("/users/logout");
        set({ user: null });
        useChatStore.getState().disconnectSocket();
    },
}));

export default useAuthStore;
