'use client';
import BackButton from '@/components/BackButton';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Spinner from '@/components/Spinner';
import { Action, LessonWithPages, ProcessedLessonPage } from '@/@types/courses/types';
import { useUserState } from '@/providers/userStateProvider';
import axios from '@/services/axios';
import NextButton from '@/components/NextButton';
import HomeButton from '@/components/HomeButton';
import Icon from '@mdi/react';
import { mdiCheckCircle } from '@mdi/js';
import { toast } from 'react-toastify';

const DynamicMDXRemote = dynamic(
    async () => ((await import('next-mdx-remote/rsc')).MDXRemote),
    { ssr: true }
);

const ActionComponent = ({ action, address, onSuccess }: {action: Action, address: string, onSuccess: () => void;}) => {
    const [internalIsCorrect, setInternalIsCorrect] = useState(false);
    const hasTriggered = useRef(false);

    const onVerify = useCallback(async() => {
        try {
            await axios.post(`${action.tx_verify_url}`, { address });
            setInternalIsCorrect(true);
        }

        catch {
            toast.error("Unable to verify");
        }
    }, [address, action]);

    useEffect(() => {
        if(!internalIsCorrect) {
            return;
        }

        if(hasTriggered.current) return;
        hasTriggered.current = true;
        onSuccess();
    }, [internalIsCorrect, onSuccess]);
    
    switch(action.type) {
        case "select":
            return (
                <div className="flex flex-col">
                    <div className="flex flex-row">
                        <strong>{action.markdown}</strong>
                        {
                            internalIsCorrect &&
                            <Icon path={mdiCheckCircle} color={"lightgreen"} size={1} className='ml-2'/>
                        }
                    </div>
                    <select 
                        className='mt-2 min-w-[500px] outline-none' 
                        onChange={({target: { value }}) => {
                            let index = action.options!.options.indexOf(value);
                            setInternalIsCorrect(index === action.options!.answer);
                        }}
                    >
                        <option value="">Please Select</option>
                        {
                            action.options!.options.map(x => (
                                <option key={`option-${x}-${action.id}`} value={x}>{x}</option>
                            ))
                        }
                    </select>
                </div>
            );

        case "tx":
            return (
                <div className="flex flex-col">
                    <div className="flex flex-row">
                        <strong>{action.markdown}</strong>
                        {
                            internalIsCorrect &&
                            <Icon path={mdiCheckCircle} color={"lightgreen"} size={1} className='ml-2'/>
                        }
                    </div>
                    <input type="text" placeholder='Tx Hash' className='rounded mb-2 outline-none'/>
                    <button className='px-2 py-1 bg-green-500 text-white rounded' onClick={onVerify}>Verify</button>
                </div>
            );

        default:
            return null;
    }
}
 
const Page = ({params: { id }}: {params: { id: number }}) => {
    const router = useRouter();
    const { user, me } = useUserState();
    const [isLoading, setIsLoading] = useState(true);
    const [exp, setExp] = useState(0);
    const [courseId, setCourseId] = useState(0);
    const [lessonPages, setLessonPages] = useState<ProcessedLessonPage[]>([]);
    const [loadedIndex, setLoadedIndex] = useState(0);
    const isSuccessLoading = useRef(false);

    const markdown = useMemo(() => {
        if(lessonPages.length === 0) return undefined;
        return lessonPages[loadedIndex]?.markdown;
    }, [lessonPages, loadedIndex]);
    
    const getData = useCallback(async() => {
        if(!user.address) {
            return;
        }

        setIsLoading(true);
        try {
            let res = await axios.post<LessonWithPages>(`/courses/lesson/${id}`, { address: user.address });
            setExp(res.data.exp);
            setCourseId(res.data.course_id);
            setLessonPages(res.data.pages);
            let loadIndex = 0;
            if(res.data.last_completed_page !== 0){
                loadIndex = res.data.pages.map(x => x.id).indexOf(res.data.last_completed_page);
                // get the next index
                loadIndex = loadIndex === res.data.pages.length - 1? loadIndex : loadIndex + 1;
            }
            setLoadedIndex(loadIndex);
        }

        catch(e) {
            console.log(e);
            setLessonPages([]);
        }

        setIsLoading(false);
    }, [user.address, id]);

    const onBack = useCallback(() => {
        if(loadedIndex === 0) {
            router.back();
            return;
        }
        
        let newIndex = loadedIndex - 1;
        setLoadedIndex(newIndex < 0? 0 : newIndex);
    }, [loadedIndex, router]);

    const onNext = useCallback(async() => {
        let newIndex = loadedIndex + 1;
        setLoadedIndex(newIndex === lessonPages.length? lessonPages.length - 1 : newIndex);
        await axios.post(`/courses/lesson_page/${lessonPages[loadedIndex].lesson_id}/${lessonPages[loadedIndex].id}/complete`, { address: user.address });
    }, [loadedIndex, lessonPages, user.address]);

    const onSuccess = useCallback(async() => {
        if(loadedIndex !== lessonPages.length - 1) {
            return;
        }

        console.log('clicked'); 
        if(isSuccessLoading.current) return;

        isSuccessLoading.current = true;
        toast.success(`Congratulations! You have obtained ${exp} XP and a new monster card!`);
        await me?.();
        router.push(`/courses/${courseId}`);
        isSuccessLoading.current = false;
    }, [loadedIndex, lessonPages, exp, courseId, router, me, isSuccessLoading]);

    useEffect(() => {
        getData();
    }, [getData]);

    return (
        <div className={`
            flex flex-col justify-center items-center
            h-screen w-screen
            bg-slate-800 text-white
            no-tailwindcss-base markdown
        `}>
            {/* <Spinner
                fullScreen
                mode='dark'
                textColor='black'
                show={isLoading}
                type="pulse"
                text='Loading'
            /> */}
            <div className="flex relative items-start justify-between w-[80vw] max-w-[1200px]">
                <HomeButton 
                    onButtonClick={() => { router.push('/home'); }}
                    className='text-white ml-[-18px]'
                />
                <div className="flex flex-row space-x-1">
                    <BackButton 
                        onButtonClick={onBack}
                        className='text-white ml-[-18px]'
                    />
                    <NextButton
                        onButtonClick={onNext}
                        className={`text-white ml-[-18px] ${loadedIndex === lessonPages.length - 1? 'cursor-not-allowed' : ''}`}
                    />
                </div>
            </div>
            <div className="relative flex flex-col items-center h-[90vh] max-h-[90vh] w-full overflow-auto">
                <div className="w-[80vw] max-w-[1200px] pb-[300px]">
                    {
                        markdown &&
                        <Suspense>
                            <DynamicMDXRemote source={markdown}/>
                        </Suspense>
                    }
                    {
                        lessonPages[loadedIndex]?.actions?.length > 0 &&
                        <>
                        <div className="mt-10"></div>
                        <h2>Exercise</h2>
                        <ActionComponent
                            action={ lessonPages[loadedIndex].actions[0]}
                            address={user.address}
                            onSuccess={onSuccess}
                        />
                        </>
                    }
                </div>
            </div>
        </div>
    )
}

export default Page;