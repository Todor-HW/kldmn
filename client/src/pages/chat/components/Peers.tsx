import { useEffect, useRef, useState } from "react";
import classNames from "classnames";

import { fetchPeer } from "../../../services";
import { useChatStore } from "../../../stores/chatStore";
import { useErrorStore } from "../../../stores/errorStore";
import { usePeers } from "../../../hooks/usePeers";
import { Loading } from "../../../components";

import { IconMenu } from "../../../icons";
import { useStoredNotifications } from "../../../hooks/useStoredNotifications";

export const Peers = () => {
    const [notifsCount, set_notifsCount] = useState<number>(0);

    const { user, activePeer, notifications, setActivePeer, removeNotification } = useChatStore();
    const { peers, peersError, isPeersLoading } = usePeers();
    const { notificationsError } = useStoredNotifications();
    const { setErrorMessage } = useErrorStore();

    const drawerCheckboxElRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (peersError) setErrorMessage(peersError.message);
    }, [peersError]);

    useEffect(() => {
        if (notificationsError) setErrorMessage(notificationsError.message);
    }, [notificationsError]);

    // Stored Peer ID
    useEffect(() => {
        const storedPeerId = localStorage.getItem("peerId");
        if (storedPeerId) onSelectPeer(storedPeerId);
    }, [user]);

    // Total notifications count
    useEffect(() => {
        const values = Object.values(notifications);
        const total = Array.from(values).reduce((sum, value) => sum + value, 0);
        set_notifsCount(total);
    }, [notifications]);

    const onSelectPeer = async (peerId: string) => {
        if (user) {
            const fetched = await fetchPeer(user.publicId, peerId);
            setActivePeer(fetched);
            localStorage.setItem("peerId", peerId);
            removeNotification({ from: peerId });
        }
    };

    return (
        <>
            {/* {error && <ErrorMessage message={error?.message} />} */}

            <div className="drawer">
                <input
                    ref={drawerCheckboxElRef}
                    id="peers-drawer"
                    type="checkbox"
                    className="drawer-toggle"
                />
                <div className="drawer-content">
                    <label
                        htmlFor="peers-drawer"
                        className="btn btn-ghost btn-circle drawer-button"
                    >
                        <div className="indicator">
                            {notifsCount > 0 && (
                                <span className="indicator-item badge badge-secondary font-normal">
                                    +{notifsCount}
                                </span>
                            )}
                            <IconMenu />
                        </div>
                    </label>
                </div>
                <div className="drawer-side z-[999]">
                    <label
                        htmlFor="peers-drawer"
                        aria-label="close sidebar"
                        className="drawer-overlay"
                    ></label>
                    <ul className="menu bg-base-200 text-base-content min-h-full w-72 md:w-80 space-y-1 p-3">
                        <li className="menu-title">Available peers</li>
                        {isPeersLoading ? (
                            <Loading />
                        ) : (
                            peers?.map((p, i) => {
                                if (p.publicId === user?.publicId) return; // This is the current (logged-in) user

                                const isActive = p.publicId === activePeer?.publicId;
                                const notifCount = notifications[p.publicId] || 0;

                                return (
                                    <li
                                        key={i}
                                        className={classNames(isActive && "active")}
                                        onClick={() => {
                                            onSelectPeer(p.publicId);
                                            drawerCheckboxElRef.current?.click();
                                        }}
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
                                                        {notifications[p.publicId]}
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
