import Image from 'next/image';

const Component = ({ src }: { src: string; }) => {
    return (
        <div className='flex h-[40px] w-[40px] shrink relative'>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect y="7" width="40" height="26" fill="white"/>
                <rect x="3.5" y="3.5" width="33" height="33" fill="white"/>
                <rect x="7" width="26" height="40" fill="white"/>
            </svg>
            <div className="absolute inset-[4px]">
                <div className='h-[33px] w-[33px] bg-black overflow-hidden justify-center items-center flex'>
                    <Image
                        src={src}
                        alt="profile"
                        height={33}
                        width={33}
                    />
                </div>
                <div className="absolute inset-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                        {/** top */}
                        <rect y="0" width="2.5" height="5.775" fill="white"/>
                        <rect y="0" width="5.775" height="2.5" fill="white"/>
                        <rect x="30.5" width="2.5" height="5.775" fill="white"/>
                        <rect x="27.225" width="5.775" height="2.5" fill="white"/>


                        {/** bottom */}
                        <rect y="27.225" width="2.5" height="5.775" fill="white"/>
                        <rect y="30.5" width="5.775" height="2.5" fill="white"/>
                        <rect x="30.5" y="27.225" width="2.5" height="5.775" fill="white"/>
                        <rect x="27.225" y="30.5" width="5.775" height="2.5" fill="white"/>
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default Component;