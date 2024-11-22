import { mdiClose, mdiCross } from '@mdi/js';
import Icon from '@mdi/react';
import React from 'react';

const CloseButton = ({onButtonClick}: {onButtonClick: () => void}) => {
    return (
        <button 
            className={`
                absolute flex items-center justify-center
                border-none bg-transparent
                top-[1.25%] right-[2%]
                text-[30px] text-red-500 z-[9999]
                h-[30px] w-[30px]
            `}
            onClick={onButtonClick}
        >
            <Icon
                path={mdiClose}
                color={'red'}
            />
        </button>
    )
}

export default CloseButton;