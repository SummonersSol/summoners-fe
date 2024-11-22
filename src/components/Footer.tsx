'use client';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTelegramPlane, faXTwitter } from '@fortawesome/free-brands-svg-icons';

const Component = () => {
    return (
      <div className={`
        flex flex-row justify-center
        sticky bottom-0 right-0 left-0
        h-[96px] pt-[2px]
        bg-gradient-to-r from-[#583d28] via-[#c8bca4] to-[#583d28]
        z-[55]
      `}>
        <div className='w-screen flex flex-row px-[30px] items-center justify-between bg-summoners-dark'>
          <div className="flex flex-row space-x-[30px] text-[#b9bbbd]">
            <Link href={'/'} target='_blank'>Homepage</Link>
            <Link href={'/'} target='_blank'>About</Link>
            <Link href={'/'} target='_blank'>Whitepaper</Link>
          </div>
          <div className="flex flex-row space-x-[20px] items-center">
            <Link href={'/'} target='_blank'>
              <div className="flex items-center justify-center rounded-full bg-[#b9bbbd] h-[40px] w-[40px]">
                <FontAwesomeIcon icon={faXTwitter} height={25} width={25} size='2x' color='#161d24'/>
              </div>
            </Link>
            <Link href={'/'} target='_blank'>
              <div className="flex items-center justify-center rounded-full bg-summoners-dark">
                <FontAwesomeIcon icon={faTelegramPlane} height={40} width={40} size='3x' color='#b9bbbd'/>
              </div>
            </Link>
          </div>
        </div>
      </div>
    )
}

export default Component;