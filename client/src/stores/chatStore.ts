import { create } from "zustand";
import { Socket } from "socket.io-client";

import { User } from "../types/chatTypes";

interface ChatStore {
    socket: Socket | null;
    user: User | null;
    activePeer: User | null;
    notifications: Map<string, number>;
    // messages: Message[];

    setSocket: (value: Socket) => void;
    setUser: (value: User) => void;
    setActivePeer: (value: User) => void;
    setNotifications: (data: { from: string }) => void;
    clearNotifications: (data: { from: string }) => void;
    // setMessages: (value: Message[]) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
    socket: null,
    user: null,
    activePeer: null,
    notifications: new Map(),
    // messages: [],

    setSocket: (value) => set({ socket: value }),
    setUser: (value) => set({ user: value }),
    setActivePeer: (value) => set({ activePeer: value }),
    setNotifications: (data) =>
        set((state) => {
            const notifications = new Map(state.notifications);
            const currentCount = notifications.get(data.from) || 0;
            notifications.set(data.from, currentCount + 1);
            return { notifications };
        }),
    clearNotifications: (data) => {
        set((state) => {
            const notifications = new Map(state.notifications);
            notifications.delete(data.from);
            return { notifications };
        });
    },
    // setMessages: (value) => set({ messages: value }),
}));
