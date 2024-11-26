'use client';
import BackButton from "@/components/BackButton";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { useUserState } from "@/providers/userStateProvider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CourseWithLessons, ProcessedLesson } from "@/@types/courses/types";
import axios from "@/services/axios";
import Spinner from "@/components/Spinner";

const LessonButton = ({href, lesson} : {href: string, lesson: ProcessedLesson }) => {
    const pct = useMemo(() => {
        if(lesson.completed_pages === 0) return 0;
        return (lesson.completed_pages / lesson.total_pages) * 100;
    }, [lesson]);

    return (
        <Link 
            className={`
                w-full rounded-lg
                flex flex-col bg-orange-100 p-3 border-[3px] border-black
            `}
            href={href}
        >
            <div className="flex flex-row justify-between">
                <strong>{lesson.name} ({lesson.exp}XP)</strong>
                <div className="flex flex-row items-center space-x-3">
                    <div className="flex w-full justify-end">
                        <strong>{pct.toFixed(0)}%</strong>
                    </div>
                    <div className="w-[200px] h-[10px] rounded-full bg-[#00000033]">
                        <div className="rounded-full h-full bg-blue-500" style={{ width: `${pct}%` }}></div>
                    </div>
                </div>
            </div>
        </Link>
    )
}


const Page = ({params: { id }}: { params: { id: number }}) => {
    const router = useRouter();
    const { user } = useUserState();
    const [isLoading, setIsLoading] = useState(false);
    const [course, setCourse] = useState<CourseWithLessons>();

    const getData = useCallback(async() => {
        if(!user.address) {
            return;
        }

        setIsLoading(true);
        try {
            let res = await axios.post<CourseWithLessons>(`/courses/${id}`, { address: user.address });
            setCourse(res.data);
        }

        catch(e) {
            console.log(e);
            setCourse(undefined);
        }
        setIsLoading(false);

    }, [user.address, id]);

    useEffect(() => {
        getData();
    }, [getData]);

    return (
        <div className={`
            flex flex-col justify-center items-center
            h-screen w-screen
        `}>
            {/* <Spinner
                fullScreen
                mode='dark'
                show={isLoading}
                type="pulse"
                text='Loading'
            /> */}
            <div className="w-[80vw] max-w-[800px] h-[80vh]">
                <BackButton
                    onButtonClick={() => { router.push('/courses'); }}
                />
                {
                    course?.lessons?.map(x => (
                        <LessonButton 
                            key={`lesson-${x.id}`}
                            href={`/lessons/${x.id}`}
                            lesson={x}
                        />
                    ))
                }
            </div>
        </div>
    )
}

export default Page;