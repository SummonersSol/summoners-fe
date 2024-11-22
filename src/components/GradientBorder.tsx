'use client';

import { useMemo } from "react";

const Component = ({ 
    children, 
    className, 
    padding,
    color,
    hasMiddle,
    direction,
  }: { 
    children: React.ReactNode; 
    className?: string; 
    padding?: number;
    color: "gold" | "brown";
    hasMiddle?: boolean;
    direction?: "b" | "t" | "br" | "bl" | "tr" | "tl" | "r" | "l";
}) => {
    // coded this way cause otherwise tailwind wont render
    const [start, end, via] = useMemo(() => {
      switch(color) {
        case "gold":
          return [
            'from-summoners-gold-g-s', 
            hasMiddle? 'to-summoners-gold-g-s' : 'to-summoners-gold-g-e', 
            hasMiddle? 'via-summoners-gold-g-e' : '', 
          ];

        case "brown":
          return [
            'from-summoners-brown-g-s', 
            hasMiddle? 'to-summoners-brown-g-s' : 'to-summoners-brown-g-e', 
            hasMiddle? 'via-summoners-brown-g-e' : '', 
          ];
          
        default:
          return [];
      }
    }, [hasMiddle, color]);

    const directionStr = useMemo(() => {
      switch(direction) {
        case "b":
          return "bg-gradient-to-b";
        case "br":
          return "bg-gradient-to-br";
        case "bl":
          return "bg-gradient-to-bl";
        case "t":
          return "bg-gradient-to-t";
        case "tr":
          return "bg-gradient-to-tr";
        case "tl":
          return "bg-gradient-to-tl";
        case "r":
          return "bg-gradient-to-r";
        case "l":
          return "bg-gradient-to-l";
      }

      return "";
    }, [direction]);
    
    return (
      <div className={`
        ${className}
        ${start} ${end} ${via}
        ${directionStr}
      `}
      style={{
        padding: padding ?? 1
      }}  
    >
        {children}
      </div>
    )
}

export default Component;