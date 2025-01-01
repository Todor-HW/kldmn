import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import Cookies from "js-cookie";

import { User } from "../../../types/chatTypes";
import { useChatStore } from "../../../stores/chatStore";
import { useErrorStore } from "../../../stores/errorStore";
import { usePeers } from "../../../hooks/usePeers";
import { Loading } from "../../../components";

import { IconMenu } from "../../../icons";

export const Peers = () => {
    const [notifsCount, set_notifsCount] = useState<number>(0);

    const {
        //ln
        user,
        activePeer,
        notifications,
        setActivePeer,
        setNotifications,
        removeNotification,
    } = useChatStore();
    const { setErrorMessage } = useErrorStore();
    const { peers, error, isLoading } = usePeers();

    const drawerCheckboxElRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (error) setErrorMessage(error.message);
    }, [error]);

    useEffect(() => {
        const storedNotifications = Cookies.get("notifications");
        const parsedNotifications = storedNotifications && JSON.parse(storedNotifications);
        if (typeof parsedNotifications === "object") setNotifications(parsedNotifications);
    }, []);

    useEffect(() => {
        const storedPeerId = Cookies.get("peerId");
        if (storedPeerId) {
            const foundPeer = peers.find((p) => p.publicId === storedPeerId);
            if (foundPeer) setActivePeer(foundPeer);
        }
    }, [peers]);

    useEffect(() => {
        const values = Object.values(notifications);
        const total = Array.from(values).reduce((sum, value) => sum + value, 0);
        set_notifsCount(total);
    }, [notifications]);

    const onSelectUser = (peer: User) => {
        setActivePeer(peer);
        Cookies.set("peerId", peer.publicId);
        removeNotification({ from: peer.publicId });
        drawerCheckboxElRef.current?.click();
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
                        {isLoading ? (
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
