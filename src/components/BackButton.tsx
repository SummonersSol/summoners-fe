import { mdiChevronLeft } from '@mdi/js';
import Icon from '@mdi/react';

const BackButton = ({onButtonClick}: {onButtonClick: () => void}) => {
    return (
        <button 
            className={`
                back-button flex flex-row items-center
                bg-transparent border-none
                text-[20px] w-[150px] font-starguard
            `}
            onClick={onButtonClick}
        >
            <Icon
                path={mdiChevronLeft}
                size={1}
            />
            <span className={`
                    ml-[10px] uppercase
                    tracking-[3px]
                `}
            >
                Back
            </span>
        </button>
    )
}

export default BackButton;