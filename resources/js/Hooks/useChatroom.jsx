import { useState, useEffect, useRef } from "react";
import { useChatContext } from "@/Contexts/ChatContext";
import ChatService from "@/Services/ChatService";
import { formatTypingIndicator } from "@/Utils/formatter";

/**
 * A custom useChatRoom hook that uses the ChatContext
 *
 * @param {Object} chatroom - The chatroom object
 * @param {Object} user - The current user
 * @returns {Object} - Chat state and functions
 */
export default function useChatRoom(chatroom, user) {
    // Get chat context functions
    const { enrichMessageWithUserData, loadChatroomMembers } = useChatContext();

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

            // // Store the first_join flag in a variable
            // const firstJoin = chatroom.first_join;

            // // First load the messages
            // fetchMessages().then(() => {
            //     // After messages are loaded, add the welcome message if this is first join
            //     if (firstJoin) {
            //         // Add a welcome message
            //         const welcomeMessage = {
            //             id: `welcome-${Date.now()}`,
            //             message: `Welcome to ${chatroom.name}! Enjoy the new tea!`,
            //             system: true,
            //             sent_at: new Date().toISOString(),
            //         };

            //         setMessages((prev) => [...prev, welcomeMessage]);
            //     }
            // });
            // Load participants into cache
            loadChatroomMembers(chatroom.id);
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

            // Enrich messages with user data
            const enrichedMessages = (data.messages || []).map((message) =>
                enrichMessageWithUserData(message)
            );

            setMessages(enrichedMessages || []);
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
            // Enrich messages with user data
            const enrichedMessages = (data.messages || []).map((message) =>
                enrichMessageWithUserData(message)
            );

            setMessages((prevMessages) => [
                ...enrichedMessages,
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
            const newMessage = enrichMessageWithUserData({
                ...response.data,
                user_id: user.id, // Ensure user_id is set
            });

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

    // Set up real-time event listeners
    useEffect(() => {
        if (!chatroom?.id || !window.Echo) return;

        // Subscribe to the chatroom channel
        const channel = window.Echo.private(`chatroom-${chatroom.id}`);

        // Listen for user joined event
        channel.listen("UserJoinedChat", (e) => {
            console.log("User joined event received:", e);
            setMemberCount(e.member_count);

            // Create different messages based on who joined
            // const joinMessage = {
            //     id: `join-${Date.now()}`,
            //     message: `${e.username} joined the chat`,
            //     system: true,
            //     sent_at: new Date().toISOString(),
            // };

            // setMessages((prev) => [...prev, joinMessage]);

            // Refresh the entire members cache when a new user joins
            loadChatroomMembers(chatroom.id);
        });

        // Listen for user left event
        channel.listen("UserLeftChat", (e) => {
            console.log("User left event received:", e);
            setMemberCount(e.member_count);

            // Show leave notification
            // const leaveMessage = {
            //     id: `leave-${Date.now()}`,
            //     message: `${e.username} left the chat`,
            //     system: true,
            //     sent_at: new Date().toISOString(),
            // };
            // setMessages((prev) => [...prev, leaveMessage]);
        });

        channel.listen("MessageSent", (e) => {
            console.log("Message received:", e);

            // Create message object from the event
            const newMessage = {
                id: e.id,
                user_id: e.user_id,
                message: e.message,
                message_type: e.message_type,
                sent_at: e.sent_at,
            };

            // Enhance with user data from cache (for user messages)
            const enrichedMessage =
                e.message_type === "user"
                    ? enrichMessageWithUserData(newMessage)
                    : newMessage; // For system messages, no need to enrich

            // If we got Unknown User for a user message, refresh members cache and try again
            if (
                e.message_type === "user" &&
                enrichedMessage.user &&
                !enrichedMessage.user.name &&
                !enrichedMessage.user.username
            ) {
                // This is a missing user - refresh the cache
                loadChatroomMembers(chatroom.id).then(() => {
                    // Try enriching again with updated cache
                    const reEnrichedMessage =
                        enrichMessageWithUserData(newMessage);
                    setMessages((prev) => [...prev, reEnrichedMessage]);
                });
            } else {
                // User was in cache, add message normally
                setMessages((prev) => [...prev, enrichedMessage]);
            }
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

        // Cleanup function
        return () => {
            channel.stopListening("UserJoinedChat");
            channel.stopListening("UserLeftChat");
            channel.stopListening("MessageSent");
            channel.stopListening("UserTyping");
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
