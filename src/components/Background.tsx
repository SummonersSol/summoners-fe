'use client';
import { getBg } from "@/common/utils";
import { useUserState } from "@/providers/userStateProvider";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const pagesWithBlur = [
    '/nothing',
];

const pagesWithMask = [
    '/map',
    '/home',
    '/battle',
    '/inventory',
    '/history',
    '/battleResult',
    '/courses',
    '/lessons',
];

const Component = () => {
    const { user } = useUserState();
    const pathname = usePathname();

    const shouldMask = useMemo(() => {
        return pagesWithMask.map(x => pathname.includes(x)).reduce((a,b) => a || b);
    }, [pathname]);

    const shouldBlur = useMemo(() => {
        return pagesWithBlur.map(x => pathname.includes(x)).reduce((a,b) => a || b);
    }, [pathname]);

    return (
        <div className="fixed inset-0 z-[-1]">
            {
                shouldMask &&
                <div className="absolute inset-0 bg-black/30">

                </div>
            }
            <Image
                src={getBg(user.area_id ?? 1, shouldBlur)}
                alt="bg"
                height={window.innerHeight}
                width={window.innerWidth}
                style={{
                    height: 'auto',
                    width: '100vw',
                    objectFit: 'contain',
                }}
            />
        </div>
    )
}

export default Component;