import React, { ReactNode, useState, useRef, useEffect } from 'react';

export interface TooltipProps {
  /** The tooltip text/content */
  text: string;
  /** The element that triggers the tooltip */
  children: ReactNode;
  /** Direction the tooltip appears */
  direction?: 'top' | 'bottom' | 'left' | 'right';
  /** Unique ID for aria-describedby linking */
  id: string;
  /** Show on hover (default: true) */
  showOnHover?: boolean;
  /** Show on focus (default: true) */
  showOnFocus?: boolean;
  /** Delay before showing (ms, default: 200) */
  showDelay?: number;
  /** Delay before hiding (ms, default: 100) */
  hideDelay?: number;
  /** Additional CSS classes for tooltip */
  tooltipClassName?: string;
}

/**
 * Accessible Tooltip Component - WCAG 2.1 AA Compliant
 * 
 * Features:
 * - Keyboard accessible (focus shows tooltip)
 * - Screen reader support via aria-describedby
 * - Semantic role="tooltip" for assistive tech
 * - Dismissible on Escape key
 * - Hover + focus support
 * - Directional placement
 * 
 * @example
 * ```tsx
 * <Tooltip text="This is helpful info" id="my-tooltip" direction="bottom">
 *   <button>Hover or focus me</button>
 * </Tooltip>
 * ```
 */
const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>((
  {
    text,
    children,
    direction = 'top',
    id,
    showOnHover = true,
    showOnFocus = true,
    showDelay = 200,
    hideDelay = 100,
    tooltipClassName = '',
  },
  ref
) => {
  const [isVisible, setIsVisible] = useState(false);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const mergedRef = ref || tooltipRef;

  // Clear any pending timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (!showOnHover) return;
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => setIsVisible(true), showDelay);
  };

  const handleMouseLeave = () => {
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setIsVisible(false), hideDelay);
  };

  const handleFocus = () => {
    if (!showOnFocus) return;
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => setIsVisible(true), showDelay);
  };

  const handleBlur = () => {
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setIsVisible(false), hideDelay);
  };

  // Handle Escape key to dismiss tooltip
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isVisible) {
      e.preventDefault();
      setIsVisible(false);
    }
  };

  // Get position classes based on direction
  const getPositionClasses = (): string => {
    const base = 'absolute whitespace-nowrap px-2 py-1 rounded-md text-xs font-medium transition-opacity duration-200';
    
    const positionMap = {
      top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return `${base} ${positionMap[direction]}`;
  };

  // Get arrow classes based on direction
  const getArrowClasses = (): string => {
    const base = 'absolute w-2 h-2 bg-slate-900 rotate-45';
    
    const arrowMap = {
      top: 'top-full left-1/2 -translate-x-1/2 -mt-1 bg-slate-900',
      bottom: 'bottom-full left-1/2 -translate-x-1/2 mb-0 bg-slate-900',
      left: 'left-full top-1/2 -translate-y-1/2 -ml-1 bg-slate-900',
      right: 'right-full top-1/2 -translate-y-1/2 mr-0 bg-slate-900',
    };

    return `${base} ${arrowMap[direction]}`;
  };

  // Ensure trigger is accessible (wrap if not interactive)
  const triggerChild = React.Children.only(children);
  const isTriggerInteractive = React.isValidElement(triggerChild) && 
    (triggerChild.type === 'button' || triggerChild.type === 'a' || triggerChild.props.role === 'button');

  const enhancedTrigger = React.isValidElement(triggerChild)
    ? React.cloneElement(triggerChild as React.ReactElement<any>, {
        'aria-describedby': id,
        onMouseEnter: (e: React.MouseEvent) => {
          handleMouseEnter();
          triggerChild.props.onMouseEnter?.(e);
        },
        onMouseLeave: (e: React.MouseEvent) => {
          handleMouseLeave();
          triggerChild.props.onMouseLeave?.(e);
        },
        onFocus: (e: React.FocusEvent) => {
          handleFocus();
          triggerChild.props.onFocus?.(e);
        },
        onBlur: (e: React.FocusEvent) => {
          handleBlur();
          triggerChild.props.onBlur?.(e);
        },
        onKeyDown: (e: React.KeyboardEvent) => {
          handleKeyDown(e);
          triggerChild.props.onKeyDown?.(e);
        },
      })
    : children;

  return (
    <div ref={triggerRef} className="relative inline-block">
      {enhancedTrigger}
      
      {/* Tooltip content */}
      <div
        ref={mergedRef as React.RefObject<HTMLDivElement>}
        id={id}
        role="tooltip"
        aria-hidden={!isVisible}
        className={`
          ${getPositionClasses()}
          ${tooltipClassName}
          bg-slate-900 text-slate-100 border border-slate-700 shadow-lg z-50
          ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        {text}
        <div className={getArrowClasses()} />
      </div>
    </div>
  );
});

Tooltip.displayName = 'Tooltip';

export default Tooltip;
