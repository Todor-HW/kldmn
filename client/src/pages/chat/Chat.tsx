import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import { Message } from "../../types/chatTypes";
import { createUser, fetchUser } from "../../services";
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

    const { socket, user, activePeer, setSocket, setUser, addNotification } = useChatStore();
    const { setErrorMessage } = useErrorStore();

    const isMountedRef = useRef<boolean>(false);
    const inTypingTimerRef = useRef<number | null>(null);

    usePreventAppScroll();

    useEffect(() => {
        if (!isMountedRef.current) {
            isMountedRef.current = true;
            (async () => {
                let timeoutId: number;
                try {
                    const publicId = localStorage.getItem("publicId");
                    let fetchedUser = publicId ? await fetchUser(publicId) : await createUser();
                    if (fetchedUser) {
                        localStorage.setItem("publicId", fetchedUser.publicId);
                        setUser(fetchedUser);
                    } else {
                        throw new Error("Could not fetch or create user");
                    }
                } catch (err) {
                    console.error("Error:", err);
                    setErrorMessage(`${(err as Error).message}\nReloading in 3 seconds`);
                    timeoutId = setTimeout(() => {
                        localStorage.clear();
                        window.location.reload();
                    }, 3000);
                }
                return () => clearTimeout(timeoutId);
            })();
        }
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
                console.log("[io] receive_message");
                if (data.from === activePeer?.publicId) {
                    set_isPeerTyping(false);
                    set_messages((prevState) => [...prevState, data]);
                } else if (data.from === user?.publicId) {
                    set_messages((prevState) => [...prevState, data]);
                } else {
                    addNotification(data.from);
                }
            });

            return () => {
                socket.off("is_typing");
                socket.off("receive_message");
            };
        }
    }, [socket, isConnected, user, activePeer]);

    return (
        <>
            <div className="h-screen md:container md:flex md:flex-col md:justify-center">
                <div className="flex flex-col md:h-[90%] h-svh md:shadow-lg md:rounded-lg md:overflow-hidden">
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
