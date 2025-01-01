import { RefObject, useEffect, useRef } from "react";

import { Message } from "../types/chatTypes";

export const useScrollToLastMessage = (listElRef: RefObject<HTMLElement>, messages: Message[]) => {
    const isInitScroll = useRef<boolean>(true);

    useEffect(() => {
        if (listElRef.current && messages.length > 0) {
            const listEl = listElRef.current;
            const { offsetHeight, scrollHeight, scrollTop } = listEl;

            if (isInitScroll.current || scrollHeight <= scrollTop + offsetHeight + 150) {
                isInitScroll.current = false;
                listEl.scrollTo(0, scrollHeight);
            }
        }
    }, [messages]);

    return null;
};
