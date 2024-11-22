import * as account from "./Account";
import { ProviderProps, UserState } from "./types";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useCookies } from 'react-cookie';
import { ProcessedUser, User } from "../../types";
import { PublicKey } from "@solana/web3.js";
import { getAddressSOLBalance, getAddressTokenBalance, getWsUrl } from "../common/utils";
import { io, Socket } from "socket.io-client";

const DEFAULT_USER = {
    id: 0,
    address: "",
    // name: "",
    // profile_picture: "",
    area_id: 1,
} as ProcessedUser;

// react's version
const UserStateContext = createContext<UserState>({
    user: DEFAULT_USER,
    signature: "",
    isWhitelisted: false,
    isVerifying: false,
    init: undefined,
    balance: 0,
});

const useUserState = () => {
    return useContext(UserStateContext);
}

const UserStateProvider = ({
    children,
    auth
}: ProviderProps) => {
    const [user, setUser] = useState<ProcessedUser>(DEFAULT_USER);
    const [cookies, setCookie, /* removeCookie */] = useCookies([ 'signatures' ]);
    const [isVerifying, setIsVerifying] = useState(true);
    const [balance, setBalance] = useState(0);
    const hasInit = useRef(false);
    
    const isWhitelisted = useMemo(() => {
        return true;
    }, []);

    const signature = useMemo(() => {
        if(auth.signature) {
            return auth.signature;
        }

        if(!cookies || !cookies.signatures) {
            return "";
        }

        if(!auth.address) {
            return "";
        }

        return cookies.signatures[auth.address] as string ?? "";
    }, [cookies, auth]);

	const getBalance = useCallback(async(token?: string) => {
        console.log(`getting ${token} balance`);
		if(!user.address || !PublicKey.isOnCurve(user.address)) {
			return;
		}

        if(!token || token === "SOL") {
            let balance = await getAddressSOLBalance(new PublicKey(user.address));
            balance = balance > 0? (balance - 0.001) : 0; // add buffer to balance
            setBalance(balance);
            return;
        }

		let balance = await getAddressTokenBalance(token, user.address);
		setBalance(balance);
	}, [user.address]);

    // clear account
    const clear = useCallback(() => {
        setUser(DEFAULT_USER);
        setBalance(0);
    }, []);

    // account functions
    // uses customSignature to verify address if specified
    const me = useCallback(async(customSignature?: string) => {
        console.log('getting me')
        let sigToVerify = customSignature ?? signature;
        if(!auth.address || !auth.message || !sigToVerify) {
            setIsVerifying(false);
            return;
        }

        let { address, message } = auth;
        try {
            let res = await account.me({ address, message, signature: sigToVerify });
            if(!res) {
                setIsVerifying(false);
                return;
            }

            if(typeof res === "string") {
                setIsVerifying(false);
                return;
            }

            let user = res.data.data;
            let signatures = cookies['signatures'];

            setCookie("signatures", { ...signatures, [auth.address]: sigToVerify }, { path: '/' });
            setUser(user ?? DEFAULT_USER);
            setIsVerifying(false);
            return user;
        }

        catch {
            // unable to get me
            setIsVerifying(false);
            return;
        }
    }, [ auth, signature, cookies, setCookie ]);


    // create the account
    const createAccount = useCallback(async(name: string, customSignature?: string) => {
        let sigToVerify = customSignature ?? signature;
        if(!auth.address || !auth.message || !sigToVerify) {
            return;
        }

        let { address, message } = auth;
        let userRes = await account.create({address, message, signature: sigToVerify, name});
        if(!userRes || typeof userRes === 'string') {
            return;
        }

        let user = userRes.data.data;
        let signatures = cookies['signatures'];
        setCookie("signatures", { ...signatures, [auth.address]: sigToVerify }, { path: '/' });
        setUser(user ?? DEFAULT_USER);
        return user;
    }, [ auth, signature, cookies, setCookie ]);

    // initialize
    const init = useCallback(async(customSignature?: string) => {
        if(!auth.address) {
            setIsVerifying(false);
            return;
        }

        let sigToVerify = customSignature ?? signature;
        if(!sigToVerify) {
            return;
        }

        setIsVerifying(true);

        let res = await me(customSignature);

        if(!res) {
            res = await createAccount(auth.address, customSignature);
        }

        setIsVerifying(false);
        setUser(res ?? DEFAULT_USER);
        return res;
    }, [ auth, createAccount, signature, me ]);

    useEffect(() => {
        if(hasInit.current) {
            return;
        }

        if(!init) {
            return;
        }
        init();
        hasInit.current = true;
    }, [init]);

    return (
        <UserStateContext.Provider
            value={{
                user,
                signature,
                isWhitelisted,
                isVerifying,
                balance,

                init,
                clear,
                me,
                getBalance,
            }}
        >
            {children}
        </UserStateContext.Provider>
    )
}

export { useUserState, UserStateProvider }