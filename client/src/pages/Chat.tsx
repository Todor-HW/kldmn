import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import moment from "moment";

import { User } from "../types/chatTypes";
import { fetchMessages, fetchUser } from "../services";
import { useScrollIntoView, usePreventAppScroll } from "../hooks";

import { IconSend } from "../icons";

const SOCKET_BASE_URL =
    import.meta.env.MODE === "production" ? "https://api.kldmn.xyz" : "http://localhost:8080";

interface ISocket extends Socket {
    name?: string;
}

interface Message {
    userId: string;
    message: string;
    username: string;
    timestamp: number;
}

export const Chat = () => {
    const [user, set_user] = useState<User | null>(null);
    const [messages, set_messages] = useState<Message[]>([]);
    const [inputValue, set_inputValue] = useState<string>("");

    const socketRef = useRef<ISocket | null>(null);
    const listBottomElRef = useRef<HTMLDivElement>(null);

    usePreventAppScroll();
    useScrollIntoView(listBottomElRef, messages);

    useEffect(() => {
        const fetchData = async () => {
            const userId = Cookies.get("userId");
            const user = await fetchUser(userId);
            Cookies.set("userId", user.userId);
            set_user(user);

            const messages = await fetchMessages();
            set_messages(messages.messages);
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (user) {
            const socket = io(SOCKET_BASE_URL);
            socketRef.current = socket;

            return () => {
                socket.disconnect();
            };
        }
    }, [user]);

    useEffect(() => {
        const socket = socketRef.current;
        if (socket) {
            socket.on("connect", () => console.log("[io] Connect:", socket.id));
            socket.on("receive_message", (data) => {
                set_messages((prevState) => [...prevState, data]);
            });

            return () => {
                socket.off("connect");
                socket.off("receive_message");
                socket.disconnect();
            };
        }
    }, [socketRef.current]);

    const sendMessageHandler = () => {
        if (inputValue.trim().length > 0 && socketRef.current?.connected) {
            socketRef.current?.emit("send_message", { userId: user?.userId, message: inputValue });
            set_inputValue("");
        }
    };

    return (
        <>
            <div className="container h-full lg:max-w-[50vw]">
                <div className="h-full border-2 border-primary bg-white shadow-lg rounded-xl">
                    <div className="overflow-hidden p-5">
                        <h1 className="text-2xl font-bold text-center mb-7">Chat</h1>

                        <ul className="h-[50vh] flex flex-col gap-3 overflow-auto mb-5">
                            {messages?.map((m, i) => {
                                return (
                                    <li
                                        key={i}
                                        className={[
                                            "chat",
                                            m.userId === user?.userId ? "chat-end" : "chat-start",
                                        ].join(" ")}
                                    >
                                        <div className="chat-header">
                                            {m.username}{" "}
                                            <time className="text-xs opacity-50">
                                                {moment(m.timestamp).format("HH:mm")}
                                            </time>
                                        </div>
                                        <div className="chat-bubble">{m.message}</div>
                                        <div className="chat-footer opacity-50">Seen</div>
                                    </li>
                                );
                            })}
                            <div ref={listBottomElRef} />
                        </ul>
                    </div>

                    <div className="w-full bg-primary p-5 grid grid-cols-12 gap-5">
                        <input
                            type="text"
                            placeholder="..."
                            className="input col-span-8 md:col-span-10 w-full"
                            value={inputValue}
                            onChange={(e) => set_inputValue(e.currentTarget?.value || "")}
                            onKeyDown={(e) => e.key === "Enter" && sendMessageHandler()}
                        />
                        <button
                            className="col-span-4 md:col-span-2 bg-secondary rounded-full shadow-md flex items-center justify-center active:shadow-none disabled:text-gray-500"
                            onClick={sendMessageHandler}
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
