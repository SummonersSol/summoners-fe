import { AuthCallParams } from "../types";

export interface UserCreateParams extends AuthCallParams {
    name: string;
}

export interface UserUpdateParams extends AuthCallParams {
    name?: string;
    profile_picture?: File;
}

export interface UserUpdateTagParams extends AuthCallParams {
    tags: string[];
    hash: string;
}