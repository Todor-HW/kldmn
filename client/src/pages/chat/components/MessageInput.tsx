import React, { useRef, useState } from "react";

import { useChatStore } from "../../../stores/chatStore";

import { IconSend } from "../../../icons";

export const MessageInput = () => {
    const [inputValue, set_inputValue] = useState<string>("");

    const { socket, activePeer } = useChatStore();

    const outTypingTimerRef = useRef<number | null>(null);

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        set_inputValue(e.currentTarget?.value || "");
    };

    const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSendMessage();
            return;
        }

        if (outTypingTimerRef.current === null) {
            socket?.volatile.emit("is_typing", {
                to: activePeer?.publicId,
            });
            outTypingTimerRef.current = setTimeout(() => (outTypingTimerRef.current = null), 3000);
        }
    };

    const onSendMessage = () => {
        if (inputValue.trim().length > 0 && socket?.connected) {
            socket?.emit("send_message", {
                to: activePeer?.publicId,
                message: inputValue,
            });
            set_inputValue("");
        }
    };

    return (
        <>
            <input
                type="text"
                placeholder="..."
                className="input col-span-8 md:col-span-10 w-full"
                value={inputValue}
                onChange={onInputChange}
                onKeyDown={onInputKeyDown}
            />
            <button
                className="col-span-4 md:col-span-2 bg-accent rounded-full shadow-md flex items-center justify-center active:shadow-none disabled:text-gray-500"
                onClick={onSendMessage}
                disabled={inputValue.length <= 0}
            >
                <IconSend />
            </button>
        </>
    );
};
