'use client';
import { useUserState } from '@/providers/userStateProvider';
import { UnifiedWalletButton } from './UnifiedWalletButton';

const Header = ({show}: {show: boolean}) => {
  const {user} = useUserState();
	// default header
    return (
      <div className={`
        ${show? 'flex': 'hidden'} flex-row justify-center
        fixed top-0 z-[55] py-3 right-[143px]
      `}
      style={{
        zIndex: 99
      }}>
        
        <div className='flex flex-row items-center justify-end space-x-3'>
          <div className="rounded px-2 py-1">
            <strong className="text-center">{user?.exp} XP</strong>
          </div>
          <UnifiedWalletButton/>
        </div>
      </div>
    )
}

export default Header;