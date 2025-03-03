// useScrollBehavior.js
import { useEffect } from "react";

/**
 * Custom hook to manage scroll behavior in message area
 *
 * @param {Object} messageAreaRef - Reference to the message area DOM element
 * @param {Object} messageEndRef - Reference to the end of messages DOM element
 * @param {Object} shouldScrollToBottom - Reference boolean to track if we should scroll to bottom
 * @param {Array} messages - Array of message objects
 * @param {boolean} loading - Whether messages are loading
 * @param {boolean} loadingMore - Whether more messages are being loaded
 * @param {boolean} hasMoreMessages - Whether there are more messages to load
 * @param {Function} loadMoreMessages - Function to load more messages
 */
export function useScrollBehavior(
    messageAreaRef,
    messageEndRef,
    shouldScrollToBottom,
    messages,
    loading,
    loadingMore,
    hasMoreMessages,
    loadMoreMessages
) {
    // Set up scroll event listener for automatic loading when scrolling to top
    useEffect(() => {
        const messageArea = messageAreaRef.current;

        const handleScroll = () => {
            if (messageArea) {
                // Auto-load more when reaching the top (within 50px)
                if (
                    messageArea.scrollTop < 50 &&
                    hasMoreMessages &&
                    !loadingMore
                ) {
                    loadMoreMessages();
                }

                // Determine if we should scroll to bottom for new messages
                shouldScrollToBottom.current =
                    messageArea.scrollHeight -
                    messageArea.scrollTop -
                    messageArea.clientHeight;
                100;
            }
        };

        if (messageArea) {
            messageArea.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (messageArea) {
                messageArea.removeEventListener("scroll", handleScroll);
            }
        };
    }, [
        hasMoreMessages,
        loadingMore,
        loadMoreMessages,
        messageAreaRef,
        shouldScrollToBottom,
    ]);

    // Maintain scroll position when loading older messages
    useEffect(() => {
        // Only run this when loadingMore changes from true to false
        if (messageAreaRef.current && messages.length > 0 && !loadingMore) {
            // If we just loaded more messages, we want to maintain the user's relative scroll position
            if (loadingMore === false) {
                // We don't need to do anything special here as React will maintain the scroll position
                // relative to the previously visible content
            }
        }
    }, [loadingMore, messages]);

    // Handle scroll behavior after initial load
    useEffect(() => {
        if (messages.length > 0 && !loading && !loadingMore) {
            if (shouldScrollToBottom.current && messageEndRef.current) {
                messageEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [messages, loading, loadingMore, messageEndRef, shouldScrollToBottom]);

    return {};
}
