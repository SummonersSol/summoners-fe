'use client';
import { mdiChevronDown, mdiChevronLeft, mdiChevronRight, mdiChevronUp } from '@mdi/js';
import Icon from '@mdi/react';
import WidgetBot from '@widgetbot/react-embed';
import React, { useCallback, useMemo, useState } from 'react';

const Widget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useMemo(() => { return window.innerWidth < window.innerHeight || window.innerWidth < 1024 }, []);

    const { height, width, translateX, translateY, right, bottom } = useMemo(() => {
        let height = isMobile? window.innerHeight - 100 : window.innerHeight - 160;
        let width = isMobile? window.innerWidth : window.innerWidth / 4.75; 
        let right = isMobile? 0 : -width;
        let bottom = isMobile? -5 : 65;
        let translateX = isMobile? 0 : width + 10;
        let translateY = isMobile? height : 0;
        return { height, width, translateX, translateY, right, bottom };
    }, [isMobile]);

    const transform = useMemo(() => {
        return isOpen? `translateX(-${translateX}px) translateY(0px)` : `translateX(0px) translateY(${translateY}px)`;
    }, [isOpen, translateX, translateY]);

    const toggle = useCallback(() => {
        setIsOpen(!isOpen);
    }, [isOpen]);

    return (
        <div 
            className='fixed z-[56] transition-all flex lg:flex-row flex-col lg:items-start items-center' 
            style={{bottom, right, transform}}
        >
            <button
                className={`
                    absolute
                    lg:left-[-35px] lg:top-0 top-[-30px]
                    flex lg:flex-col flex-row z-[-1]
                    lg:pl-2 lg:pr-5 lg:py-3 py-1 px-2 
                    lg:text-sm text-xs 
                    rounded-tl rounded-tr lg:rounded-tr-none lg:rounded-bl
                    bg-[#2f3339] text-white 
                    items-center justify-center`}
                onClick={toggle}
            >
                {
                    isMobile?
                    <Icon path={isOpen? mdiChevronDown : mdiChevronUp} size={1}/>:
                    <Icon path={isOpen? mdiChevronRight: mdiChevronLeft} size={1}/>
                }
                <span className='lg:mt-2 mt-0 ml-2 lg:ml-0'></span>
                <span>C</span>
                <span>H</span>
                <span>A</span>
                <span>T</span>
            </button>
            
            <WidgetBot
                server={process.env.NEXT_PUBLIC_DISCORD_SERVER}
                channel={process.env.NEXT_PUBLIC_DISCORD_CHANNEL}
                style={{
                    height,
                    width,
                }}
            />
        </div>
    );
}

export default Widget;