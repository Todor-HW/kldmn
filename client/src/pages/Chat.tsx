import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import useSWR from "swr";
import Cookies from "js-cookie";
import moment from "moment";

import { User } from "../types/chatTypes";
import { fetchMessages, fetchUser } from "../services";
import { useScrollToLastMessage, usePreventAppScroll } from "../hooks";

import { IconSend } from "../icons";
import { ErrorMessage } from "../components/errorMessage/ErrorMessage";

const SOCKET_BASE_URL =
    import.meta.env.MODE === "production" ? "https://api.kldmn.xyz" : "http://localhost:8080";

interface ISocket extends Socket {
    name?: string;
}

interface Message {
    publicId: string;
    message: string;
    username: string;
    timestamp: number;
}

export const Chat = () => {
    const [user, set_user] = useState<User | null>(null);
    const [messages, set_messages] = useState<Message[]>([]);
    const [inputValue, set_inputValue] = useState<string>("");
    const [isPeerTyping, set_isPeerTyping] = useState<boolean>(false);

    const socketRef = useRef<ISocket | null>(null);
    const listElRef = useRef<HTMLUListElement>(null);
    const outTypingTimerRef = useRef<number | null>(null);
    const inTypingTimerRef = useRef<number | null>(null);

    usePreventAppScroll();
    const { scrollToLastMessage } = useScrollToLastMessage(listElRef, messages);

    // Fetch and set user
    useEffect(() => {
        (async () => {
            try {
                const publicId = Cookies.get("publicId");
                const user = await fetchUser(publicId);
                Cookies.set("publicId", user.publicId);
                set_user(user);
            } catch (err) {
                console.error("Error:", err);
            }
        })();
    }, []);

    // Fetch messages
    const {
        data: messagesData,
        error: messagesError,
        isLoading: isMessagesLoading,
    } = useSWR(`/chat/users/${user?.publicId}`, fetchMessages, {
        dedupingInterval: 10 * 1000,
    });

    // Set messages
    useEffect(() => {
        if (messagesData) {
            set_messages(messagesData.messages);
            scrollToLastMessage();
        }
    }, [messagesData]);

    // Connect socket
    useEffect(() => {
        if (user) {
            const socket = io(SOCKET_BASE_URL);
            socketRef.current = socket;

            return () => {
                socket.disconnect();
            };
        }
    }, [user]);

    // Socket events
    useEffect(() => {
        const socket = socketRef.current;
        if (socket) {
            socket.on("connect", () => console.log("[io] Connect:", socket.id));

            socket.on("is_typing", () => {
                set_isPeerTyping(true);
                if (inTypingTimerRef.current) clearTimeout(inTypingTimerRef.current);
                inTypingTimerRef.current = setTimeout(() => set_isPeerTyping(false), 5000);
            });

            socket.on("receive_message", (data) => {
                set_isPeerTyping(false);
                set_messages((prevState) => [...prevState, data]);
            });

            return () => {
                socket.off("connect");
                socket.off("receive_message");
                socket.disconnect();
            };
        }
    }, [socketRef.current]);

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        set_inputValue(e.currentTarget?.value || "");
    };

    const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSendMessage();
            return;
        }

        if (outTypingTimerRef.current === null) {
            console.log("emit...");
            socketRef.current?.volatile.emit("is_typing", { publicId: user?.publicId });
            outTypingTimerRef.current = setTimeout(() => (outTypingTimerRef.current = null), 3000);
        }
    };

    const onSendMessage = () => {
        if (inputValue.trim().length > 0 && socketRef.current?.connected) {
            socketRef.current?.emit("send_message", {
                publicId: user?.publicId,
                message: inputValue,
            });
            set_inputValue("");
        }
    };

    return (
        <>
            <div className="container h-full lg:max-w-[50vw]">
                {messagesError && <ErrorMessage message={messagesError?.message} />}

                <div className="h-full border-2 border-primary bg-white shadow-lg rounded-xl">
                    <div className="relative p-5">
                        <h1 className="text-2xl font-bold text-center mb-5">Chat</h1>

                        <ul
                            ref={listElRef}
                            className="h-[50vh] flex flex-col gap-3 overflow-auto mb-5"
                        >
                            {isMessagesLoading ? (
                                <>
                                    <div className="h-full flex items-center justify-center">
                                        <span className="loading loading-ring loading-lg" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {messages?.map((m, i) => {
                                        return (
                                            <li
                                                key={i}
                                                className={[
                                                    "chat",
                                                    m.publicId === user?.publicId
                                                        ? "chat-end"
                                                        : "chat-start",
                                                ].join(" ")}
                                            >
                                                <div className="chat-header">
                                                    {m.username}{" "}
                                                    <time className="text-xs opacity-50">
                                                        {moment(m.timestamp).format("HH:mm")}
                                                    </time>
                                                </div>
                                                <div className="chat-bubble max-w-[50%]">
                                                    {m.message}
                                                </div>
                                                {/* <div className="chat-footer opacity-50">Seen</div> */}
                                            </li>
                                        );
                                    })}
                                </>
                            )}
                        </ul>
                        {isPeerTyping && (
                            <>
                                <span className="indicator-item badge badge-secondary absolute bottom-2 left-5 p-3">
                                    <span className="loading loading-dots loading-sm" />
                                </span>
                            </>
                        )}
                    </div>

                    <div className="w-full bg-primary p-5 grid grid-cols-12 gap-5">
                        <input
                            type="text"
                            placeholder="..."
                            className="input col-span-8 md:col-span-10 w-full"
                            value={inputValue}
                            onChange={onInputChange}
                            onKeyDown={onInputKeyDown}
                        />
                        <button
                            className="col-span-4 md:col-span-2 bg-secondary rounded-full shadow-md flex items-center justify-center active:shadow-none disabled:text-gray-500"
                            onClick={onSendMessage}
                            disabled={inputValue.length <= 0}
                        >
                            <IconSend />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
