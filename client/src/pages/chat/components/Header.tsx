import { useChatStore } from "../../../stores/chatStore";
import { Peers } from "./Peers";

export const Header = () => {
    const { user, activePeer } = useChatStore();

    return (
        <>
            <header className="relative">
                <div className="navbar bg-base-200 shadow-lg">
                    <div className="navbar-start">
                        <Peers />
                    </div>
                    <div className="navbar-center">
                        <h2 className="text-center text-sm md:text-base">
                            You are <span className="font-bold">{user?.username}</span>
                        </h2>
                    </div>
                    <div className="navbar-end"></div>
                </div>
                {/* <div className="absolute z-[999] top-[calc(100%+10px)] w-full flex justify-center">
                    <span className="rounded-full bg-accent text-sm md:text-base px-5 py-1">
                        {activePeer?.username}
                    </span>
                </div> */}
                <h2 className="bg-accent text-center text-sm md:text-md py-3">
                    Chatting with <span className="font-bold">{activePeer?.username}</span>
                </h2>
            </header>
        </>
    );
};
