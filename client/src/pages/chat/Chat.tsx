import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Cookies from "js-cookie";

import { Message } from "../../types/chatTypes";
import { fetchUser } from "../../services";
import { usePreventAppScroll } from "../../hooks";
import { useChatStore } from "../../stores/chatStore";
import { useErrorStore } from "../../stores/errorStore";
import { Header, MessageInput, Messages } from "./components";

const SOCKET_BASE_URL =
    import.meta.env.MODE === "production" ? "https://api.kldmn.xyz" : "http://localhost:8080";

export const Chat = () => {
    const [isConnected, set_isConnected] = useState<boolean>(false);
    const [messages, set_messages] = useState<Message[]>([]);
    const [isPeerTyping, set_isPeerTyping] = useState<boolean>(false);

    const {
        //ln
        socket,
        user,
        activePeer,
        notifications,
        setSocket,
        setUser,
        addNotification,
    } = useChatStore();
    const { setErrorMessage } = useErrorStore();

    const inTypingTimerRef = useRef<number | null>(null);

    usePreventAppScroll();
    // usePeers(); // TODO: remove

    useEffect(() => {
        (async () => {
            try {
                const publicId = Cookies.get("publicId");
                // TODO: if publicId fetch  else create - separate routes
                const fetched = await fetchUser(publicId);
                Cookies.set("publicId", fetched.publicId, { sameSite: "Lax" });
                setUser(fetched);
            } catch (err) {
                console.error("Error:", err);
                setErrorMessage((err as Error).message);
            }
        })();
    }, []);

    useEffect(() => {
        if (user) {
            const newSocket = io(SOCKET_BASE_URL, { autoConnect: false });
            newSocket.auth = { publicId: user?.publicId };
            newSocket.connect();
            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user]);

    useEffect(() => {
        if (socket) {
            socket.onAny((event, ...args) => {
                console.log(event, args);
            });

            socket.on("connect", () => {
                console.log("[io] Connected");
                set_isConnected(true);
            });

            socket.on("connect_error", (err) => {
                console.error("[io] Connection error:", err);
                set_isConnected(false);
            });

            return () => {
                socket.off("connect");
                socket.off("connect_error");
                socket.off("receive_message");
                socket.disconnect();
                set_isConnected(false);
            };
        }
    }, [socket]);

    useEffect(() => {
        if (socket && isConnected) {
            socket.on("is_typing", (data) => {
                console.log("is_typing:", data.from, activePeer?.publicId);
                if (data.from === activePeer?.publicId) {
                    set_isPeerTyping(true);
                    if (inTypingTimerRef.current) clearTimeout(inTypingTimerRef.current);
                    inTypingTimerRef.current = setTimeout(() => set_isPeerTyping(false), 5000);
                }
            });

            socket.on("receive_message", (data) => {
                console.log("[io] receive_messa");
                if (data.from === activePeer?.publicId) {
                    set_isPeerTyping(false);
                    set_messages((prevState) => [...prevState, data]);
                } else if (data.from === user?.publicId) {
                    set_messages((prevState) => [...prevState, data]);
                } else {
                    addNotification({ from: data.from });
                }
            });

            return () => {
                socket.off("is_typing");
                socket.off("receive_message");
            };
        }
    }, [socket, isConnected, user, activePeer, notifications]);

    return (
        <>
            <div className="h-screen md:container md:flex md:flex-col md:justify-center">
                <div className="flex flex-col md:h-[90%] h-full md:shadow-lg md:rounded-lg md:overflow-hidden">
                    <Header />
                    <Messages
                        messages={messages}
                        isPeerTyping={isPeerTyping}
                        setMessages={set_messages}
                    />
                    <MessageInput />
                </div>
            </div>
        </>
    );
};
