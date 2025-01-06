import { useEffect } from "react";
import useSWR from "swr";

import { useChatStore } from "../stores/chatStore";
import { fetchNotifications } from "../services";

export const useStoredNotifications = () => {
    const { user, activePeer, notifications, setNotifications } = useChatStore();

    const { data, error, isLoading } = useSWR(
        user?.publicId && activePeer?.publicId ? `/chat/notifications/${user?.publicId}` : null,
        () => {
            return user?.publicId && activePeer?.publicId
                ? fetchNotifications(user?.publicId, activePeer?.publicId)
                : null;
        },
        {
            dedupingInterval: 1000,
        }
    );

    useEffect(() => {
        if (data) {
            setNotifications(data);
        }
    }, [data]);

    return {
        notifications,
        notificationsError: error,
        isNotificationsLoading: isLoading,
    };
};
