export type ApiResult<T> = {
    success: boolean;
    message?: string;
    data?: T
}

export type User = {
    id: number;
    address: string;
    created_at: string;
    last_connected_at: string;
}

export type ProcessedUser = User & {
    area_id: number;
}

export type ContextUser = {
    user: ProcessedUser;
    getData: () => void;
    signature?: string;
}

export type LightMode = "progress" | "timer" | "alternate" | "off";

declare global {
    interface Window {
        backpack: any;
        phantom: any;
        solflare: any;
    }
}