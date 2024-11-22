'use client';

import { getAreaName } from "@/common/utils";
import { useCallback, useMemo } from "react";
import axios from '@/services/axios';
import { toast } from "react-toastify";
import { useUserState } from "@/providers/userStateProvider";
import Image from "next/image";
import CloseButton from "@/components/CloseButton";
import { useRouter } from "next/navigation";
import Icon from '@mdi/react';
import { mdiMapMarker } from "@mdi/js";

const coordinates = [
    [10, 11],
    [19, 30],
    [24, 50],
    [51, 18],
    [56, 30],
    [52, 68.5],
    [73, 70],
    [80, 16],
];

const travel = async(address: string, areaId: number) => {
    try {

        let areaName = getAreaName(areaId);
        if(!window.confirm(`Travel to the ${areaName}?`)) return;

        await axios.post('/game/travel', {
            address,
            areaId
        });

        return true;
    }

    catch {
        toast.error('You got lost!');
        return false;
    }
}

const MapButton = ({ areaId, onClick, bottom, left }: {areaId: number; onClick: (areaId: number) => void; bottom: string | number; left: string | number;}) => {
    const { user } = useUserState();

    const isActive = useMemo(() => {
        if(!user) {
            return false;
        }

        return user.area_id === areaId;
    }, [user, areaId]);
    
    return (
        <button 
            className={`
                absolute flex items-center justify-center
                bg-transparent border-none w-[17.8%] h-[10%] z-[3]
                ${isActive? 'animate-jump' : ''}
            `} 
            style={{ bottom: `${bottom}%`, left: `${left}%` }} 
            onClick={() => { onClick(areaId) }}
        >
            <Icon 
                path={mdiMapMarker}
                color={'red'}
                size={1.5}
                style={{
                    WebkitTextStrokeWidth: 3,
                    WebkitTextStrokeColor: 'black',
                }}
            />
        </button>
    );
}

const Page = () => {
    const { user, me } = useUserState();
    const router = useRouter();

    const onTravelClick = useCallback(async (areaId: number) => {
        if(!user?.address) {
            return;
        }
        
        await travel(user.address, areaId);
        await me?.();
    }, [user.address, me]);

    const map = useMemo(() => {
        return "starter_map";
    }, []);

    const onCloseClick = useCallback(() => {
        router.push('/home');
    }, [router]);

    return (
		<div className={`
            flex flex-col justify-center items-center
            h-full w-full
            font-starguard
        `}>
            <div className={`
                    h-[90vh] w-[calc(90vh*0.561)]
                    relative m-auto    
                `}
            >
			    <Image 
                    className={`
                        h-[90vh] rounded-[10px]
                        border-[5px] border-black    
                    `}
                    src={`/assets/maps/${map}.jpg`} 
                    alt="starter_map"
                    height={1680}
                    width={944}
                />
                {
                    coordinates.map((x, index) => (
                        <MapButton
                            key={`map-area-${index}`}
                            areaId={index + 1}
                            bottom={x[0]}
                            left={x[1]}
                            onClick={onTravelClick}
                        />
                    ))
                }
                <CloseButton
                    onButtonClick={onCloseClick}
                />
            </div>
        </div>
    );
}

export default Page;