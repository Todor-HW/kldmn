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
            <div className="bg-base-200 p-3 grid grid-cols-12 gap-3">
                <input
                    type="text"
                    placeholder="..."
                    className="input col-span-9 w-full bg-white shadow-inner"
                    value={inputValue}
                    onChange={onInputChange}
                    onKeyDown={onInputKeyDown}
                />
                <button
                    className="col-span-3 btn btn-primary rounded-full flex items-center justify-center"
                    onClick={onSendMessage}
                    disabled={inputValue.length <= 0}
                >
                    <IconSend />
                </button>
            </div>
        </>
    );
};
