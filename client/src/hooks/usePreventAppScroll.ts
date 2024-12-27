import { useEffect } from "react";

export const usePreventAppScroll = () => {
    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = original;
        };
    }, []);

    return null;
};
