import { mdiChevronRight } from '@mdi/js';
import Icon from '@mdi/react';

const NextButton = ({onButtonClick, className}: {onButtonClick: () => void; className?: string;}) => {
    return (
        <button 
            className={`
                back-button flex flex-row items-center justify-end
                bg-transparent border-none
                text-[20px] font-starguard ${className}
            `}
            onClick={onButtonClick}
        >
            <span className={`
                    uppercase
                    tracking-[3px]
                `}
            >
                Home
            </span>
        </button>
    )
}

export default NextButton;