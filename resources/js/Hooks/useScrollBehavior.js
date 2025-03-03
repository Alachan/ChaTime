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
    // Set up scroll event listener for infinite scrolling
    useEffect(() => {
        const messageArea = messageAreaRef.current;

        const handleScroll = () => {
            if (messageArea) {
                // If user scrolls to the top and we have more messages
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
                        messageArea.clientHeight <
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

    // Handle scroll behavior after messages are loaded
    useEffect(() => {
        if (messages.length > 0 && !loading && !loadingMore) {
            if (shouldScrollToBottom.current && messageEndRef.current) {
                messageEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [messages, loading, loadingMore, messageEndRef, shouldScrollToBottom]);
}
