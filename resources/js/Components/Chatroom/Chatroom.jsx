import { useState, useEffect, useRef } from "react";
import ConfirmationModal from "../Modals/ConfirmationModal";
import MessageBubble from "./MessageBubble";
import axios from "axios";

export default function Chatroom({
    chatroom,
    user,
    onLeave,
    handleBackToPlayground,
}) {
    const [memberCount, setMemberCount] = useState(chatroom?.member_count || 0);

    // State for leave confirmation modal
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leavingInProgress, setLeavingInProgress] = useState(false);

    // State for pagination and infinite scrolling
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [oldestMessageId, setOldestMessageId] = useState(null);
    const [showHistorical, setShowHistorical] = useState(false);
    const messageAreaRef = useRef(null);
    const shouldScrollToBottom = useRef(true);

    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const messageEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Set up real-time event listeners for this chatroom
    useEffect(() => {
        if (!chatroom?.id) return;

        // Initial count from props
        setMemberCount(chatroom.member_count || 0);

        // Subscribe to private channel for this chatroom
        const channel = window.Echo.private(`chatroom-${chatroom.id}`);

        // Listen for user joined event
        channel.listen("UserJoinedChat", (e) => {
            console.log("User joined event received:", e);
            // Update member count
            setMemberCount(e.member_count);

            // Show join notification
            const joinMessage = {
                id: `join-${Date.now()}`,
                message: `${e.username} joined the chat`,
                system: true,
                sent_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, joinMessage]);
        });

        // Listen for user left event
        channel.listen("UserLeftChat", (e) => {
            console.log("User left event received:", e);
            // Update member count
            setMemberCount(e.member_count);

            // Show leave notification
            const leaveMessage = {
                id: `leave-${Date.now()}`,
                message: `${e.username} left the chat`,
                system: true,
                sent_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, leaveMessage]);
        });

        // Listen for messages
        channel.listen("MessageSent", (e) => {
            console.log("Message received:", e);

            // Add message to list
            const newMessage = {
                id: e.id,
                user_id: e.user_id,
                message: e.message,
                sent_at: e.sent_at,
            };

            setMessages((prev) => [...prev, newMessage]);
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
    }, [chatroom?.id]);

    // Fetch messages on component mount or when chatroom changes
    useEffect(() => {
        if (chatroom?.id) {
            // Reset message-related states when changing chatrooms
            setMessages([]);
            setHasMoreMessages(false);
            setOldestMessageId(null);
            setLoading(true);
            shouldScrollToBottom.current = true;

            fetchMessages();
        }
    }, [chatroom?.id]);

    // Handle scroll behavior after messages are loaded
    useEffect(() => {
        if (messages.length > 0 && !loading && !loadingMore) {
            if (shouldScrollToBottom.current) {
                messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [messages, loading, loadingMore]);

    // Setup scroll event listener for infinite scrolling
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
    }, [hasMoreMessages, loadingMore, oldestMessageId]);

    // Open the leave confirmation modal
    const confirmLeaveChatroom = () => {
        setShowLeaveModal(true);
    };

    // Actual leave chatroom function
    const handleLeaveChatroom = async () => {
        setLeavingInProgress(true);
        try {
            await axios.post("/api/leave-chatroom", {
                chat_room_id: chatroom.id,
            });

            if (onLeave) {
                onLeave();
            }

            // Navigate back to playground
            handleBackToPlayground();
        } catch (error) {
            console.error("Error leaving chatroom:", error);
        } finally {
            setLeavingInProgress(false);
            setShowLeaveModal(false);
        }
    };

    // Fetch initial messages
    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/messages/${chatroom.id}`, {
                params: {
                    page_size: 50,
                    show_historical: showHistorical,
                },
            });

            const data = response.data;
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
            const response = await axios.get(`/api/messages/${chatroom.id}`, {
                params: {
                    before_id: oldestMessageId,
                    page_size: 30,
                    show_historical: showHistorical,
                },
            });

            const data = response.data;

            // Preserve scroll position when loading older messages
            const messageArea = messageAreaRef.current;
            const scrollHeightBefore = messageArea?.scrollHeight || 0;

            // Update state with new messages
            setMessages((prevMessages) => [...data.messages, ...prevMessages]);
            setHasMoreMessages(data.has_more || false);
            setOldestMessageId(data.oldest_id);

            // Restore scroll position after adding messages
            if (messageArea && data.messages.length > 0) {
                setTimeout(() => {
                    const newScrollTop =
                        messageArea.scrollHeight -
                        scrollHeightBefore +
                        messageArea.scrollTop;
                    messageArea.scrollTop = newScrollTop;
                }, 10);
            }
        } catch (error) {
            console.error("Error loading more messages:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    // Toggle showing messages from before the user joined
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

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!inputMessage.trim()) return;

        try {
            const response = await axios.post("/api/send-message", {
                chat_room_id: chatroom.id,
                message: inputMessage,
            });

            // Add the new message to the local state
            setMessages((prevMessages) => [...prevMessages, response.data]);
            setInputMessage("");

            // Clear the typing indicator
            clearTimeout(typingTimeoutRef.current);
            setIsTyping(false);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

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

    const sendTypingEvent = async () => {
        try {
            await axios.post("/api/user-typing", {
                chat_room_id: chatroom.id,
            });
        } catch (error) {
            console.error("Error sending typing event:", error);
        }
    };

    const handleKeyDown = (e) => {
        // If Enter is pressed without Shift, send the message
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevent the default form submission
            handleSendMessage(e);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showLeaveModal}
                onClose={() => setShowLeaveModal(false)}
                onConfirm={handleLeaveChatroom}
                title={`Leave ${chatroom?.name}`}
                message={`Are you sure you want to leave "${chatroom?.name}"? You can always join back later.`}
                confirmText="Leave"
                cancelText="Cancel"
                confirmButtonClass="bg-red-500 hover:bg-red-600"
                isLoading={leavingInProgress}
            />

            {/* Chatroom Header */}
            <div className="bg-white border-b md:pl-4 pl-12 py-3 flex items-center justify-between shadow-sm">
                <div>
                    <h2 className="text-xl font-semibold">{chatroom.name}</h2>
                    <p className="text-sm text-gray-500">
                        {chatroom.description}
                    </p>
                </div>
                <div className="flex items-center space-x-2 pr-4">
                    <span className="text-sm text-gray-500">
                        {memberCount} members
                    </span>
                </div>
            </div>

            {/* Navigation bar */}
            <div className="bg-mute py-1 px-4 text-sm border-b flex items-center justify-between">
                <button
                    onClick={handleBackToPlayground}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Back to TeaHub
                </button>
                <button
                    onClick={confirmLeaveChatroom}
                    className="text-red-500 hover:text-red-700 text-sm"
                >
                    Leave Chatroom
                </button>
            </div>

            {/* Message Area - now with ref for scroll tracking */}
            <div
                ref={messageAreaRef}
                className="flex-1 bg-gray-50 p-4 overflow-y-auto"
            >
                {/* Historical messages toggle */}
                {hasMoreMessages || showHistorical ? (
                    <div className="text-center mb-2">
                        <button
                            onClick={toggleHistoricalMessages}
                            className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                        >
                            {showHistorical
                                ? "Hide older messages"
                                : "Show messages from before you joined"}
                        </button>
                    </div>
                ) : null}

                {/* Loading indicator for older messages */}
                {loadingMore && (
                    <div className="flex justify-center items-center py-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
                        <span className="ml-2 text-sm text-gray-500">
                            Loading earlier messages...
                        </span>
                    </div>
                )}

                {/* Main loading indicator */}
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-gray-500">
                            No messages yet. Start the conversation!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div key={message.id}>
                                {message.system ? (
                                    // System message (centered)
                                    <div className="flex justify-center">
                                        <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-500">
                                            {message.message}
                                        </div>
                                    </div>
                                ) : (
                                    // Regular user message (left or right aligned)
                                    <MessageBubble
                                        message={message}
                                        currentUser={user}
                                        formatTime={formatTime}
                                    />
                                )}
                            </div>
                        ))}

                        {/* Typing indicators */}
                        {Object.keys(typingUsers).length > 0 && (
                            <div className="flex items-start">
                                <div className="h-8 w-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                                <div className="ml-3 bg-white p-2 rounded-lg shadow-sm">
                                    <div className="flex space-x-1">
                                        <span className="animate-bounce">
                                            .
                                        </span>
                                        <span
                                            className="animate-bounce"
                                            style={{ animationDelay: "0.2s" }}
                                        >
                                            .
                                        </span>
                                        <span
                                            className="animate-bounce"
                                            style={{ animationDelay: "0.4s" }}
                                        >
                                            .
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messageEndRef} />
                    </div>
                )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t p-4 ">
                <form
                    onSubmit={handleSendMessage}
                    className="flex items-center"
                >
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={inputMessage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </form>
            </div>
        </div>
    );
}
