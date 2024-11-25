import { mdiChevronRight } from '@mdi/js';
import Icon from '@mdi/react';

const NextButton = ({onButtonClick, className}: {onButtonClick: () => void; className?: string;}) => {
    return (
        <button 
            className={`
                back-button flex flex-row items-center justify-end
                bg-transparent border-none
                text-[20px] w-[150px] font-starguard ${className}
            `}
            onClick={onButtonClick}
        >
            <span className={`
                    mr-[10px] uppercase
                    tracking-[3px]
                `}
            >
                Next
            </span>
            <Icon
                path={mdiChevronRight}
                size={1}
            />
        </button>
    )
}

export default NextButton;