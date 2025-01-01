import { useEffect, useState } from "react";
import useSWR from "swr";

import { User } from "../types/chatTypes";
import { useChatStore } from "../stores/chatStore";
import { fetchUsers } from "../services";

export const usePeers = () => {
    const [peers, set_peers] = useState<User[]>([]);

    const { user, setActivePeer } = useChatStore();

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

    return { peers, error, isLoading };
};
