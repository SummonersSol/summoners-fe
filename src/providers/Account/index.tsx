import { ApiResult, AuthCallParams } from "../types";
import axios from '../../services/axios';
import _ from 'lodash';
import { UserCreateParams, UserUpdateParams } from "./types";
import { ProcessedUser, User } from "../../../types";

// register account
export const create = async(params: UserCreateParams) => {
    try {
        return await axios.post<ApiResult<ProcessedUser>>('/user', params);
    }

    catch(e: any) {
        console.log(e);
        return e.response.data as string;
    }
}

// get own profile
export const me = async(params: AuthCallParams) => {
    try {
        return await axios.post<ApiResult<ProcessedUser>>('/user/me', params);
    }

    catch(e: any) {
        return e.response.data as string;
    }
}

// update personal details
export const update = async(id: number, params: UserUpdateParams) => {
    try {

        let omitted = _(params).omit("id").value();
        let formData = new FormData();
        for(let [key, value] of Object.entries(omitted)) {

            // omit address
            if(value === null) {
                continue;
            }

            if(value === undefined) {
                continue;
            }

            if(typeof (value as any) === "number") {
                value = value.toString();
            }

            formData.append(key, value as string | Blob);
        }
        
        return await axios<ApiResult<undefined>>({
            url: `/user/update/${id}`,
            method: 'POST',
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            }
        });
    }

    catch(e: any) {
        return e.response.data as string;
    }
}