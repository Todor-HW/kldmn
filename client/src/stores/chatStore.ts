import { create } from "zustand";
import { Socket } from "socket.io-client";

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
            const currentCount = notifications[data.from] || 0;
            notifications[data.from] = currentCount + 1;
            return { notifications };
        }),
    removeNotification: (data) => {
        set((state) => {
            const notifications = { ...state.notifications };
            delete notifications[data.from];
            return { notifications };
        });
    },
    // setMessages: (value) => set({ messages: value }),
}));
