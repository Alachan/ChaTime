import { useState, useEffect, useRef } from "react";
import useChatRoom from "@/Hooks/useChatRoom";
import ConfirmationModal from "../Modals/ConfirmationModal";
import ChatroomHeader from "./ChatroomHeader";
import ChatroomNavigation from "./ChatroomNavigation";
import MessageArea from "./Message/MessageArea";
import MessageInput from "./Message/MessageInput";
import ChatService from "@/Services/ChatService";
import axios from "axios";

export default function Chatroom({
    chatroom,
    user,
    onLeave,
    handleBackToPlayground,
}) {
    // State for leave confirmation modal
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leavingInProgress, setLeavingInProgress] = useState(false);

    // Reference to the message area for scrolling
    const messageAreaRef = useRef(null);

    // Use our custom hook for chat functionality
    const {
        messages,
        loading,
        loadingMore,
        hasMoreMessages,
        loadMoreMessages,
        inputMessage,
        handleInputChange,
        sendMessage,
        handleKeyDown,
        typingText,
        messageEndRef,
        shouldScrollToBottom,
        showHistorical,
        toggleHistoricalMessages,
        memberCount,
        handleLocalMessageDelete,
        handleLocalMessageEdit,
    } = useChatRoom(chatroom, user);

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
    }, [hasMoreMessages, loadingMore]);

    // Handle scroll behavior after messages are loaded
    useEffect(() => {
        if (messages.length > 0 && !loading && !loadingMore) {
            if (shouldScrollToBottom.current) {
                messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [messages, loading, loadingMore]);

    // Show the leave confirmation modal
    const confirmLeaveChatroom = () => {
        setShowLeaveModal(true);
    };

    // Actual leave chatroom function
    const handleLeaveChatroom = async () => {
        setLeavingInProgress(true);
        try {
            await ChatService.leaveChatroom(chatroom.id);

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
            <ChatroomHeader chatroom={chatroom} memberCount={memberCount} />

            {/* Navigation bar */}
            <ChatroomNavigation
                onBackClick={handleBackToPlayground}
                onLeaveChatroom={confirmLeaveChatroom}
            />

            {/* Message Area */}
            <MessageArea
                messages={messages}
                loading={loading}
                loadingMore={loadingMore}
                hasMoreMessages={hasMoreMessages}
                showHistorical={showHistorical}
                toggleHistoricalMessages={toggleHistoricalMessages}
                user={user}
                typingText={typingText}
                messageEndRef={messageEndRef}
                areaRef={messageAreaRef}
                onMessageDeleted={handleLocalMessageDelete}
                onMessageEdited={handleLocalMessageEdit}
            />

            {/* Message Input */}
            <MessageInput
                typingText={typingText}
                inputMessage={inputMessage}
                handleInputChange={handleInputChange}
                handleKeyDown={handleKeyDown}
                handleSendMessage={sendMessage}
            />
        </div>
    );
}
