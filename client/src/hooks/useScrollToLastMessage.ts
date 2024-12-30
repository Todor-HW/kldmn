import { RefObject, useEffect } from "react";

import { Message } from "../types/chatTypes";

const USE_OFFSET = true;

export const useScrollToLastMessage = (ref: RefObject<HTMLElement>, messages: Message[]) => {
    const scrollToLastMessage = () => {
        if (ref.current) {
            const { scrollHeight } = ref.current;
            ref.current?.scrollTo(0, scrollHeight);
        }
    };

    useEffect(() => {
        if (ref.current) {
            const { offsetHeight, scrollHeight, scrollTop } = ref.current;
            if (!USE_OFFSET || scrollHeight <= scrollTop + offsetHeight + 150) {
                scrollToLastMessage();
            }
        }
    }, [ref.current, messages]);

    return { scrollToLastMessage };
};
