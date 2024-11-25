'use client';
import BackButton from '@/components/BackButton';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import Spinner from '@/components/Spinner';

const DynamicMDXRemote = dynamic(
    async () => ((await import('next-mdx-remote/rsc')).MDXRemote),
    { ssr: true }
);
 
const Page = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [markdown, setMarkdown] = useState("");

    useEffect(() => {
        setTimeout(() => {
            setMarkdown(`## First course Let's GO

<img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAB0AOAMBIgACEQEDEQH/xAAbAAACAgMBAAAAAAAAAAAAAAAFBgMEAAECB//EACoQAAIBAwMDAwMFAAAAAAAAAAECAwAEEQUSIQYxQRMiURRhgRVxkaHR/8QAGQEBAAMBAQAAAAAAAAAAAAAAAgMEBQEA/8QAHhEAAgICAgMAAAAAAAAAAAAAAAECEQMSBDEFEyH/2gAMAwEAAhEDEQA/APJjHWtlXTFRLTtP0679OCSa/wDqpOAILZHVT8cuCeOfFXKM1TsEWlhNchnXZHCpw80rbUU/GfJ+wyfgVcj0/SsATa2Ax7mKzkZR+W2n+qN2vSt1q1xaR2eo21xp53Il0oIEOAWKtHjcHIBOMe7HBOKBajYCzv5rWOeO4ETY9SLseM/gjyPBBrg9qXRM/T80lvJc6bc22owxAtJ9MWEkajy0bANj7gED5oQRirdrNPZ3MdzaTPDPE25JI2wyn7UU6hW3vIrXVbaIQm6DC5iRCESdSN23jGCCrYHbdjtilQdkLxFaqUrWURWMLWLDxRPpu7TSdQSSZdq7smRUDMvB45GcftimefSYFzgn+KF3GnxAn/Ks+tNGBHmyxy+nEOtW1szPOGv5JY0ilzbJErKrhwWGTvcEAAnGBnvVw9Z2gktZjpLSywhch5cKuCD7BjC8qOQBnsRjihElnGM1Xe2QUXiRaj5CT6Gw9TacNGN9+nu4j9K1tYJSrbWVSWPOfafaCe5PPBAIUbjWGm6ei0oafYqVldmlW1UHBWMAg9w/sOW88fFR+gma7EC9qj0SHLnSYvPbEeKymE2kdZXqJI57R//Z"></img>`);
            setIsLoading(false);
        }, 2000);
    }, []);

    return (
        <div className={`
            flex flex-col justify-center items-center
            h-screen w-screen
            bg-slate-800 text-white
        `}>
            <div className="w-[80vw] max-w-[1200px] h-[80vh]">
                <BackButton 
                    onButtonClick={() => { router.back(); }}
                    className='text-white'
                />
                {
                    isLoading &&
                    <Spinner
                        fullScreen
                        mode='dark'
                        textColor='black'
                        show={isLoading}
                        type="pulse"
                        text='Loading'
                    />
                }
                <Suspense>
                    <DynamicMDXRemote source={markdown}/>
                </Suspense>
            </div>
        </div>
    )
}

export default Page;