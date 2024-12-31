import useSWR from "swr";
import { User } from "../../../types/chatTypes";
import { fetchUsers } from "../../../services";
import { ErrorMessage } from "../../../components/errorMessage/ErrorMessage";
import { useEffect, useState } from "react";
import { useChatStore } from "../../../stores/chatStore";

export const Peers = () => {
    const [peers, set_peers] = useState<User[]>([]);

    const { user, activePeer, notifications, setActivePeer, clearNotifications } = useChatStore();

    const { data, error, isLoading } = useSWR(
        user?.publicId ? `/chat/users?publicId=${user?.publicId}` : null,
        fetchUsers,
        {
            dedupingInterval: 5000,
        }
    );

    useEffect(() => {
        if (data) {
            set_peers(data);
            setActivePeer(data[0]);
        }
    }, [data]);

    const onSelectUser = (peer: User) => {
        setActivePeer(peer);
        clearNotifications({ from: peer.publicId });
    };

    return (
        <>
            {error && <ErrorMessage message={error?.message} />}

            <ul className="w-full p-0">
                {isLoading ? (
                    <>
                        <div className="h-full flex items-center justify-center">
                            <span className="loading loading-ring loading-lg" />
                        </div>
                    </>
                ) : (
                    <>
                        {peers?.map((p, i) => {
                            if (p.publicId === user?.publicId) return; // This is the current (logged-in) user

                            const isActive = p.publicId === activePeer?.publicId;
                            const notifCount = notifications.get(p.publicId) || 0;

                            return (
                                <li
                                    key={i}
                                    className={[
                                        "px-5 py-3 cursor-pointer",
                                        isActive ? "bg-primary" : "hover:bg-base-100",
                                    ].join(" ")}
                                    onClick={() => onSelectUser(p)}
                                >
                                    <div className="indicator w-full">
                                        <span>{p.username}</span>
                                        {notifCount > 0 && (
                                            <>
                                                <span className="indicator-item indicator-middle indicator-end badge badge-secondary">
                                                    {notifications.get(p.publicId)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </>
                )}
            </ul>
        </>
    );
};
