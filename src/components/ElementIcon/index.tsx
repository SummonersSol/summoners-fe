import React, { useEffect, useMemo, useState } from 'react';
import { ELEMENT_CHAOS, ELEMENT_FIRE, ELEMENT_GRASS, ELEMENT_WATER } from '@/common/constants';
import { ElementIconProps } from '@/@types/components/elementIcon';
import Icon from '@mdi/react';
import './styles.scss';
import { mdiDecagram, mdiFire, mdiLeaf, mdiWater } from '@mdi/js';

const ElementIcon = ({elementId, size}: ElementIconProps) => {

    const [elementIcon, color] = useMemo(() => {
        let elementIcon = "";
        let color = "";
        switch(elementId) {
            case ELEMENT_WATER:
                elementIcon = mdiWater;
                color = 'lightblue';
                break;
            case ELEMENT_CHAOS:
                elementIcon = mdiDecagram;
                color = 'grey';
                break;
            case ELEMENT_GRASS:
                elementIcon = mdiLeaf;
                color = 'lightgreen';
                break;
            case ELEMENT_FIRE:
                elementIcon = mdiFire;
                color = 'rgb(255,90,0)';
                break;
            default:
                break;
        }

        return [elementIcon, color];
    }, [elementId]);

    return (
        <Icon 
            path={elementIcon} 
            color={color} 
            className={`element-icon`} 
            size={size ?? 1}
        />
    )
}

export default ElementIcon;