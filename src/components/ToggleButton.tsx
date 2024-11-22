import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const Component = ({ onToggle, text, disabled, value }: { onToggle: (isSelected: boolean) => void; text?: string; disabled?: boolean; value: boolean; }) => {
    const [isSelected, setIsSelected] = useState(value);

    useEffect(() => {
        setIsSelected(value);
    }, [value]);

    return (
        <div className="flex flex-row items-center">
            {
                text &&
                <span className='mr-3 lg:text-[0.6vw] text-[7px]'>{text}</span>
            }
            <button
                onClick={() => {
                    setIsSelected(!isSelected);
                    onToggle(!isSelected);
                }}
                className={`flex flex-row ${!isSelected? 'justify-start bg-gray-200' : 'justify-end bg-white'} h-[20px] w-[38px] rounded-full p-[1px]`}
                disabled={disabled}
            >
                <motion.div
                    className={`h-[18px] w-[18px] rounded-full ${!isSelected? 'bg-gray-400' : 'bg-blue-500'}`}
                    layout
                    transition={{ type: 'spring', damping: 30, stiffness: 700 }}
                />
            </button>
        </div>
    )
}


export default Component;