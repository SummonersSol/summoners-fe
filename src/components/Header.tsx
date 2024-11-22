'use client';
import { UnifiedWalletButton } from './UnifiedWalletButton';

const Header = ({forceShow}: {forceShow: boolean}) => {
	// default header
    return (
      <div className={`
        flex flex-row justify-center
        fixed top-0 z-[55] py-3 right-[143px]
      `}
      style={{
        zIndex: 99
      }}>
        
        <div className='flex flex-row items-center justify-end'>
			<UnifiedWalletButton/>
		</div>
      </div>
    )
}

export default Header;