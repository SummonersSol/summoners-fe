'use client';
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getWsUrl } from "@/common/utils";
import { useUserState } from "@/providers/userStateProvider";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { Nanum_Brush_Script } from "next/font/google";
import { useUnifiedWalletContext } from "@jup-ag/wallet-adapter";
const nanum = Nanum_Brush_Script({ subsets: ['latin'], weight: '400' });


const Page = () => {
    const { user, isVerifying } = useUserState();
    const router = useRouter();
    const [showButton, setShowButton] = useState(true);
    const { setShowModal } = useUnifiedWalletContext();

    const enterRealm = useCallback(() => {
        if(isVerifying) {
            return;
        }

        setShowModal(true);
    }, [isVerifying, setShowModal]);

    useEffect(() => {
        if(!user || !user.address) {
            return;
        }

        setShowButton(false);
        setTimeout(() => {
            router.push('/home');
        }, 500);
    }, [user, router]);

    return (
        <div className="h-full w-full flex items-center justify-center">
            <div className={`
                absolute inset-0
                overflow-hidden
            `}>
                <Image 
                    src={'/assets/bg/transition_bg.jpg'} 
                    alt="intermediate_bg"
                    height={788}
                    width={1440}
                    className={`
                        absolute
                        top-0 left-0
                        h-full w-full
                        object-cover
                        ${!showButton? `scale-[5] opacity-[0]`: 'opacity-[1]'}
                    `}
                    style={{
                        transition: 'opacity 1.5s, transform 1.5s'
                    }}
                />
                {
                    showButton &&
                    <div className={`
                            relative w-[100vw] h-[100vh] overflow-hidden    
                        `}
                    >
                        <div className="foglayer_01 fog">
                            <div className="image01"></div>
                            <div className="image02"></div>
                        </div>
                        <div className="foglayer_02 fog">
                            <div className="image01"></div>
                            <div className="image02"></div>
                            </div>
                        <div className="foglayer_03 fog">
                            <div className="image01"></div>
                            <div className="image02"></div>
                        </div>
                    </div>
                }
            </div>
            {
                showButton &&
                <button 
                    onClick={enterRealm}
                    className={`
                        absolute
                        top-[calc(50%-165px)]
                        left-[calc(50%-150px)]
                        h-[300px] aspect-square

                        rounded-full bg-transparent border-none
                        flex flex-col items-center justify-center

                        uppsercase tracking-[1px] font-[500]
                        text-[50px] animate-heartbeat

                        ${nanum.className}
                    `}    
                >
                    <span>{isVerifying? 'Loading..' : 'Enter'}</span>
                </button>
            }
        </div>
    )
}

export default Page;