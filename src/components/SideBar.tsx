'use client';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import { ellipsizeThis, objectsEqual, ucFirst } from '@/common/utils';
import { CloseOutlined, LogoutOutlined, MenuOutlined, SearchOutlined, SettingOutlined, WalletOutlined } from '@ant-design/icons';
import { useTheme } from '@/hooks/useTheme';
// import logo from '../../public/logo.png';
import { HomepageUser } from './types';
import { toast } from 'react-toastify';
import { VERIFY_MESSAGE } from '@/common/constants';
import { Blocks } from 'react-loader-spinner';
import { /* UnifiedWalletButton,  */useWallet } from '@jup-ag/wallet-adapter';
import { UnifiedWalletButton } from './UnifiedWalletButton';
import { VerifiedBadge } from './VerifiedBadge';
import { useUserState } from '@/providers/userStateProvider';

type LinkParams = {
    link: string;
    text: string;
    active?: boolean;
    notification?: boolean;
    image_url?: string;
    is_verified?: boolean;
    holiday_mode: boolean;
  }
  
const SideBarItem = ({ link, text, active, notification, image_url, is_verified, holiday_mode }: LinkParams) => {
    return (
      <Link href={link}>
        <div className={`
          w-100 
          p-2 rounded
          ${active? `dark:text-black dark:bg-gray-700 bg-gray-300`: `dark:text-slate-400 text-slate-600`}
          dark:hover:bg-gray-800 hover:bg-gray-200
          dark:hover:text-slate-300 hover:text-slate-900
          flex flex-row items-center
          dark:border-none border-t-[0.5px] border-gray-950/20
        `}>
          {
            image_url &&
            <Image
              src={image_url}
              alt="null"
              width={40}
              height={40}
              className={`
                md:h-[40px] md:w-[40px] h-[25px] w-[25px]
                bg-black dark:bg-transparent
                rounded-full mr-3
                object-cover
              `}
            />
          }
          <div className='flex flex-row justify-between items-center flex-1'>
            <div className='flex flex-row'>
              <span>{text}</span>
              {
                  is_verified &&
                  <VerifiedBadge/>
              }
              {
                  holiday_mode &&
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500 ml-2">
                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
                  </svg>
              }
            </div>
            {
              notification &&
              <span className='ml-3 mr-3 w-2 h-2 rounded-full bg-red-500 text-right'></span>
            }
          </div>
        </div>
      </Link>
    )
}

type SidebarParams = {
  isActive?: boolean;
  onCloseClick: () => void;
  onWalletButtonClick: () => void;
}
  
const SideBar = ({ isActive, onCloseClick, onWalletButtonClick }: SidebarParams) => {
    const [isSettingOpen, setIsSettingOpen] = useState(false);
    const [hasInit, setHasInit] = useState(false);
    // const pathname = usePathname();
    const { user, clear, init, isVerifying } = useUserState();
    const wallet = useWallet();
    // const isGettingData = useRef(false);
    const isIniting = useRef<boolean>(false);
    const router = useRouter();

    // useEffect(() => {
    //   if(!wallet.connected) {
    //     clear?.();
    //   }
    // }, [wallet, clear]);

    // useEffect(() => {
    //     //close sidebar whenever path changes
    //     setIsSettingOpen(false);
    // }, [pathname]);

    useEffect(() => {
        if(!wallet.publicKey) {
            clear?.();
            setTimeout(() => {
                setHasInit(true);
            }, 1500);
            return;
        }

        // if(!wallet.signMessage) {
        //     return;
        // }

        // checks if has user and user's address is same as the auth-ed address
        if(user && wallet.publicKey?.toBase58() === user.address) {
            return;
        }

        if(!init) {
            return;
        }

        const askForSignature = async() => {
            // if(!wallet.signMessage) {
            //     //console.error('Verification error: no sign message function');
            //     return;
            // }
            
            if(isIniting.current) {
                // dont set off multiple
                return;
            }

            isIniting.current = true;

            let res = await init();
            // has initialized
            if(res) {
                isIniting.current = false;
                setHasInit(true);
                // toast.success(`Welcome back, ${res.name ?? res.address}!`);
                onCloseClick();
                return;
            }

            // ask for signature
            const toSign = VERIFY_MESSAGE;
            let signature = "";
            let retries = 0;
            // // For historical reasons, you must submit the message to sign in hex-encoded UTF-8.
            // // This uses a Node.js-style buffer shim in the browser.
            while(retries < 3) {
                try {
                    const msg = Buffer.from(toSign);
                    let signed = await wallet.signMessage!(msg as any);
                    signature = Buffer.from(signed).toString("base64");

                    if(!signature) {
                        break;
                    }

                    let res = await init(signature);
                    /* if(res) {
                        toast.success(`Welcome, ${res.name ?? res.address}!`);
                    } */
                    break;
                }

                catch(e: any) {
                    if(e.message.includes("Plugin Closed")) {
                      console.log(e.message);
                        retries++;
                        continue;
                    }

                    console.log(e.message);
                    toast.error(e.message);
                    clear?.();
                    wallet?.disconnect?.();
                    console.log('wallet disconnected');
                    break;
                }

            }

            if(retries === 3) {
                toast.error("Unable to init user profile");
                clear?.();
                wallet?.disconnect?.();
            }

            setTimeout(() => {
              isIniting.current = false;
            }, 1000);
            setHasInit(true);
            onCloseClick();
        }

        askForSignature();
    }, [user, init, wallet, clear, onCloseClick]);

    useEffect(() => {
        if(isVerifying) {
          return;
        }

        if(user.address) {
            return;
        }

        router.push('/');
    }, [user.address, router, isVerifying]);

    return null;
}

export default SideBar;