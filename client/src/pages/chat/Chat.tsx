import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Cookies from "js-cookie";

import { Message } from "../../types/chatTypes";
import { fetchUser } from "../../services";
import { usePreventAppScroll } from "../../hooks";
import { useChatStore } from "../../stores/chatStore";
import { Messages, Peers } from "./components";

import { MessageInput } from "./components/MessageInput";

const SOCKET_BASE_URL =
    import.meta.env.MODE === "production" ? "https://api.kldmn.xyz" : "http://localhost:8080";

export const Chat = () => {
    const [isConnected, set_isConnected] = useState<boolean>(false);
    const [messages, set_messages] = useState<Message[]>([]);
    const [isPeerTyping, set_isPeerTyping] = useState<boolean>(false);

    const { socket, user, activePeer, notifications, setSocket, setUser, setNotifications } =
        useChatStore();

    const inTypingTimerRef = useRef<number | null>(null);

    usePreventAppScroll();

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
                if (data.from === activePeer?.publicId) {
                    set_isPeerTyping(false);
                    set_messages((prevState) => [...prevState, data]);
                } else if (data.from === user?.publicId) {
                    set_messages((prevState) => [...prevState, data]);
                } else {
                    setNotifications({ from: data.from });
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
            <div className="container h-full lg:max-w-[50vw]">
                <h2 className="text-xl text-center shadow-sm bg-base-100 py-5">
                    You are logged in as: <span className="font-bold">{user?.username}</span>
                </h2>
                <div className="h-full border-2 border-primary bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12">
                        <div className="col-span-4 border-e-2 border-primary">
                            <Peers />
                        </div>
                        <div className="col-span-8">
                            <h2 className="text-center font-bold shadow-sm bg-base-100 py-5">
                                {activePeer?.username}
                            </h2>
                            <div className="relative">
                                <Messages messages={messages} setMessages={set_messages} />
                                {isPeerTyping && (
                                    <>
                                        <span className="indicator-item badge badge-secondary absolute bottom-2 left-5 p-3">
                                            <span className="loading loading-dots loading-sm" />
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="grid-cols w-full bg-primary p-5 grid grid-cols-12 gap-5">
                                <MessageInput />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
