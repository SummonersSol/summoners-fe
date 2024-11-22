import { ProcessedUser, User } from "../../types";

export type ApiResult<T> = {
    success: boolean;
    message?: string;
    data?: T
}

export interface AuthCallParams {
    address: string;
    signature: string;
    message: string;
}
export interface OptionalAuthCallParams {
    address?: string;
    message?: string;
    signature?: string;
}

export interface PublicCallParams {
    address: string;
}

export type UserState = {
    user: ProcessedUser;
    signature: string;
    isWhitelisted: boolean;
    isVerifying: boolean;
    init?: (customSignature?: string) => Promise<User | undefined>;
    clear?: () => void;
    me?: (customSignature?: string) => Promise<User | undefined>;
    getBalance?: (token?: string) => Promise<void>;
    balance: number;
}

export type ProviderProps = {
    children: ReactNode;
    auth: OptionalAuthCallParams;
}