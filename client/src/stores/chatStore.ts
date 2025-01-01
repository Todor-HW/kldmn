import { create } from "zustand";
import { Socket } from "socket.io-client";
import Cookies from "js-cookie";

import { User } from "../types/chatTypes";

interface ChatStore {
    socket: Socket | null;
    user: User | null;
    activePeer: User | null;
    notifications: Record<string, number>;
    // messages: Message[];

    setSocket: (value: Socket) => void;
    setUser: (value: User) => void;
    setActivePeer: (value: User) => void;
    setNotifications: (data: Record<string, number>) => void;
    addNotification: (data: { from: string }) => void;
    removeNotification: (data: { from: string }) => void;
    // setMessages: (value: Message[]) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
    socket: null,
    user: null,
    activePeer: null,
    notifications: {},
    // messages: [],

    setSocket: (value) => set({ socket: value }),
    setUser: (value) => set({ user: value }),
    setActivePeer: (value) => set({ activePeer: value }),
    setNotifications: (value) => set({ notifications: value }),
    addNotification: (data) =>
        set((state) => {
            const notifications = { ...state.notifications };

            if (data.from) {
                const currentCount = notifications[data.from] || 0;
                notifications[data.from] = currentCount + 1;

                // Update or set cookie
                const stored = Cookies.get("notifications");
                const parsed = stored ? JSON.parse(stored) : {};
                parsed[data.from] = currentCount + 1;
                Cookies.set("notifications", JSON.stringify(parsed));
            } else {
                console.error("Invalid data: 'from' is required.");
            }

            return { notifications };
        }),
    removeNotification: (data) => {
        set((state) => {
            const notifications = { ...state.notifications };

            if (data.from) {
                delete notifications[data.from];

                // Update or set cookie
                const stored = Cookies.get("notifications");
                const parsed = stored ? JSON.parse(stored) : {};
                delete parsed[data.from];
                Cookies.set("notifications", JSON.stringify(parsed));
            } else {
                console.error("Invalid data: 'from' is required.");
            }

            return { notifications };
        });
    },
    // setMessages: (value) => set({ messages: value }),
}));
