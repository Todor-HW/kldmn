import { RefObject, useEffect } from "react";

export const useScrollIntoView = (ref: RefObject<HTMLDivElement>, condition: any) => {
    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: "smooth" });
    }, [condition]);

    return null;
};
