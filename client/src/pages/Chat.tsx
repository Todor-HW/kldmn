import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { IconSend } from "../icons";

const SOCKET_BASE_URL =
    import.meta.env.MODE === "production" ? "https://api.kldmn.xyz" : "http://localhost:8080";

const socket = io(SOCKET_BASE_URL);

interface Message {
    sid: string;
    msg: string;
}

const initMessages: Message[] = [
    // { sid: "1", msg: "Hello!" },
    // { sid: "1", msg: "How are you?" },
    // { sid: "2", msg: "Hey, I'm fine. And you?" },
];

export const Chat = () => {
    const [socketId, set_socketId] = useState<string | null>(null);
    const [messages, set_messages] = useState<Message[]>([...initMessages]);
    const [inputValue, set_inputValue] = useState<string>("");

    const listBottomElRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        listBottomElRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        socket.on("connect", () => {
            socket.id && set_socketId(socket.id);
        });

        socket.on("receive_message", (data) => {
            set_messages((prevState) => [...prevState, data]);
        });

        return () => {
            socket.off("connect");
            socket.off("receive_message");
        };
    }, []);

    const sendMessageHandler = () => {
        if (inputValue.trim().length > 0) {
            const data = { msg: inputValue };
            socket.emit("send_message", data);
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
                                            m.sid === socketId ? "chat-end" : "chat-start",
                                        ].join(" ")}
                                    >
                                        <div className="chat-header">
                                            {/* Obi-Wan Kenobi */}
                                            <time className="text-xs opacity-50">12:15</time>
                                        </div>
                                        <div className="chat-bubble">{m.msg}</div>
                                        {/* <div className="chat-footer opacity-50">Seen</div> */}
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
