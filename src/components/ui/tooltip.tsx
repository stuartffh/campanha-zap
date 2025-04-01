"use client";
import {
  useState,
  ReactNode,
  cloneElement,
  ReactElement,
  HTMLAttributes
} from "react";

type TooltipProps = {
  children: ReactElement<HTMLAttributes<HTMLElement>>;
  content: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
};

export function Tooltip({ 
  children, 
  content, 
  position = "top", 
  delay = 300,
  className = ""
}: TooltipProps) {
  const [active, setActive] = useState(false);
  let timeout: NodeJS.Timeout;

  const showTooltip = () => {
    timeout = setTimeout(() => {
      setActive(true);
    }, delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeout);
    setActive(false);
  };

  // Posicionamento do tooltip
  const getPositionClass = () => {
    switch (position) {
      case "top":
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
      case "bottom":
        return "top-full left-1/2 transform -translate-x-1/2 mt-2";
      case "left":
        return "right-full top-1/2 transform -translate-y-1/2 mr-2";
      case "right":
        return "left-full top-1/2 transform -translate-y-1/2 ml-2";
      default:
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
    }
  };

  // Seta do tooltip
  const getArrowClass = () => {
    switch (position) {
      case "top":
        return "top-full left-1/2 -translate-x-1/2 border-t-black";
      case "bottom":
        return "bottom-full left-1/2 -translate-x-1/2 border-b-black";
      case "left":
        return "left-full top-1/2 -translate-y-1/2 border-l-black";
      case "right":
        return "right-full top-1/2 -translate-y-1/2 border-r-black";
      default:
        return "top-full left-1/2 -translate-x-1/2 border-t-black";
    }
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {/* Elemento filho que dispara o tooltip */}
      {cloneElement(children, {
        "aria-describedby": `tooltip-${children.key}`,
        ...children.props
      })}

      {/* Tooltip */}
      {active && (
        <div
          id={`tooltip-${children.key}`}
          role="tooltip"
          className={`absolute z-50 w-max max-w-xs px-3 py-2 text-sm rounded-md shadow-lg
                      bg-gray-800 text-white ${getPositionClass()}`}
        >
          {content}
          
          {/* Seta do tooltip */}
          <div 
            className={`absolute w-0 h-0 border-4 border-transparent ${getArrowClass()}`}
          />
        </div>
      )}
    </div>
  );
}