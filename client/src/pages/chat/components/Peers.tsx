import classNames from "classnames";

import { User } from "../../../types/chatTypes";
import { useChatStore } from "../../../stores/chatStore";
import { usePeers } from "../../../hooks/usePeers";
import { ErrorMessage } from "../../../components";
import { IconMenu } from "../../../icons";

const Loader = () => {
    return (
        <>
            <div className="h-full flex items-center justify-center">
                <span className="loading loading-ring loading-lg" />
            </div>
        </>
    );
};

export const Peers = () => {
    const { user, activePeer, notifications, setActivePeer, clearNotifications } = useChatStore();

    const { peers, error, isLoading } = usePeers();

    const onSelectUser = (peer: User) => {
        setActivePeer(peer);
        clearNotifications({ from: peer.publicId });
    };

    return (
        <>
            {error && <ErrorMessage message={error?.message} />}

            <div className="drawer z-[999]">
                <input id="peers-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                    <label
                        htmlFor="peers-drawer"
                        className="btn btn-ghost btn-circle drawer-button"
                    >
                        <IconMenu />
                    </label>
                </div>
                <div className="drawer-side">
                    <label
                        htmlFor="peers-drawer"
                        aria-label="close sidebar"
                        className="drawer-overlay"
                    ></label>
                    <ul className="menu bg-base-200 text-base-content min-h-full w-52 md:w-80 space-y-1 p-3">
                        <li className="menu-title">Available peers</li>
                        {isLoading ? (
                            <Loader />
                        ) : (
                            peers?.map((p, i) => {
                                if (p.publicId === user?.publicId) return; // This is the current (logged-in) user

                                const isActive = p.publicId === activePeer?.publicId;
                                const notifCount = notifications.get(p.publicId) || 0;

                                return (
                                    <li
                                        key={i}
                                        className={classNames(isActive && "active")}
                                        onClick={() => onSelectUser(p)}
                                    >
                                        <a
                                            className={classNames(
                                                "py-3 px-5",
                                                isActive && "active"
                                            )}
                                        >
                                            <span>{p.username}</span>
                                            {notifCount > 0 && (
                                                <>
                                                    <div className="badge badge-secondary">
                                                        {notifications.get(p.publicId)}
                                                    </div>
                                                </>
                                            )}
                                        </a>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            </div>
        </>
    );
};
