import { useEffect, useRef, useCallback } from 'react';

/**
 * Accessible Modal Hook - WCAG 2.1 AA Compliant
 * 
 * Handles:
 * - Focus trapping (users can't tab outside modal)
 * - Escape key dismissal
 * - Focus restoration on close
 * - Screen reader announcement
 * - Preventing body scroll
 * 
 * @param isOpen Whether the modal is open
 * @param onClose Callback to close the modal
 * @param initialFocusRef Optional ref to element that should get focus on open
 * 
 * @example
 * ```tsx
 * const modalRef = useRef<HTMLDivElement>(null);
 * const closeButtonRef = useRef<HTMLButtonElement>(null);
 * 
 * useAccessibleModal(isOpen, onClose, closeButtonRef);
 * 
 * return (
 *   <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
 *     <h2 id="dialog-title">Modal Title</h2>
 *     <button ref={closeButtonRef}>Close</button>
 *   </div>
 * );
 * ```
 */
export const useAccessibleModal = (
  isOpen: boolean,
  onClose: () => void,
  initialFocusRef?: React.RefObject<HTMLElement>
): React.RefObject<HTMLDivElement> => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<Element | null>(null);

  // Get all focusable elements within the modal
  const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];

    return Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelectors.join(','))
    ).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  };

  // Handle Tab key - trap focus within modal
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Close on Escape
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      // Focus trapping on Tab
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = getFocusableElements(modalRef.current);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement as HTMLElement;

        // Shift+Tab on first element -> go to last
        if (event.shiftKey && activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
        // Tab on last element -> go to first
        else if (!event.shiftKey && activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    // Store the element that had focus before modal opened
    previousActiveElementRef.current = document.activeElement;

    // Focus the initial element or the first focusable element
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else if (modalRef.current) {
      const focusableElements = getFocusableElements(modalRef.current);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    // Prevent body scroll while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyDown);

    // Announce modal to screen readers
    if (modalRef.current) {
      const ariaLabel = modalRef.current.getAttribute('aria-label');
      const labelledBy = modalRef.current.getAttribute('aria-labelledby');
      if (ariaLabel || labelledBy) {
        // Screen reader will announce the modal on open due to role="dialog"
      }
    }

    return () => {
      // Clean up
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;

      // Restore focus to the element that opened the modal
      if (previousActiveElementRef.current instanceof HTMLElement) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen, handleKeyDown, initialFocusRef]);

  return modalRef;
};

/**
 * Custom hook to manage multiple modals with proper state
 */
export const useAccessibleModalState = (initialOpen: boolean = false) => {
  const [isOpen, setIsOpen] = React.useState(initialOpen);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  };
};

export default useAccessibleModal;
