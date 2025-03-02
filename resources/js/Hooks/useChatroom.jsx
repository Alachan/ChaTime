import { useState, useEffect, useRef } from "react";
import ChatService from "@/Services/ChatService";
import { formatTypingIndicator } from "@/Utils/formatter";

/**
 * A custom useChatRoom hook for chatroom functionality
 *
 * @param {Object} chatroom - The chatroom object
 * @param {Object} user - The current user
 * @returns {Object} - Chat state and functions
 */
export default function useChatRoom(chatroom, user) {
    // States for pagination
    const [messages, setMessages] = useState([]);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [oldestMessageId, setOldestMessageId] = useState(null);
    const [showHistorical, setShowHistorical] = useState(false);
    const [loading, setLoading] = useState(true);
    // Refs for scrolling
    const messageEndRef = useRef(null);
    const shouldScrollToBottom = useRef(true);

    // Message input state
    const [inputMessage, setInputMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    // Typing users
    const [typingUsers, setTypingUsers] = useState({});

    // Member count
    const [memberCount, setMemberCount] = useState(chatroom?.member_count || 0);

    // Fetch messages when chatroom changes
    useEffect(() => {
        if (chatroom?.id) {
            // Reset states when changing chatrooms
            setMessages([]);
            setHasMoreMessages(false);
            setOldestMessageId(null);
            setLoading(true);
            shouldScrollToBottom.current = true;

            // Load messages
            fetchMessages();
        }
    }, [chatroom?.id]);

    // Fetch messages from the API
    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await ChatService.getMessages(chatroom.id, {
                page_size: 50,
                show_historical: showHistorical,
            });

            const data = response.data;

            // Use messages directly from API
            setMessages(data.messages || []);
            setHasMoreMessages(data.has_more || false);
            setOldestMessageId(data.oldest_id);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load older messages when scrolling up
    const loadMoreMessages = async () => {
        if (!hasMoreMessages || !oldestMessageId || loadingMore) return;

        setLoadingMore(true);
        try {
            const response = await ChatService.getMessages(chatroom.id, {
                before_id: oldestMessageId,
                page_size: 30,
                show_historical: showHistorical,
            });

            const data = response.data;

            setMessages((prevMessages) => [
                ...(data.messages || []),
                ...prevMessages,
            ]);
            setHasMoreMessages(data.has_more || false);
            setOldestMessageId(data.oldest_id);
        } catch (error) {
            console.error("Error loading more messages:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    // Toggle showing historical messages
    const toggleHistoricalMessages = () => {
        setShowHistorical(!showHistorical);
        setMessages([]);
        setOldestMessageId(null);
        setHasMoreMessages(false);
        setLoading(true);

        // Fetch messages with new historical setting
        setTimeout(() => {
            fetchMessages();
        }, 0);
    };

    // Send a message
    const sendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!inputMessage.trim()) return;

        try {
            const response = await ChatService.sendMessage(
                chatroom.id,
                inputMessage
            );

            // Add the new message to the local state
            const newMessage = {
                ...response.data,
                // Add the current user for display convenience
                user: user,
            };

            setMessages((prevMessages) => [...prevMessages, newMessage]);
            setInputMessage("");

            // Clear the typing indicator
            clearTimeout(typingTimeoutRef.current);
            setIsTyping(false);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Handle input changes and typing events
    const handleInputChange = (e) => {
        setInputMessage(e.target.value);

        // Only send typing event if not already typing
        if (!isTyping) {
            sendTypingEvent();
            setIsTyping(true);
        }

        // Clear previous timeout
        clearTimeout(typingTimeoutRef.current);

        // Set a new timeout to clear the typing state
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, 2000);
    };

    // Send a typing event
    const sendTypingEvent = async () => {
        try {
            await ChatService.sendTypingEvent(chatroom.id);
        } catch (error) {
            console.error("Error sending typing event:", error);
        }
    };

    // Handle Enter key to send message
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleLocalMessageDelete = (messageId) => {
        setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg.id !== messageId)
        );
    };

    // Set up real-time event listeners
    useEffect(() => {
        if (!chatroom?.id || !window.Echo) return;

        // Subscribe to the chatroom channel
        const channel = window.Echo.private(`chatroom-${chatroom.id}`);

        // Listen for user joined event
        channel.listen("UserJoinedChat", (e) => {
            console.log("User joined event received:", e);
            setMemberCount(e.member_count);
        });

        // Listen for user left event
        channel.listen("UserLeftChat", (e) => {
            console.log("User left event received:", e);
            setMemberCount(e.member_count);
        });

        // Listen for typing
        channel.listen("UserTyping", (e) => {
            console.log("User typing:", e);

            // Add user to typing users
            setTypingUsers((prev) => ({
                ...prev,
                [e.user_id]: {
                    username: e.username,
                    timestamp: Date.now(),
                },
            }));

            // Remove user after 3 seconds of no typing
            setTimeout(() => {
                setTypingUsers((prev) => {
                    const newTyping = { ...prev };
                    delete newTyping[e.user_id];
                    return newTyping;
                });
            }, 3000);
        });

        // Listen for new messages
        channel.listen("MessageSent", (e) => {
            console.log("Message received:", e);

            // Create message object from the event
            const newMessage = {
                id: e.id,
                user_id: e.user_id,
                message: e.message,
                message_type: e.message_type,
                sent_at: e.sent_at,
                user: e.user,
            };

            // Just add the message directly
            setMessages((prev) => [...prev, newMessage]);

            // If we need to do a separate API call to get more user info
            // we could do it here, but it's simpler to rely on the API
            // to include all necessary user data with messages
        });

        // Listen for message edits
        channel.listen("MessageEdited", (e) => {
            console.log("Message edited event:", e);

            // Update the message in our state
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === e.id
                        ? { ...msg, message: e.message, edited_at: e.edited_at }
                        : msg
                )
            );
        });

        // Listen for message deletions
        channel.listen("MessageDeleted", (e) => {
            console.log("Message deleted event received:", e);

            setMessages((prevMessages) =>
                prevMessages.filter((msg) => msg.id !== Number(e.id))
            );
        });

        // Cleanup function
        return () => {
            channel.stopListening("UserJoinedChat");
            channel.stopListening("UserLeftChat");
            channel.stopListening("UserTyping");
            channel.stopListening("MessageSent");
            channel.stopListening("MessageEdited");
            channel.stopListening("MessageDeleted");
        };
    }, [chatroom?.id, user?.id]);

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
        // Message data and functions
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

        handleLocalMessageDelete,

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
