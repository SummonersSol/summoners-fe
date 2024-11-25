'use client';
import { useUserState } from '@/providers/userStateProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import Icon from '@mdi/react';
import { mdiChevronRight } from '@mdi/js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const NavigateButton = ({href, title}: {href: string; title: string;}) => {
    return (
        <Link
            className={`
                relative bg-white
                uppercase tracking-[3px]
                text-[30px] w-[350px]
                pl-[30px] pr-[10px] py-[5px]
                mb-[10px]
                border-[5px] border-black border-solid
                rounded-[10px]
                transition-all
                flex flex-row justify-between
                hover:scale-[1.1]
            `}
            href={href}
        >
            <span>{title}</span>
            <Icon path={mdiChevronRight} size={2}/>
        </Link>
    )
}

const Home = () => {
    const { user } = useUserState();

    return (
		<div className={`
            flex flex-col justify-center items-center
            h-full w-full
            font-starguard
        `}>
			{
				user?.address &&
				<>
                    <NavigateButton
                        href='/courses'
                        title='Courses'
                    />
                    <NavigateButton
                        href='/map'
                        title='Travel'
                    />
                    <NavigateButton
                        href='/battle'
                        title='Hunt!'
                    />
                    <NavigateButton
                        href='/inventory'
                        title='Inventory'
                    />
                    <NavigateButton
                        href='/history'
                        title='History'
                    />
				</>
			}
		</div>
	)
}

export default Home;