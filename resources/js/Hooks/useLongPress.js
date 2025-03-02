import { useCallback, useRef } from "react";

/**
 * Custom hook to detect long press events (for mobile support)
 *
 * @param {Function} onLongPress - Callback to execute on long press
 * @param {number} threshold - Time in ms to consider a press as "long"
 * @returns {Object} - Event handlers to bind to the target element
 */
export default function useLongPress(onLongPress, threshold = 500) {
    // Use a ref to track the timeout ID
    const timerRef = useRef(null);
    // Ref to track if the press was a long press
    const isLongPressRef = useRef(false);
    // Ref to track the event for position information
    const eventRef = useRef(null);

    // Handle the start of a press
    const handleStart = useCallback(
        (e) => {
            isLongPressRef.current = false;
            // Store the event to pass to onLongPress
            eventRef.current = e;

            // Clear any existing timeout
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            // Set a timeout for the long press
            timerRef.current = setTimeout(() => {
                isLongPressRef.current = true;
                // Pass the event so we know which element and where it was pressed
                onLongPress(eventRef.current);
            }, threshold);
        },
        [onLongPress, threshold]
    );

    // Handle the end of a press
    const handleEnd = useCallback(() => {
        // Clear the timeout
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Handle move events (cancel long press if moved too much)
    const handleCancel = useCallback(() => {
        // Clear the timeout
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        isLongPressRef.current = false;
    }, []);

    // Handle normal click - prevent triggering click after long press
    const handleClick = useCallback((e) => {
        if (isLongPressRef.current) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, []);

    // Return object with event handlers
    return {
        onMouseDown: handleStart,
        onMouseUp: handleEnd,
        onMouseLeave: handleCancel,
        onTouchStart: handleStart,
        onTouchEnd: handleEnd,
        onTouchCancel: handleCancel,
        onClick: handleClick,
    };
}
