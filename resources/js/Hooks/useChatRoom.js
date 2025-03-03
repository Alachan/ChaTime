import { useState, useRef } from "react";
import { formatTypingIndicator } from "@/Utils/formatter";
import { useMessageFetching } from "./useMessageFetching";
import { useMessageSending } from "./useMessageSending";
import { useMessageRealtime } from "./useMessageRealtime";

export default function useChatRoom(chatroom, user) {
    // Member count state
    const [memberCount, setMemberCount] = useState(chatroom?.member_count || 0);

    // Refs for scrolling
    const messageEndRef = useRef(null);
    const shouldScrollToBottom = useRef(true);

    // Typing users state
    const [typingUsers, setTypingUsers] = useState({});

    // Historical messages toggle
    const [showHistorical, setShowHistorical] = useState(false);

    // Use sub-hooks for specific functionalities
    const {
        messages,
        setMessages,
        loading,
        loadingMore,
        hasMoreMessages,
        loadMoreMessages,
        fetchMessages,
    } = useMessageFetching(chatroom?.id, showHistorical);

    // Message add handler for the sending hook
    const addMessageToState = (message) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            {
                ...message,
                user: user, // Add the current user for display convenience
            },
        ]);
    };

    const {
        inputMessage,
        setInputMessage,
        handleInputChange,
        sendMessage,
        handleKeyDown,
    } = useMessageSending(chatroom?.id, user?.id, addMessageToState);

    // Set up realtime updates
    useMessageRealtime(chatroom?.id, user?.id, {
        setMessages,
        setMemberCount,
        setTypingUsers,
    });

    // Local message operations
    const handleLocalMessageDelete = (messageId) => {
        setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg.id !== messageId)
        );
    };

    const handleLocalMessageEdit = (message) => {
        setMessages((prevMessages) =>
            prevMessages.map((msg) =>
                msg.id === message.id
                    ? {
                          ...msg,
                          message: message.message,
                          edited_at: message.edited_at,
                      }
                    : msg
            )
        );
    };

    // Toggle showing historical messages
    const toggleHistoricalMessages = () => {
        setShowHistorical(!showHistorical);
    };

    // Get list of currently typing users
    const getTypingUsernames = () => {
        return Object.values(typingUsers)
            .map((user) => user.username)
            .filter(Boolean);
    };

    // Compute the typing indicator text
    const typingUsernames = getTypingUsernames();
    const typingText = formatTypingIndicator(typingUsernames);

    return {
        // Message data
        messages,
        loading,
        loadingMore,
        hasMoreMessages,
        loadMoreMessages,

        // User input
        inputMessage,
        setInputMessage,
        handleInputChange,
        sendMessage,
        handleKeyDown,

        // Message operations
        handleLocalMessageDelete,
        handleLocalMessageEdit,

        // Display helpers
        typingText,

        // Refs
        messageEndRef,
        shouldScrollToBottom,

        // Historical messages
        showHistorical,
        toggleHistoricalMessages,

        // Member count
        memberCount,
    };
}
