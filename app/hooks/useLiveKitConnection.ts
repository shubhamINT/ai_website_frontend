import { useState, useCallback } from "react";

import { ensureStoredUserInfo } from "@/app/hooks/_lib/storage/userInfo.storage";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
const TOKEN_ENDPOINT = `${BACKEND_URL}/api/getToken`;

export function useLiveKitConnection() {
    const [token, setToken] = useState<string>("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const connect = useCallback(async (agentName: string = "indusnet") => {
        setIsConnecting(true);
        setError(null);

        try {
            const userInfo = ensureStoredUserInfo();
            const url = `${TOKEN_ENDPOINT}?name=${userInfo.user_name}&user_id=${userInfo.user_id}&agent=${agentName}&email=${userInfo.user_email}&phone=${userInfo.user_phone}`;

            const response = await fetch(url, { mode: "cors" });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }

            const accessToken = await response.text();

            if (!accessToken || accessToken.trim().length === 0) {
                throw new Error("Received empty token from backend");
            }

            setToken(accessToken);
        } catch (error) {
            console.error("Connection failed:", error);
            setError(error as Error);
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        setToken("");
        setError(null);
    }, []);

    return {
        token,
        isConnecting,
        error,
        connect,
        disconnect,
    };
}
