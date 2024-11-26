'use client';
import BackButton from "@/components/BackButton";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProcessedCourse } from "@/@types/courses/types";
import { useUserState } from "@/providers/userStateProvider";
import axios from "@/services/axios";
import { ApiResult } from "@/providers/types";
import Spinner from "@/components/Spinner";

const CourseButton = ({href, course} : {href: string, course: ProcessedCourse}) => {
    const pct = useMemo(() => {
        if(course.completed_pages === 0) return 0;
        return (course.completed_pages / course.total_pages) * 100;
    }, [course]);
    return (
        <Link 
            className={`
                h-[200px] w-full rounded-lg
                flex flex-col bg-orange-100 p-3 border-[3px] border-black
            `}
            href={href}
        >
            <div className="flex flex-row justify-between">
                <strong>{course.name}</strong>
                <div className="flex flex-row items-center space-x-3">
                    <div className="flex w-full justify-end">
                        <strong>{pct.toFixed(0)}%</strong>
                    </div>
                    <div className="w-[200px] h-[10px] rounded-full bg-[#00000033]">
                        <div className="rounded-full h-full bg-blue-500" style={{ width: `${pct}%` }}></div>
                    </div>
                </div>
            </div>
            <div className="my-3 flex flex-1 items-center justify-center">
                <span>{course.description}</span>
            </div>

            <div className="flex flex-row w-full justify-end">
                <div className="text-green-700">START</div>
            </div>
        </Link>
    )
}


const Page = () => {
    const router = useRouter();
    const { user } = useUserState();
    const [isLoading, setIsLoading] = useState(false);
    const [courses, setCourses] = useState<ProcessedCourse[]>([]);

    const getData = useCallback(async() => {
        if(!user.address) {
            return;
        }

        setIsLoading(true);
        try {
            let res = await axios.post<ProcessedCourse[]>('/courses', { address: user.address });
            console.log(res.data);
            setCourses(res.data);
        }

        catch(e) {
            console.log(e);
            setCourses([]);
        }
        setIsLoading(false);

    }, [user.address]);

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
                    onButtonClick={() => { router.push('/home'); }}
                />
                {
                    courses.map(x => (
                        <CourseButton 
                            key={`courses-${x.id}`} 
                            href={`courses/${x.id}`}
                            course={x}
                        />
                    ))
                }
            </div>
        </div>
    )
}

export default Page;