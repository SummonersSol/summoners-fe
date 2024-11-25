'use client';
import BackButton from "@/components/BackButton";
import { useRouter } from "next/navigation";
import Link from 'next/link';

const LessonButton = ({href} : {href: string}) => {
    return (
        <Link 
            className={`
                w-full rounded-lg
                flex flex-col bg-orange-100 p-3 border-[3px] border-black
            `}
            href={href}
        >
            <div className="flex flex-row justify-between">
                <strong>UI: Wallet Integration (130xp)</strong>
                <div className="flex flex-row items-center space-x-3">
                    <div className="flex w-full justify-end">
                        <strong>30%</strong>
                    </div>
                    <div className="w-[200px] h-[10px] rounded-full bg-[#00000033]">
                        <div className="rounded-full h-full bg-blue-500" style={{ width: '50%' }}></div>
                    </div>
                </div>
            </div>
        </Link>
    )
}


const Page = () => {
    const router = useRouter();

    return (
        <div className={`
            flex flex-col justify-center items-center
            h-screen w-screen
        `}>
            <div className="w-[80vw] max-w-[800px] h-[80vh]">
                <BackButton
                    onButtonClick={() => { router.push('/courses'); }}
                />
                <LessonButton href="/lessons/1"/>
            </div>
        </div>
    )
}

export default Page;