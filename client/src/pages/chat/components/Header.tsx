import { useChatStore } from "../../../stores/chatStore";

export const Header = () => {
    const { user, activePeer } = useChatStore();

    return (
        <>
            <header>
                <h2 className="text-md md:text-xl text-center shadow-lg bg-secondary py-3 md:py-5">
                    You are logged in as: <span className="font-bold">{user?.username}</span>
                </h2>
                <h2 className="text-center font-bold shadow-lg bg-base-200 py-3 md:py-5">
                    {activePeer?.username}
                </h2>
            </header>
        </>
    );
};
