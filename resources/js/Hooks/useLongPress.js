import { useState, useCallback, useRef } from "react";

/**
 * Custom hook to detect long press events (for mobile interactions)
 * @param {Function} onLongPress - Callback to trigger when long press is detected
 * @param {Function} onClick - Optional regular click callback
 * @param {number} duration - Duration in ms to detect a long press (default: 500ms)
 */
export default function useLongPress(
    onLongPress,
    onClick = null,
    duration = 500
) {
    const [longPressTriggered, setLongPressTriggered] = useState(false);
    const timeout = useRef();
    const target = useRef();

    // When user starts pressing
    const start = useCallback(
        (event) => {
            event.persist();

            // Store the target element
            target.current = event.target;

            // Clear any existing timeout
            if (timeout.current) {
                clearTimeout(timeout.current);
            }

            setLongPressTriggered(false);

            // Set a timeout to trigger long press after the specified duration
            timeout.current = setTimeout(() => {
                onLongPress(event);
                setLongPressTriggered(true);
            }, duration);
        },
        [onLongPress, duration]
    );

    // When user stops pressing
    const clear = useCallback(
        (event, shouldTriggerClick = true) => {
            // Make sure we're dealing with the same element
            if (
                shouldTriggerClick &&
                !longPressTriggered &&
                onClick &&
                event.target === target.current
            ) {
                // Only trigger if it wasn't a long press and we have a click handler
                onClick(event);
            }

            // Clear the timeout
            if (timeout.current) {
                clearTimeout(timeout.current);
            }

            setLongPressTriggered(false);
        },
        [onClick, longPressTriggered]
    );

    // Return event handlers for different events
    return {
        onMouseDown: start,
        onTouchStart: start,
        onMouseUp: clear,
        onMouseLeave: (e) => clear(e, false), // Don't trigger click when mouse leaves
        onTouchEnd: clear,
        onContextMenu: (e) => {
            // Prevent the context menu on long press
            if (longPressTriggered) {
                e.preventDefault();
            }
        },
    };
}
