// Chatroom.jsx
import { useRef } from "react";
import useChatRoom from "@/Hooks/useChatRoom";
import ConfirmationModal from "../Modals/ConfirmationModal";
import ChatroomHeader from "./ChatroomHeader";
import ChatroomNavigation from "./ChatroomNavigation";
import MessageArea from "./Message/MessageArea";
import MessageInput from "./Message/MessageInput";
import { useLeaveChatroom } from "@/Hooks/useLeaveChatroom";
import { useScrollBehavior } from "@/Hooks/useScrollBehavior";

/**
 * Main Chatroom component that handles the chat interface
 */
export default function Chatroom({
    chatroom,
    user,
    onLeave,
    handleBackToPlayground,
}) {
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

    // Use extracted leave functionality
    const {
        showLeaveModal,
        setShowLeaveModal,
        leavingInProgress,
        confirmLeaveChatroom,
        handleLeaveChatroom,
    } = useLeaveChatroom(chatroom?.id, onLeave, handleBackToPlayground);

    // Use extracted scroll behavior
    useScrollBehavior(
        messageAreaRef,
        messageEndRef,
        shouldScrollToBottom,
        messages,
        loading,
        loadingMore,
        hasMoreMessages,
        loadMoreMessages
    );

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
