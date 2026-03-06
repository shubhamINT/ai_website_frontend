import { v4 as uuidv4 } from "uuid";

import type { UserInfo } from "@/app/hooks/agentTypes";
import { USER_INFO_KEY } from "@/app/hooks/topics";

const createEmptyUserInfo = (): UserInfo => ({
    user_name: "",
    user_email: "",
    user_phone: "",
    user_id: uuidv4(),
});

const canUseStorage = () => typeof window !== "undefined";

export function readStoredUserInfo(): UserInfo | null {
    if (!canUseStorage()) {
        return null;
    }

    const rawValue = window.localStorage.getItem(USER_INFO_KEY);

    if (!rawValue) {
        return null;
    }

    try {
        const parsed = JSON.parse(rawValue) as Partial<UserInfo>;

        return {
            user_name: parsed.user_name ?? "",
            user_email: parsed.user_email ?? "",
            user_phone: parsed.user_phone ?? "",
            user_id: parsed.user_id ?? uuidv4(),
        };
    } catch (error) {
        console.error("Failed to parse stored user info", error);
        return null;
    }
}

export function ensureStoredUserInfo(): UserInfo {
    const existingUser = readStoredUserInfo();

    if (existingUser) {
        if (canUseStorage()) {
            window.localStorage.setItem(USER_INFO_KEY, JSON.stringify(existingUser));
        }

        return existingUser;
    }

    const nextUser = createEmptyUserInfo();

    if (canUseStorage()) {
        window.localStorage.setItem(USER_INFO_KEY, JSON.stringify(nextUser));
    }

    return nextUser;
}

export function mergeStoredUserInfo(patch: Partial<UserInfo>): UserInfo {
    const mergedUser = {
        ...ensureStoredUserInfo(),
        ...patch,
    };

    if (canUseStorage()) {
        window.localStorage.setItem(USER_INFO_KEY, JSON.stringify(mergedUser));
    }

    return mergedUser;
}
