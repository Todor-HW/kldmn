import { useEffect, useRef } from "react";
import moment from "moment";
import useSWR from "swr";

import { Message } from "../../../types/chatTypes";
import { fetchMessages } from "../../../services";
import { useScrollToLastMessage } from "../../../hooks";
import { useChatStore } from "../../../stores/chatStore";
import { ErrorMessage } from "../../../components/errorMessage/ErrorMessage";
import { PeerTyping } from "./PeerTyping";

const USE_OFFSET = true;

interface MessagesProps {
    messages: Message[];
    isPeerTyping: boolean;
    setMessages: (value: Message[]) => void;
}

export const Messages = (props: MessagesProps) => {
    const { messages, isPeerTyping, setMessages } = props;

    const { user, activePeer } = useChatStore();

    const listElRef = useRef<HTMLDivElement>(null);

    useScrollToLastMessage(listElRef, messages);

    const { data, error, isLoading } = useSWR(
        user && activePeer ? `/chat/messages/${user?.publicId}?to=${activePeer?.publicId}` : null,
        fetchMessages,
        {
            dedupingInterval: 5000,
        }
    );

    useEffect(() => {
        if (data) setMessages(data);
    }, [data]);

    return (
        <>
            {error && <ErrorMessage message={error?.message} />}

            <div ref={listElRef} className="flex-1 overflow-y-auto bg-white p-3">
                <div className="space-y-4">
                    {isLoading ? (
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
                                            m.from === user?.publicId ? "chat-end" : "chat-start",
                                        ].join(" ")}
                                    >
                                        <div className="chat-header">
                                            {activePeer?.username}{" "}
                                            <time className="text-xs opacity-50">
                                                {moment(m.timestamp).format("HH:mm")}
                                            </time>
                                        </div>
                                        <div className="chat-bubble max-w-[50%]">{m.message}</div>
                                        {/* <div className="chat-footer opacity-50">Seen</div> */}
                                    </li>
                                );
                            })}
                        </>
                    )}
                    {isPeerTyping && <PeerTyping />}
                </div>
            </div>
        </>
    );
};
