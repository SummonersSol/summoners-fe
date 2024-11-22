'use client';
import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import { SolanaMobileWalletAdapterWalletName } from '@solana-mobile/wallet-adapter-mobile';
import { useUnifiedWallet, useUnifiedWalletContext } from '@jup-ag/wallet-adapter';
import { WalletOutlined, WalletFilled } from '@ant-design/icons';
import { ellipsizeThis, formatCash } from '@/common/utils';
import { useUserState } from '@/providers/userStateProvider';
import Link from 'next/link';
export const MWA_NOT_FOUND_ERROR = 'MWA_NOT_FOUND_ERROR';

export const UnifiedWalletButton: React.FC<{
  overrideContent?: ReactNode;
  buttonClassName?: string;
  currentUserClassName?: string;
}> = ({ overrideContent, buttonClassName: className, currentUserClassName }) => {
  const { user } = useUserState();
  const { setShowModal, theme } = useUnifiedWalletContext();
  const { disconnect, connect, connecting, wallet, autoConnect, connected } = useUnifiedWallet();

  const handleClick = useCallback(async () => {
    try {
      if(connected) {
        await disconnect();
        return;
      }

      if (wallet?.adapter?.name === SolanaMobileWalletAdapterWalletName) {
        await connect();

        return;
      } else {
        setShowModal(true);
      }
    } catch (error) {
      if (error instanceof Error && error.message === MWA_NOT_FOUND_ERROR) {
        setShowModal(true);
      }
    }
  }, [wallet, connect, setShowModal, connected, disconnect]);

  const buttonText = useMemo(() => {
    if(!connected) {
      return "Connect Wallet";
    }
    
    if(connecting) {
      return "Connecting";
    }

    return ellipsizeThis(user.address, 3, 3);
  }, [connected, connecting, user.address]);

  return (
    <>
    <div className='relative flex'>
      <button
          className={`
            flex items-center justify-center bg-white
            px-2 py-1 border-[2px] rounded-lg border-black
          `}
          onClick={handleClick}
      >
        {buttonText}
      </button>
    </div>
    </>
  );
};